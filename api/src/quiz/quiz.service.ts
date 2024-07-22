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
        return Math.floor(textLenght / 300) + 10; // for longer courses we add more questions
    }

    async generateQuestions(courseId: string): Promise<string> {
        const mergedText: string = await this.mergeTexts(courseId);
        let courseLength = mergedText.length;
        let numberOfQuestions = 0;
        numberOfQuestions = await this.getNumberOfQuestions(courseLength);

        const courseBasic = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
        });
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
                        'language',
                },
            ],
            model: 'gpt-4o-mini', // test this model instead of gpt-4o because of price
            response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content;
    }

    async verifyQuiz(quizJson: any, numberOfQuestions: number): Promise<boolean> {
        try {
            if (
                !quizJson.quiz ||
                !Array.isArray(quizJson.quiz) ||
                quizJson.quiz.length !== numberOfQuestions
            ) {
                console.log('There must be exactly' + numberOfQuestions + 'questions in the quiz.');
                return false;
            }

            let totalOptions = 0;
            let totalCorrectAnswers = 0;

            quizJson.quiz.forEach((question: any, index: number) => {
                if (
                    typeof question.question !== 'string' ||
                    !question.question.trim()
                ) {
                    console.log(`Question at index ${index} is invalid.`);
                    throw new Error(`Question at index ${index} is invalid.`);
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
            console.log('QUIZ READY');

            this.cacheManager.del('all_quizzes');

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
        return this.prismaService.quiz.update({
            where: {
                id: addScore.quizId,
            },
            data: {
                UserScores: {
                    create: {
                        userId: userId,
                        score: addScore.score,
                    },
                },
            },
            include: {
                questions: true,
                UserScores: true,
            },
        });
    }
}
