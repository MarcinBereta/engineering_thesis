import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseInput, EditCourseInput } from './dto/CourseDTO';
import { join } from 'path';
import { QuizService } from 'src/quiz/quiz.service';
import { simpleUser } from 'src/auth/dto/signup-response';
import { Category, Moderator, Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaginationDto } from 'src/utils/pagination.dto';
import { PAGINATION_SIZE_COURSES } from 'src/utils/pagination.settings';
import OpenAI from 'openai';

@Injectable()
export class CoursesService {
    private openai = new OpenAI({
        apiKey: process.env.OPEN_API_KEY,
    });
    constructor(
        private prismaService: PrismaService,
        private quizService: QuizService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) { }

    async processCourse(course: EditCourseInput | CourseInput, id: string) {
        const courseItemsToAdd = [];
        for (let i = 0; i < course.text.length; i++) {
            const src = course.text[i];
            if (src.type == 'photo') {
                if (src.value.includes('files/courses/')) {
                    courseItemsToAdd.push({
                        type: 'photo',
                        value: src.value,
                        id: src.id,
                    });
                } else {
                    const fileName = join(
                        `public/${id}`,
                        `image-${i}.${course.text[i].value == 'jpg'
                            ? 'jpeg'
                            : course.text[i].value
                        }`
                    );

                    courseItemsToAdd.push({
                        type: 'photo',
                        value: fileName,
                    });
                }
            } else {
                courseItemsToAdd.push({
                    type: 'text',
                    value: src.value,
                });
            }
        }

        for (const courseItem of courseItemsToAdd) {
            if (
                courseItem.type == 'photo' &&
                courseItem.value.includes('files/courses/')
            ) {
                await this.prismaService.courseItem.create({
                    data: {
                        type: courseItem.type,
                        value: courseItem.value,
                        id: courseItem.id,
                        course: {
                            connect: {
                                id: id,
                            },
                        },
                    },
                });
            } else {
                const addedCourseItem =
                    await this.prismaService.courseItem.create({
                        data: {
                            type: courseItem.type,
                            value: courseItem.value,
                            course: {
                                connect: {
                                    id: id,
                                },
                            },
                        },
                    });
                if (addedCourseItem.type == 'photo') {
                    await this.prismaService.courseItem.update({
                        where: {
                            id: addedCourseItem.id,
                        },
                        data: {
                            value:
                                'files/courses/' +
                                addedCourseItem.id +
                                '.' +
                                addedCourseItem.value.split('.')[1],
                        },
                    });
                }
            }
        }
    }

    async getCourseById(id: string) {
        return await this.prismaService.course.findUnique({
            where: {
                id: id,
            },
            include: {
                text: true,
                creator: true,
            },
        });
    }

    async addCourse(course: CourseInput, user: simpleUser) {
        if (!user.verified) {
            throw new Error('User is not verified');
        }
        if (course.category == null || (course.category as string) == '') {
            throw new Error('Category is required');
        }
        const moderators = await this.prismaService.moderator.findMany({
            where: {
                categories: {
                    has: course.category,
                },
            },
        });

        let moderator: Moderator;
        if (moderators.length > 0) {
            moderator =
                moderators[Math.floor(Math.random() * moderators.length)];
        } else {
            const query = Prisma.sql`
      select * from "Moderator" order by array_length(categories, 1) desc limit 1`;
            moderator = (await this.prismaService.$queryRaw(query))[0];
        }
        const newCourse = await this.prismaService.course.create({
            data: {
                name: course.name,
                creatorId: user.id,
                category: course.category,
                moderatorId: moderator.id,
                language: course.language,
            },
        });

        await this.processCourse(course, newCourse.id);
        await this.createSummaryAndTag(newCourse.id);

        return await this.prismaService.course.findUnique({
            where: {
                id: newCourse.id,
            },
            include: {
                text: true,
            },
        });
    }

    private async getAndCheckOptions(
        category: string,
        getOrCheck: boolean,
        tag: string
    ) {
        // true for get, false for check
        let specificOptions = '';
        switch (category) {
            case 'MATH':
                specificOptions =
                    'Algebra, Analytics, Statistics, Probability, Trigonometric, Other';
                break;
            case 'HISTORY':
                specificOptions =
                    'Prehistory, Antiquity, Middle Ages, Modern period, Contemporary period, Wars and conflicts, Historical Figures, Other';
                break;
            case 'GEOGRAPHY':
                specificOptions =
                    'Social, Economic, Political, Cartography, Climatology, Other';
                break;
            case 'ENGLISH':
                specificOptions =
                    'Grammar, Vocabluary, Culture, Writing, Reading, Conversations, Other';
                break;
            case 'ART':
                specificOptions =
                    'Painting, Sculpture, Architecture, Literature, Music, Theatre, Other';
                break;
            case 'SPORTS':
                specificOptions =
                    'Individual, Team, Water, Winter, Motor, Extreme, Other';
                break;
            case 'SCIENCE':
                specificOptions =
                    'Physics, Chemisrty, Biology, Astronomy, Earth, Environment, Other';
                break;
            case 'MUSIC':
                specificOptions =
                    'Rock, Pop, Classical, Dance, Country, Jazz, Rap, HipHop, Other';
                break;
            case 'OTHER':
                specificOptions = 'Other';
                break;
            default:
                specificOptions = 'Other';
                break;
        }
        if (getOrCheck) {
            return specificOptions;
        } else {
            // check if tag is in specific options
            if (specificOptions.includes(tag)) {
                return tag;
            } else {
                return 'Other';
            }
        }
    }

    private async createSummaryAndTag(courseId: string) {
        const course = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
            include: {
                text: true,
            },
        });

        const category = course.category;
        const choices = await this.getAndCheckOptions(category, true, '');
        const language = course.language;
        const text = course.text
            .filter((t) => t.type == 'text')
            .map((item) => item.value)
            .join(' ');
        const response = await this.openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful assistant designed to summary the text.',
                },
                { role: 'user', content: text },
                {
                    role: 'assistant',
                    content:
                        'Please summarize the text in a few sentences. (max length: 200 characters)' +
                        ' The text is in ' + language + ' language.',
                },
            ],
            model: 'gpt-4o-mini',
            response_format: { type: 'text' },
        });

        let summary = '';
        summary += response.choices[0].message.content;

        const response_tag = await this.openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful assistant designed to choose tag from the following options.',
                },
                { role: 'user', content: text },
                {
                    role: 'assistant',
                    content:
                        'Choose tag for this text from the following options: ' +
                        choices +
                        ' . (Write only tag)',
                },
            ],
            model: 'gpt-4o-mini',
            response_format: { type: 'text' },
        });

        let tag = '';
        tag += response_tag.choices[0].message.content;
        const check_tag = await this.getAndCheckOptions(category, false, tag);
        await this.prismaService.course.update({
            where: {
                id: courseId,
            },
            data: {
                summary: summary,
                tag: check_tag,
            },
        });
    }

    async editCourse(course: EditCourseInput, user: simpleUser) {
        if (!user.verified) {
            throw new Error('User is not verified');
        }
        const courseToEdit = await this.prismaService.course.findUnique({
            where: {
                id: course.id,
            },
        });

        if (courseToEdit.creatorId !== user.id) {
            throw new Error('User is not the creator of the course');
        }

        await this.prismaService.course.update({
            where: {
                id: course.id,
            },
            data: {
                name: course.name,
                category: course.category,
                language: course.language,
                verified: false
            },
        });

        await this.prismaService.courseItem.deleteMany({
            where: {
                courseId: course.id,
            },
        });



        await this.processCourse(course, course.id);
        if (courseToEdit.verified) {
            await this.quizService.deleteQuestionAndQuiz(course.id);
            await this.quizService.addQuizToDataBase(course.id);
        }

        await this.cacheManager.del('all_courses');
        await this.cacheManager.del('my_courses/' + user.id);
        await this.cacheManager.del(
            'unverified_courses/' + courseToEdit.moderatorId
        );

        await this.createSummaryAndTag(course.id);
        return await this.prismaService.course.findUnique({
            where: {
                id: course.id,
            },
            include: {
                text: true,
            },
        });
    }

    async getAllCoursesWithPagination(paginationDto: PaginationDto) {
        const { page, search, category } = paginationDto;
        if (search) {
            const courses = await this.prismaService.course.findMany({
                include: {
                    text: true,
                },
                where: {
                    verified: true,
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                skip: (page - 1) * PAGINATION_SIZE_COURSES,
                take: PAGINATION_SIZE_COURSES,
            });
            return courses;
        }
        if (category) {
            const courses = await this.prismaService.course.findMany({
                include: {
                    text: true,
                },
                where: {
                    verified: true,
                    category: category as Category,
                },
                skip: (page - 1) * PAGINATION_SIZE_COURSES,
                take: PAGINATION_SIZE_COURSES,
            });
            return courses;
        }

        const cachedCourses = await this.cacheManager.get(
            'all_courses/' + page
        );
        if (cachedCourses) {
            return cachedCourses;
        }

        const courses = await this.prismaService.course.findMany({
            include: {
                text: true,
            },
            where: {
                verified: true,
            },
            skip: (page - 1) * PAGINATION_SIZE_COURSES,
            take: PAGINATION_SIZE_COURSES,
        });

        await this.cacheManager.set('all_courses/' + page, courses);
        return courses;
    }

    async getCoursesCount(paginationDto: PaginationDto) {
        const { search, category } = paginationDto;

        if (search) {
            const count = await this.prismaService.course.count({
                where: {
                    verified: true,
                    name: {
                        contains: search,
                    },
                },
            });

            return { count, size: PAGINATION_SIZE_COURSES };
        }
        if (category) {
            const count = await this.prismaService.course.count({
                where: {
                    verified: true,
                    category: category as Category,
                },
            });

            return { count, size: PAGINATION_SIZE_COURSES };
        }
        const count = await this.prismaService.course.count({
            where: {
                verified: true,
            },
        });

        const coursesCountCached = await this.cacheManager.get('courses_count');

        if (coursesCountCached && (coursesCountCached as number) === count) {
            return {
                count: coursesCountCached,
                size: PAGINATION_SIZE_COURSES,
            };
        }

        await this.cacheManager.set('courses_count', count);

        return { count, size: PAGINATION_SIZE_COURSES };
    }

    async getAllCourses() {
        const cachedCourses = await this.cacheManager.get('all_courses');
        if (cachedCourses) {
            return cachedCourses;
        }
        const courses = await this.prismaService.course.findMany({
            include: {
                text: true,
            },
            where: {
                verified: true,
            },
        });

        await this.cacheManager.set('all_courses', courses);
        return courses;
    }

    async getMyCourses(id: string) {
        const cachedCourses = await this.cacheManager.get('my_courses/' + id);
        if (cachedCourses) {
            return cachedCourses;
        }

        const courses = await this.prismaService.course.findMany({
            where: {
                creatorId: id,
            },
            include: {
                text: true,
            },
        });

        await this.cacheManager.set('my_courses/' + id, courses);

        return courses;
    }

    async getUnVerifiedCourses(userId: string) {
        await this.cacheManager.del('unverified_courses/' + userId); //temporary
        const cachedCourses = await this.cacheManager.get(
            'unverified_courses/' + userId
        );

        if (cachedCourses) {
            return cachedCourses;
        }
        const courses = await this.prismaService.course.findMany({
            where: {
                verified: false,
                moderator: {
                    userId: userId,
                },
            },
            include: {
                text: true,
            },
        });

        await this.cacheManager.set('unverified_courses/' + userId, courses);

        return courses;
    }

    async verifyCourse(courseId: string) {
        const courseToVerify = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
        });

        if (courseToVerify.verified) {
            throw new Error('Course is already verified');
        }

        await this.quizService.addQuizToDataBase(courseId);
        const course = await this.prismaService.course.update({
            where: {
                id: courseId,
            },
            data: {
                verified: true,
            },
        });

        const moderator = await this.prismaService.moderator.findUnique({
            where: {
                id: course.moderatorId,
            },
        });

        await this.cacheManager.del('my_courses/' + course.creatorId);
        await this.cacheManager.del('unverified_courses/' + moderator.userId);
        await this.cacheManager.del('dashboard_courses');

        const keys = await this.cacheManager.store.keys();
        const cachesToDelete = [];
        for (const key of keys) {
            if (key.includes('all_courses')) {
                cachesToDelete.push(this.cacheManager.del(key));
            }
        }
        await Promise.all(cachesToDelete);
        return course;
    }

    async declineCourse(courseId: string) {
        const courseToVerify = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
        });

        if (courseToVerify.verified) {
            throw new Error('Course is already verified');
        }

        await this.prismaService.courseItem.deleteMany({
            where: {
                courseId: courseId,
            },
        })

        const course = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
        });

        await this.prismaService.course.delete({
            where: {
                id: courseId,
            },
        });

        const moderator = await this.prismaService.moderator.findUnique({
            where: {
                id: course.moderatorId,
            },
        });

        await this.cacheManager.del('my_courses/' + course.creatorId);
        await this.cacheManager.del('unverified_courses/' + moderator.userId);
        return course;
    }


    async getDashboardCourses() {
        const cachedCourses = await this.cacheManager.get('dashboard_courses');
        if (cachedCourses && (cachedCourses as any[]).length == 4) {
            return cachedCourses;
        }
        const courses = await this.prismaService.course.findMany({
            include: {
                text: true,
                creator: true,
            },
            where: {
                verified: true,
                AND: [
                    {
                        name: {
                            not: {
                                endsWith: 'general',
                            },
                        },
                    },
                    {
                        name: {
                            not: {
                                endsWith: 'true/false',
                            },
                        },
                    },
                    {
                        name: {
                            not: {
                                endsWith: 'specific',
                            },
                        },
                    },
                    {
                        name: {
                            not: {
                                endsWith: 'multiple',
                            },
                        },
                    },
                ],
            },
            take: 2,
        });
        await this.cacheManager.set('dashboard_courses', courses);
        return courses;
    }

    async getRandomCourseNotPlayed(userID: string) {
        const randomCourseNotPlayedId = await this.prismaService.$queryRaw`
        select id from "Course" where id not in ( select "courseId" from "Quiz" where id in (
            select "quizId" from "UserScores" where "userId" = ${userID}
            ) )order by (
            select count(*) from "UserScores" where "quizId" = (select id from "Quiz" where "courseId" = "Course"."id")
        ) desc limit 1`;

        const randomCourse = await this.prismaService.course.findMany({
            include: {
                text: true,
            },
            where: {
                id: randomCourseNotPlayedId[0].id,
                verified: true,
            },
            take: 1,
        });
        return randomCourse;
    }

    async getRandomCourse() {
        const randomId = await this.prismaService
            .$queryRaw`select id from "Course" order by random() limit 1`;
        try {
            const randomCourse = await this.prismaService.course.findMany({
                include: {
                    text: true,
                },
                where: {
                    verified: true,
                    id: randomId[0].id,
                },
                take: 1,
            });
            return randomCourse;
        }
        catch (e) {
            console.log('Failed to find any random course');
            return null;
        }
    }

    async getBestCategoryFromLast5days(userID: string) {
        return await this.prismaService.$queryRaw`
        select "category" from "Course" where id in ( select "courseId" from "Quiz" where id in (
            select "quizId" from "UserScores" where "userId" = ${userID} and "createdAt" > now() - interval '5 days'
            )) group by "category" order by count(*) desc limit 1`;
    }

    async getBestTagFromLast5days(userID: string, category: string) {
        return await this.prismaService.$queryRaw`
        select "tag" from "Course" where category::text = ${category} and id in ( select "courseId" from "Quiz" where id in (
            select "quizId" from "UserScores" where "userId" = ${userID} and "createdAt" > now() - interval '5 days'
            )) group by "tag" order by count(*) desc limit 1`;
    }

    async getBestCategory(userID: string) {
        return await this.prismaService.$queryRaw`
        select "category" from "Course" where id in ( select "courseId" from "Quiz" where id = (
            select "quizId" from "UserScores" where "userId" = ${userID} limit 1
            )) group by "category" order by count(*) desc limit 1`;
    }

    async getBestTag(userID: string, category: string) {
        const result = await this.prismaService.$queryRaw`
            select "tag" from "Course" where category::text = ${category} and id in (
                select "courseId" from "Quiz" where id = (
                    select "quizId" from "UserScores" where "userId" = ${userID} limit 1
                )
            ) group by "tag" order by count(*) desc limit 1`;
        return result;
    }

    async getMostPopularCourseByCategory(userID: string, category: string) {
        try {
            const verifiedCourses = await this.prismaService.$queryRaw`
                select id from "Course" where category::text = ${category} and verified = true`;

            const userQuizzes = await this.prismaService.$queryRaw`
                select "quizId" from "UserScores" where "userId" = ${userID}`;

            const coursesNotTakenByUser = await this.prismaService.$queryRaw`
                select id from "Course" where id not in (
                    select "courseId" from "Quiz" where id in (${Prisma.join((userQuizzes as { quizId: string }[]).map(q => q.quizId))})
                ) and category::text = ${category} and verified = true`;

            if ((coursesNotTakenByUser as any[]).length === 0) {
                console.log("No courses not taken by user found");
                return null;
            }
            const mostPopularCourseByCategoryId = await this.prismaService.$queryRaw`
                select id from "Course" where id in (${Prisma.join((coursesNotTakenByUser as { id: string }[]).map(c => c.id))})
                order by (
                    select count(*) from "UserScores" where "quizId" in (
                        select id from "Quiz" where "courseId" = "Course"."id"
                    )
                ) desc limit 1`;

            if ((mostPopularCourseByCategoryId as any[]).length !== 0) {
                const mostPopularCourseByCategory = await this.prismaService.course.findMany({
                    include: {
                        text: true,
                    },
                    where: {
                        id: mostPopularCourseByCategoryId[0].id,
                    },
                });
                return mostPopularCourseByCategory;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
    async getMostPopularCourse(userId: string, tag: string, category: string) {
        try {
            console.log("Searching for most popular course by tag");
            const userQuizzes = await this.prismaService.$queryRaw`
                select "quizId" from "UserScores" where "userId" = ${userId}`;
            console.log(tag);
            console.log(userQuizzes);

            const first = await this.prismaService.$queryRaw`
            select id from "Course" where category::text = ${category} and tag::text = ${tag} and verified = true`
            console.log(first);
            const coursesNotTakenByUser = await this.prismaService.$queryRaw`
                select id from "Course" where id not in (
                    select "courseId" from "Quiz" where id in (${Prisma.join((userQuizzes as { quizId: string }[]).map(q => q.quizId))})
                ) and category::text = ${category} and tag::text = ${tag} and verified = true`;

            if ((coursesNotTakenByUser as any[]).length === 0) {
                console.log("No courses not taken by user found");
                return null;
            }
            const mostPopularCourseId = await this.prismaService.$queryRaw`
                select id from "Course" where id in (${Prisma.join((coursesNotTakenByUser as { id: string }[]).map(c => c.id))})
                order by (
                    select count(*) from "UserScores" where "quizId" in (
                        select id from "Quiz" where "courseId" = "Course"."id"
                    )
                ) desc limit 1`;
            if ((mostPopularCourseId as any[]).length !== 0) {
                const mostPopularCourse = await this.prismaService.course.findMany({
                    include: {
                        text: true,
                    },
                    where: {
                        id: mostPopularCourseId[0].id,
                        verified: true,
                    },
                });
                return mostPopularCourse;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
    async getMostFitCourse(userID: string) {
        let randomCourse: any[];
        try {
            randomCourse = await this.getRandomCourseNotPlayed(userID);
        } catch (e) {
            console.log('Failed to find random course');
            randomCourse = await this.getRandomCourse();
            console.log(randomCourse);
        }
        try {
            //get most popular category by user with userID from past 5 days
            const bestCategoryFromLast5days =
                await this.getBestCategoryFromLast5days(userID);
            // get tag with most games played in Category by user with userID from past 5 days
            console.log(`${bestCategoryFromLast5days[0].category}`);
            const bestTagFromLast5days = await this.getBestTagFromLast5days(
                userID,
                bestCategoryFromLast5days[0].category
            );
            console.log(`${bestTagFromLast5days[0].tag}`);
            if ((bestTagFromLast5days as any[]).length == 0) {
                const mostPopularCourseByCategoryFromLast5days =
                    await this.getMostPopularCourseByCategory(
                        userID,
                        bestCategoryFromLast5days[0].category
                    );
                if (mostPopularCourseByCategoryFromLast5days != null) {
                    console.log(mostPopularCourseByCategoryFromLast5days);
                    return mostPopularCourseByCategoryFromLast5days;
                }
            }
            // get most popular course (most games played) for this tag, but user didn't play it, but if not course with tag check only by category
            const mostPopularCourseFromLast5days =
                await this.getMostPopularCourse(
                    userID,
                    bestTagFromLast5days[0].tag,
                    bestCategoryFromLast5days[0].category
                );
            console.log(mostPopularCourseFromLast5days);
            if (mostPopularCourseFromLast5days != null) {
                return mostPopularCourseFromLast5days;
            }
            else {
                const mostPopularCourseByCategoryFromLast5days =
                    await this.getMostPopularCourseByCategory(
                        userID,
                        bestCategoryFromLast5days[0].category
                    );
                if (mostPopularCourseByCategoryFromLast5days != null) {
                    console.log(mostPopularCourseByCategoryFromLast5days);
                    return mostPopularCourseByCategoryFromLast5days;
                }
            }
        } catch (e) {
            console.log('Failed to find most popular course from last 5 days');
        }
        try {
            console.log('Not get any course from last 5 days');
            // get category with most games played by user with userID of all time
            const bestCategory = await this.getBestCategory(userID);
            if ((bestCategory as unknown as any[]).length == 0) {
                return randomCourse;
            }
            // get tag with most games played in Category by user with userID
            const bestTag = await this.getBestTag(userID, bestCategory[0].category);
            if ((bestTag as unknown as any[]).length == 0) {
                const mostPopularCourseByCategory =
                    await this.getMostPopularCourseByCategory(
                        userID,
                        bestCategory[0].category
                    );
                if (mostPopularCourseByCategory == null) {
                    return randomCourse;
                }
                return randomCourse;
            }
            console.log(bestTag[0].tag);
            // get most popular course (most games played) for this tag, but user didn't play it, but if not course with tag check only by category of all time
            const mostPopularCourse = await this.getMostPopularCourse(
                userID,
                bestTag[0].tag,
                bestCategory[0].category
            );
            console.log(mostPopularCourse)
            if (mostPopularCourse == null) {
                const mostPopularCourseByCategory =
                    await this.getMostPopularCourseByCategory(
                        userID,
                        bestCategory[0].category
                    );
                console.log(mostPopularCourseByCategory)
                if (mostPopularCourseByCategory == null) {
                    return randomCourse;
                }
                return mostPopularCourseByCategory;
            }
            return mostPopularCourse;
        } catch (e) {
            return randomCourse;
        }
    }
}
