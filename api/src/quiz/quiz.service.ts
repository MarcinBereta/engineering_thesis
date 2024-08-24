import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Quiz } from './dto/quiz.dto';
import { AddScore } from './dto/addScore.dto';
import OpenAI from 'openai';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaginationDto } from 'src/utils/pagination.dto';
import { PAGINATION_SIZE } from 'src/utils/pagination.settings';
import { Prisma } from '@prisma/client';
import { DashboardQuiz } from './dto/quiz.dashboard';
@Injectable()
export class QuizService {
    private openai = new OpenAI({
        apiKey: process.env.OPEN_API_KEY,
    });
    constructor(
        private prismaService: PrismaService,

        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) { }

    async getQuizById(id: string): Promise<Quiz> {
        const cachedQuiz = await this.cacheManager.get<Quiz>(`quiz/${id}`);
        if (cachedQuiz) {
            return cachedQuiz;
        }

        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                id: id,
            },
            include: {
                questions: true,
                UserScores: true,
            },
        });

        if (quiz) {
            await this.cacheManager.set(`quiz/${id}`, quiz);
        }

        return quiz;
    }

    async getDashboardQuizzes(): Promise<Quiz[]> {
        const rawQuery = Prisma.sql`select q.id, q.name, c.category from "Quiz" q inner join "Course" C on q."courseId" = C.id order by (select count(*) as count from "UserScores" u where u."quizId"  = q.id) desc limit 5`;
        const quizzesRaw: DashboardQuiz[] =
            await this.prismaService.$queryRaw(rawQuery);

        const quizzes = await this.prismaService.quiz.findMany({
            where: {
                id: {
                    in: quizzesRaw.map((q) => q.id),
                },
            },
            include: {
                questions: true,
                UserScores: true,
                course: true,
            },
        });
        console.log(quizzes);
        return quizzes;
    }

    async getQuizzesWithPagination(pagination: PaginationDto) {
        const { search, page } = pagination;

        if (search) {
            return await this.prismaService.quiz.findMany({
                where: {
                    name: {
                        contains: search,
                    },
                },
                include: {
                    questions: true,
                    UserScores: true,
                    course: true,
                },
                skip: page,
                take: PAGINATION_SIZE,
            });
        }

        const cachedQuizzes = await this.cacheManager.get<Quiz[]>(
            'all_quizzes/' + page
        );
        if (cachedQuizzes) {
            return cachedQuizzes;
        }

        const quizzes = await this.prismaService.quiz.findMany({
            include: {
                questions: true,
                UserScores: true,
                course: true,
            },
            skip: (page - 1) * PAGINATION_SIZE,
            take: PAGINATION_SIZE,
        });

        if (quizzes) {
            await this.cacheManager.set('all_quizzes/' + page, quizzes);
        }

        return quizzes;
    }

    async getQuizzesCountWithPagination(pagination: PaginationDto) {
        const { search } = pagination;

        if (search) {
            const count = await this.prismaService.quiz.count({
                where: {
                    name: {
                        contains: search,
                    },
                },
            });

            return { count, size: PAGINATION_SIZE };
        }

        const cachedCount =
            await this.cacheManager.get<number>('quizzes_count');
        if (cachedCount) {
            return { count: cachedCount, size: PAGINATION_SIZE };
        }

        const count = await this.prismaService.quiz.count();

        if (count) {
            await this.cacheManager.set('quizzes_count', count);
        }

        return { count, size: PAGINATION_SIZE };
    }

    async getAllQuizzes(): Promise<Quiz[]> {
        const cachedQuizzes =
            await this.cacheManager.get<Quiz[]>('all_quizzes');

        if (cachedQuizzes) {
            return cachedQuizzes;
        }

        const quizzes = await this.prismaService.quiz.findMany({
            include: {
                questions: true,
                UserScores: true,
            },
        });

        if (quizzes) {
            await this.cacheManager.set('all_quizzes', quizzes);
        }

        return quizzes;
    }

    async checkCourseExistence(courseId: string): Promise<boolean> {
        const course = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
        });
        return course != null;
    }

    async mergeTexts(courseId: string): Promise<string> {
        const course = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
            include: {
                text: true,
            },
        });
        let mergedText = '';
        course.text.forEach((text) => {
            if (text.type === 'text') {
                mergedText += text.value;
            }
        });
        return mergedText;
    }
    async getCourseName(courseId: string): Promise<string> {
        const course = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
        });
        return course.name;
    }
    async getNumberOfQuestions(textLenght: number, baseLength: number = 2000): Promise<number> {
        if (textLenght < baseLength) {
            return 10;
        }
        return Math.min(Math.floor(textLenght / 1000) + 10, 20); // for longer courses we add more questions
    }

    async generateQuestions(courseId: string): Promise<string> {
        const mergedText: string = await this.mergeTexts(courseId);
        let courseLength = mergedText.length;
        let numberOfQuestions = 0;
        numberOfQuestions = await this.getNumberOfQuestions(courseLength);
        console.log(numberOfQuestions);
        const courseBasic = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
        });
        const category = courseBasic.category;
        console.log(category);

        // depends on category we can add some specific parameters to API
        let specificParameters = '';
        switch (category) {
            case 'MATH':
                specificParameters = 'When topic of course is about something specific like algebra, geometry, calculus, etc. you can create task to calculate something based on the text above. For example: Calculate the area of the triangle with sides 3, 4, 5. ';
                break;
            case 'HISTORY':
                specificParameters = 'Please do not add to many questions with dates. Be more specific about events and people.';
                break;
            case 'GEOGRAPHY':
                specificParameters = 'Be concise and specific about locations and events depending on the course.';
                break;
            case 'ENGLISH':
                specificParameters = 'Please add questions about grammar, vocabulary, literature, etc. based on the text above.';
                break;
            case 'ART':
                specificParameters = 'Please add questions about art history, techniques, artists, etc. based on the text above.';
                break;
            case 'SPORTS':
                specificParameters = 'Please add questions about sports history, rules, players, etc. based on the text above.';
                break;
            case 'SCIENCE':
                specificParameters = 'Please add questions about science history, theories, scientists, etc. based on the text above.';
                break;
            case 'MUSIC':
                specificParameters = 'Please add questions about music history, genres, artists, etc. based on the text above.';
                break;
            case 'OTHER' as string:
                specificParameters = 'Make sure that questions are based on the text above.';
                break;
            default:
                specificParameters = 'Use only text above.';
                break;
        }
        const completion = await this.openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful assistant designed to output JSON.',
                },
                { role: 'user', content: mergedText },
                {
                    role: 'assistant',
                    content:
                        'Create a quiz based on the text above (4 answers) exactly ' + numberOfQuestions + ' questions and save it in a JSON file.(json with question, options and correct_anwser) in the ' +
                        courseBasic.language +
                        'language. ' + specificParameters,
                },
            ],
            model: 'gpt-4o-mini', // test this model instead of gpt-4o because of price
            response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content;
    }

    async verifyQuiz(quizJson: any, numberOfQuestions: number): Promise<boolean> {
        console.log('Number of questions: ', numberOfQuestions);
        try {
            if (
                !quizJson.quiz ||
                !Array.isArray(quizJson.quiz) ||
                quizJson.quiz.length !== numberOfQuestions
            ) {
                console.log('There must be exactly ' + numberOfQuestions + ' questions in the quiz.');
                console.log('There is exacly ' + quizJson.quiz.length + ' questions')
                return false;
            }

            let totalOptions = 0;
            let totalCorrectAnswers = 0;
            const uniqueQuestions = new Set<string>();

            quizJson.quiz.forEach((question: any, index: number) => {
                if (
                    typeof question.question !== 'string' ||
                    !question.question.trim()
                ) {
                    console.log(`Question at index ${index} is invalid.`);
                    throw new Error(`Question at index ${index} is invalid.`);
                }

                const uniqueOptions = new Set(question.options);
                if (uniqueOptions.size !== question.options.length) {
                    console.log(`Options in question at index ${index} must be unique.`);
                    throw new Error(`Options in question at index ${index} must be unique.`);
                }

                if (uniqueQuestions.has(question.question)) {
                    console.log(`Question at index ${index} is a duplicate.`);
                    throw new Error(`Question at index ${index} is a duplicate.`);
                } else {
                    uniqueQuestions.add(question.question);
                }

                if (
                    !Array.isArray(question.options) ||
                    question.options.length !== 4
                ) {
                    console.log(
                        `Question at index ${index} must have exactly 4 options.`
                    );
                    throw new Error(
                        `Question at index ${index} must have exactly 4 options.`
                    );
                }

                totalOptions += question.options.length;

                if (
                    typeof question.correct_answer !== 'string' ||
                    !question.correct_answer.trim()
                ) {
                    console.log(`Correct answer at index ${index} is invalid.`);
                    throw new Error(
                        `Correct answer at index ${index} is invalid.`
                    );
                }

                totalCorrectAnswers++;
            });

            if (totalOptions !== 4 * numberOfQuestions) {
                console.log('There must be exactly ' + 4 * numberOfQuestions + 'options in total.');
                throw new Error('There must be exactly ' + 4 * numberOfQuestions + ' options in total.');
            }

            if (totalCorrectAnswers !== numberOfQuestions) {
                console.log('There must be exactly ' + numberOfQuestions + ' correct answers.');
                throw new Error('There must be exactly ' + numberOfQuestions + ' correct answers.');
            }


            return true;
        } catch (error) {
            console.error('Error while verifying quiz:', error);
            return false;
        }
    }

    async addQuizToDataBase(courseId: string): Promise<Quiz> {
        if (!this.checkCourseExistence(courseId)) {
            throw new Error('The course does not exist.');
        }
        const mergedText: string = await this.mergeTexts(courseId);
        let courseLength = mergedText.length;
        let numberOfQuestions = 0;
        numberOfQuestions = await this.getNumberOfQuestions(courseLength);
        const questions = await this.generateQuestions(courseId);
        const questionsJson = JSON.parse(questions);
        let verified = await this.verifyQuiz(questionsJson, numberOfQuestions);
        let tries = 2;
        while (!verified) {
            if (tries > 0) {
                const questions = await this.generateQuestions(courseId);
                const questionsJson = JSON.parse(questions);
                verified = await this.verifyQuiz(questionsJson, numberOfQuestions);
                tries--;
            } else {
                throw new Error('Invalid data format.');
            }
        }

        const courseName = await this.getCourseName(courseId);
        if (
            questionsJson &&
            questionsJson.quiz &&
            Array.isArray(questionsJson.quiz)
        ) {
            const quiz = await this.prismaService.quiz.create({
                data: {
                    courseId: courseId,
                    name: courseName,
                    questions: {
                        create: questionsJson.quiz.map((questionData) => ({
                            question: questionData.question,
                            answers: {
                                set: questionData.options,
                            },
                            correct: questionData.correct_answer,
                        })),
                    },
                },
                include: {
                    questions: true,
                    UserScores: true,
                },
            });
            console.log('QUIZ READY'); // TODO: frontend error communication

            // this.cacheManager.del('all_quizzes/');
            const keys = await this.cacheManager.store.keys();
            const cachesToDelete = [];
            for (const key of keys) {
                if (key.includes('all_quizzes')) {
                    cachesToDelete.push(this.cacheManager.del(key));
                }
            }
            await Promise.all(cachesToDelete);

            return quiz;
        } else {
            throw new Error('Invalid data format.');
        }
    }

    async deleteQuestionAndQuiz(courseId: string): Promise<void> {
        const quiz = await this.prismaService.quiz.findFirst({
            where: {
                courseId: courseId,
            },
        });
        if (quiz) {
            await this.prismaService.question.deleteMany({
                where: {
                    quizId: quiz.id,
                },
            });
            await this.prismaService.quiz.delete({
                where: {
                    id: quiz.id,
                },
            });
        }
    }

    async addUserScore(addScore: AddScore, userId: string): Promise<Quiz> {
        const numberOfQuestions = await this.prismaService.question.count({
            where: {
                quizId: addScore.quizId,
            },
        })

        return this.prismaService.quiz.update({
            where: {
                id: addScore.quizId,
            },
            data: {
                UserScores: {
                    create: {
                        userId: userId,
                        score: addScore.score,
                        noQuest: numberOfQuestions,
                    },
                },
            },
            include: {
                questions: true,
                UserScores: true,
            },
        });
    }
    // Stats
    /*
    Stats:
    - Number of games played each category
    - Number of games as whole
    - Number of friends
    - Number of created quizes
    */
    async getAllUserGames(userID: string): Promise<number> {
        return await this.prismaService.userScores.count({
            where: {
                userId: userID
            }
        });
    }
    async getAllUserFriends(userID: string): Promise<number> {
        return await this.prismaService.friends.count({
            where: {
                userId: userID
            }
        });
    }
    async getMaxedQuizes(userID: string): Promise<number> {
        const userScores = await this.prismaService.userScores.findMany({
            where: {
                userId: userID
            },
            select: {
                score: true,
                noQuest: true
            }
        });

        const maxedQuizes = userScores.filter(scoreRecord => scoreRecord.score === scoreRecord.noQuest);
        return maxedQuizes.length;
    }

    async getCreatedCourses(userID: string): Promise<number> {
        return await this.prismaService.course.count({
            where: {
                creatorId: userID
            }
        });
    }
    // Achievements
    /*
    Achivements:
    - Number of games 1 - 1000
    - Number of games 2 - 10000
    - Number of friends 1 - 10
    - Number of friends 2 - 100
    - NUmber of created courses 1 - 10
    - Number of created courses 2 - 100
    - Get verification 
    - Get 100% in quiz 1 - 10
    - Get 100% in quiz 2 - 100
    - Get first friend
    */
    async checkAchivements(userID: string) {
        const userGames = await this.getAllUserGames(userID);
        const userFriends = await this.getAllUserFriends(userID);
        const userQuizes = await this.getMaxedQuizes(userID);
        const userCourses = await this.getCreatedCourses(userID);
        const userAchivements = [];
        if (userGames >= 1 && userGames <= 1000) {
            userAchivements.push('Number of games 1 - 1000');
        }
        if (userGames >= 2 && userGames <= 10000) {
            userAchivements.push('Number of games 2 - 10000');
        }
        if (userFriends >= 1 && userFriends <= 10) {
            userAchivements.push('Number of friends 1 - 10');
        }
        if (userFriends >= 2 && userFriends <= 100) {
            userAchivements.push('Number of friends 2 - 100');
        }
        if (userCourses >= 1 && userCourses <= 10) {
            userAchivements.push('Number of created courses 1 - 10');
        }
        if (userCourses >= 2 && userCourses <= 100) {
            userAchivements.push('Number of created courses 2 - 100');
        }
        if (userQuizes >= 1 && userQuizes <= 10) {
            userAchivements.push('Get 100% in quiz 1 - 10');
        }
        if (userQuizes >= 2 && userQuizes <= 100) {
            userAchivements.push('Get 100% in quiz 2 - 100');
        }
        if (userFriends >= 1) {
            userAchivements.push('Get first friend');
        }
        return userAchivements
    }
    //    async getToDataBase(userAchivements: string, userID: string): Promise<void> {
    //         const user = await this.prismaService.user.findUnique({
    //             where: {
    //                 id: userID,
    //             },
    //         });
    //         if (user) {
    //             await this.prismaService.user.update({
    //                 where: {
    //                     id: userID,
    //                 },
    //                 data: {
    //                     achivements: {
    //                         set: userAchivements,
    //                     },
    //                 },
    //    }
}
