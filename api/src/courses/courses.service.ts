import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseInput, EditCourseInput } from './dto/CourseDTO';
import { join } from 'path';
import { QuizService } from 'src/quiz/quiz.service';
import { simpleUser } from 'src/auth/dto/signup-response';
import { Moderator, Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaginationDto } from 'src/utils/pagination.dto';
import { PAGINATION_SIZE } from 'src/utils/pagination.settings';
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
    ) {}

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
                        `image-${i}.${
                            course.text[i].value == 'jpg'
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

        for (let courseItem of courseItemsToAdd) {
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

    async addCourse(course: CourseInput, user: simpleUser) {
        if (!user.verified) {
            throw new Error('User is not verified');
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
            },
        });

        await this.processCourse(course, newCourse.id);

        await this.createSummary(newCourse.id);

        return await this.prismaService.course.findUnique({
            where: {
                id: newCourse.id,
            },
            include: {
                text: true,
            },
        });
    }

    private async createSummary(courseId:string){
        const course = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
            include: {
                text: true,
            },
        });
        const text = course.text.filter((t=>t.type=="text")).map((item) => item.value).join(' ');
        const response =await this.openai.chat.completions.create({
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
                        'Please summarize the text in a few sentences.',
                },
            ],
            model: 'gpt-3.5-turbo',
            response_format: { type: 'text' },
        });

        await this.prismaService.course.update({
            where:{
                id:courseId
            },
            data:{
                summary:response.choices[0].message.content
            }
        })

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

        await this.createSummary(course.id);
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
        const { page, search } = paginationDto;

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
                skip: (page - 1) * PAGINATION_SIZE,
                take: PAGINATION_SIZE,
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
            skip: (page - 1) * PAGINATION_SIZE,
            take: PAGINATION_SIZE,
        });
        await this.cacheManager.set('all_courses/' + page, courses);
        return courses;
    }

    async getCoursesCount(paginationDto: PaginationDto) {
        const { search } = paginationDto;

        if (search) {
            const count = await this.prismaService.course.count({
                where: {
                    verified: true,
                    name: {
                        contains: search,
                    },
                },
            });

            return { count, size: PAGINATION_SIZE };
        }

        const coursesCountCached = await this.cacheManager.get('courses_count');

        if (coursesCountCached) {
            return {
                count: coursesCountCached,
                size: PAGINATION_SIZE,
            };
        }

        const count = await this.prismaService.course.count({
            where: {
                verified: true,
            },
        });

        await this.cacheManager.set('courses_count', count);

        return { count, size: PAGINATION_SIZE };
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
        const course = await this.prismaService.course.update({
            where: {
                id: courseId,
            },
            data: {
                verified: true,
            },
        });
        await this.quizService.addQuizToDataBase(courseId);
        await this.cacheManager.del('my_courses/' + course.creatorId);
        await this.cacheManager.del('unverified_courses/' + course.moderatorId);
        const keys = await this.cacheManager.store.keys();
        const cachesToDelete = [];
        for (let key of keys) {
            if (key.includes('all_courses')) {
                cachesToDelete.push(this.cacheManager.del(key));
            }
        }
        await Promise.all(cachesToDelete);
        return course;
    }

    async getDashboardCourses(){
        const cachedCourses = await this.cacheManager.get('dashboard_courses');
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
            take: 5,
        });

        await this.cacheManager.set('dashboard_courses', courses);
        return courses;
    }
}
