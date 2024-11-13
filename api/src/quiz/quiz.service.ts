import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Quiz } from './dto/quiz.dto';
import { AddScore } from './dto/addScore.dto';
import OpenAI from 'openai';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaginationDto } from 'src/utils/pagination.dto';
import { PAGINATION_SIZE } from 'src/utils/pagination.settings';
import { Category, Prisma, QuestionType } from '@prisma/client';
import { DashboardQuiz } from './dto/quiz.dashboard';
import { QuizUpdateDto } from './dto/quiz.update';
import { UniqueQuizzesPlayedDTO } from './dto/uniqueQuizzesPlayed.dto';

enum QuizOptions {
    EXCLUDE_DATES,
    MULTIPLE_CHOICES,
    TRUE_FALSE,
}
const categories = [
    'MATH',
    'HISTORY',
    'GEOGRAPHY',
    'ENGLISH',
    'ART',
    'SPORTS',
    'SCIENCE',
    'MUSIC',
    'OTHER',
];
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

    async getQuizzesByCourseId(courseId: string) {
        return await this.prismaService.quiz.findMany({
            where: {
                courseId: courseId,
            },
            include: {
                questions: true,
                course: true,
            },
        });
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
            take: 4,
        });

        return quizzes;
    }

    async getQuizzesWithPagination(pagination: PaginationDto) {
        const { search, page, category } = pagination;

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
                skip: (page - 1) * PAGINATION_SIZE,
                take: PAGINATION_SIZE,
            });
        }
        if (category) {
            return await this.prismaService.quiz.findMany({
                where: {
                    course: {
                        category: category as Category,
                    },
                },
                include: {
                    questions: true,
                    UserScores: true,
                    course: true,
                },
                skip: (page - 1) * PAGINATION_SIZE,
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
        const { search, category } = pagination;

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
        if (category) {
            const count = await this.prismaService.quiz.count({
                where: {
                    course: {
                        category: category as Category,
                    },
                },
            });
            // console.log('Count: ', count);
            return { count, size: PAGINATION_SIZE };
        }
        const count = await this.prismaService.quiz.count();
        const cachedCount =
            await this.cacheManager.get<number>('quizzes_count');
        if (cachedCount && cachedCount === count) {
            return { count: cachedCount, size: PAGINATION_SIZE };
        }

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
    async getNumberOfQuestions(
        textLenght: number,
        baseLength: number = 2000
    ): Promise<number> {
        if (textLenght < baseLength) {
            return 10;
        }
        return Math.min(Math.floor(textLenght / 1000) + 10, 20); // for longer courses we add more questions
    }

    async generateQuestions(courseId: string): Promise<string> {
        const mergedText: string = await this.mergeTexts(courseId);
        const courseLength = mergedText.length;
        const numberOfQuestions = await this.getNumberOfQuestions(courseLength);
        const courseBasic = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
        });
        const category = courseBasic.category;

        // depends on category we can add some specific parameters to API
        let specificParameters = '';
        switch (category) {
            case 'MATH':
                specificParameters =
                    'When topic is about history of mathematician try do not generate questions about calculations. Be more specific about mathematicians and their work.';
                break;
            case 'HISTORY':
                specificParameters =
                    'Please do not add to many questions with dates. Be more specific about events and people.';
                break;
            case 'GEOGRAPHY':
                specificParameters =
                    'Be concise and specific about locations and events depending on the course.';
                break;
            case 'ENGLISH':
                specificParameters =
                    'Please add questions about grammar, vocabulary, literature, etc. based on the text above.';
                break;
            case 'ART':
                specificParameters =
                    'Please add questions about art history, techniques, artists, etc. based on the text above.';
                break;
            case 'SPORTS':
                specificParameters =
                    'Please add questions about sports history, rules, players, etc. based on the text above.';
                break;
            case 'SCIENCE':
                specificParameters =
                    'Please add questions about science history, theories, scientists, etc. based on the text above.';
                break;
            case 'MUSIC':
                specificParameters =
                    'Please add questions about music history, genres, artists, etc. based on the text above.';
                break;
            case 'OTHER' as string:
                specificParameters =
                    'Make sure that questions are based on the text above.';
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
                        'Create a quiz based on the text above (4 answers) exactly ' +
                        numberOfQuestions +
                        ' questions and save it in a JSON file.(json with question, options and correct_answer) in the ' +
                        courseBasic.language +
                        'language. ' +
                        specificParameters,
                },
            ],
            model: 'gpt-4o-mini', // test this model instead of gpt-4o because of price
            response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content;
    }

    async verifyQuiz(
        quizJson: any,
        numberOfQuestions: number = 10,
        ignoreCount: boolean = false
    ): Promise<boolean> {
        console.log('Number of questions: ', numberOfQuestions);
        try {
            if (
                !quizJson.quiz ||
                !Array.isArray(quizJson.quiz) ||
                quizJson.quiz.length !== numberOfQuestions
            ) {
                console.log(
                    'There must be exactly ' +
                    numberOfQuestions +
                    ' questions in the quiz.'
                );
                console.log(
                    'There is exacly ' + quizJson.quiz.length + ' questions'
                );
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
                    console.log(
                        `Options in question at index ${index} must be unique.`
                    );
                    throw new Error(
                        `Options in question at index ${index} must be unique.`
                    );
                }

                if (uniqueQuestions.has(question.question)) {
                    console.log(`Question at index ${index} is a duplicate.`);
                    throw new Error(
                        `Question at index ${index} is a duplicate.`
                    );
                } else {
                    uniqueQuestions.add(question.question);
                }

                if (
                    !ignoreCount &&
                    (!Array.isArray(question.options) ||
                        question.options.length !== 4)
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
                    !ignoreCount &&
                    (typeof question.correct_answer !== 'string' ||
                        !question.correct_answer.trim())
                ) {
                    console.log(`Correct answer at index ${index} is invalid.`);
                    throw new Error(
                        `Correct answer at index ${index} is invalid.`
                    );
                }

                totalCorrectAnswers++;
            });

            if (!ignoreCount)
                if (totalOptions !== 4 * numberOfQuestions) {
                    console.log(
                        'There must be exactly ' +
                        4 * numberOfQuestions +
                        'options in total.'
                    );
                    throw new Error(
                        'There must be exactly ' +
                        4 * numberOfQuestions +
                        ' options in total.'
                    );
                }

            if (!ignoreCount && totalCorrectAnswers !== numberOfQuestions) {
                console.log(
                    'There must be exactly ' +
                    numberOfQuestions +
                    ' correct answers.'
                );
                throw new Error(
                    'There must be exactly ' +
                    numberOfQuestions +
                    ' correct answers.'
                );
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
        const courseLength = mergedText.length;
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
                verified = await this.verifyQuiz(
                    questionsJson,
                    numberOfQuestions
                );
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
                            correct: [questionData.correct_answer],
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

    async regenerateQuiz(
        options: string[],
        quizId: string,
        numberOfQuestions: number,
        numberOfAnswers: number
    ) {
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                id: quizId,
            },
        });

        if (!quiz) {
            throw new Error('Quiz not found.');
        }

        await this.prismaService.question.deleteMany({
            where: {
                quizId: quizId,
            },
        });

        const mergedText: string = await this.mergeTexts(quiz.courseId);
        const courseBasic = await this.prismaService.course.findUnique({
            where: {
                id: quiz.courseId,
            },
        });
        const category = courseBasic.category;

        // depends on category we can add some specific parameters to API
        let specificParameters = '';
        switch (category) {
            case 'MATH':
                specificParameters =
                    'When topic is about history of mathematician try do not generate questions about calculations. Be more specific about mathematicians and their work.';
                break;
            case 'HISTORY':
                specificParameters =
                    'Please do not add to many questions with dates. Be more specific about events and people.';
                break;
            case 'GEOGRAPHY':
                specificParameters =
                    'Be concise and specific about locations and events depending on the course.';
                break;
            case 'ENGLISH':
                specificParameters =
                    'Please add questions about grammar, vocabulary, literature, etc. based on the text above.';
                break;
            case 'ART':
                specificParameters =
                    'Please add questions about art history, techniques, artists, etc. based on the text above.';
                break;
            case 'SPORTS':
                specificParameters =
                    'Please add questions about sports history, rules, players, etc. based on the text above.';
                break;
            case 'SCIENCE':
                specificParameters =
                    'Please add questions about science history, theories, scientists, etc. based on the text above.';
                break;
            case 'MUSIC':
                specificParameters =
                    'Please add questions about music history, genres, artists, etc. based on the text above.';
                break;
            case 'OTHER' as string:
                specificParameters =
                    'Make sure that questions are based on the text above.';
                break;
            default:
                specificParameters = 'Use only text above.';
                break;
        }

        if (options.includes(QuizOptions.EXCLUDE_DATES.toString())) {
            specificParameters += 'Please exclude questions with dates.';
        }

        if (options.includes(QuizOptions.MULTIPLE_CHOICES.toString())) {
            specificParameters +=
                'Please add at least one question with more than one answer, correct answer should be array in this case';
        }

        if (options.includes(QuizOptions.TRUE_FALSE.toString())) {
            specificParameters += 'Please add true/false questions.';
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
                        `Create a quiz based on the text above (If there is true false question, give 2 options otherwise ${numberOfAnswers}) exactly ` +
                        numberOfQuestions +
                        ' questions and save it in a JSON file.(json with question, options, correct_answer and type of question (true/false, single_answer or multiple_answers) ) in the ' +
                        courseBasic.language +
                        'language. ' +
                        specificParameters,
                },
            ],
            model: 'gpt-4o-mini', // test this model instead of gpt-4o because of price
            response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content;
    }

    async recreateQuiz(
        options: string[],
        quizId: string,
        numberOfQuestions: number,
        numberOfAnswers: number
    ) {
        const questions = await this.regenerateQuiz(
            options,
            quizId,
            numberOfQuestions,
            numberOfAnswers
        );
        const questionsJson = JSON.parse(questions);

        let verified = await this.verifyQuiz(
            questionsJson,
            numberOfQuestions,
            true
        );
        let tries = 2;
        while (!verified) {
            if (tries > 0) {
                const questions = await this.regenerateQuiz(
                    options,
                    quizId,
                    numberOfQuestions,
                    numberOfAnswers
                );
                const questionsJson = JSON.parse(questions);
                verified = await this.verifyQuiz(
                    questionsJson,
                    numberOfQuestions
                );
                tries--;
            } else {
                throw new Error('Invalid data format.');
            }
        }
        const quiz = await this.prismaService.quiz.update({
            where: {
                id: quizId,
            },
            data: {
                questions: {
                    create: questionsJson.quiz.map((questionData) => ({
                        question: (questionData.question as string).replace(
                            'True or false: ',
                            ''
                        ),
                        answers: {
                            set: questionData.options,
                        },
                        type:
                            questionData.type === 'true/false'
                                ? 'TRUE_FALSE'
                                : 'SINGLE_ANSWER',
                        correct: [questionData.correct_answer],
                    })),
                },
            },
            include: {
                questions: true,
                UserScores: true,
            },
        });

        const keys = await this.cacheManager.store.keys();
        const cachesToDelete = [];
        for (const key of keys) {
            if (key.includes('all_quizzes')) {
                cachesToDelete.push(this.cacheManager.del(key));
            }
        }
        await Promise.all(cachesToDelete);
        this.cacheManager.del('all_quizzes/');
        return quiz;
    }

    async updateQuizQuestions(quiz: QuizUpdateDto) {
        await this.prismaService.question.deleteMany({
            where: {
                quizId: quiz.id,
            },
        });
        for (const question of quiz.questions) {
            await this.prismaService.question.create({
                data: {
                    question: question.question,
                    answers: {
                        set: question.answers,
                    },
                    correct: question.correct,
                    quizId: quiz.id,
                },
            });
        }

        const updatedQuiz = await this.prismaService.quiz.findUnique({
            where: {
                id: quiz.id,
            },
            include: {
                questions: true,
                UserScores: true,
            },
        });

        const keys = await this.cacheManager.store.keys();
        const cachesToDelete = [];
        for (const key of keys) {
            if (key.includes('all_quizzes')) {
                cachesToDelete.push(this.cacheManager.del(key));
            }
        }
        await Promise.all(cachesToDelete);
        this.cacheManager.del('all_quizzes/');
        return updatedQuiz;
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

    async generateMoreQestionsforAddictionalQuiz(
        courseId: string,
        typeOfQuiz: string
    ): Promise<string> {
        const mergedText: string = await this.mergeTexts(courseId);
        console.log(courseId, typeOfQuiz);
        const numberOfQuestions = 10;
        const courseBasic = await this.prismaService.course.findUnique({
            where: {
                id: courseId,
            },
        });
        const category = courseBasic.category;
        let oldQuestions = [];
        try {
            const quizzes = await this.prismaService.quiz.findMany({
                where: {
                    courseId: courseId,
                },
                select: {
                    id: true,
                },
            });

            const quizIds = quizzes.map((quiz) => quiz.id);

            oldQuestions = await this.prismaService.question.findMany({
                where: {
                    quizId: {
                        in: quizIds,
                    },
                },
            });
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }

        const oldQuestionsTexts = oldQuestions.map(
            (question) => question.question
        );
        console.log(oldQuestionsTexts);
        let typeOfQuizDescription = '';

        switch (typeOfQuiz) {
            case 'general':
                typeOfQuizDescription =
                    "Please generate only questions with general questions (don't focus on details, just on generalities).";
                break;
            case 'specific':
                typeOfQuizDescription =
                    'Please generate only questions with specific questions (focus on details, be specific).';
                break;
            case 'multiple':
                typeOfQuizDescription =
                    " Please generate questions with multiple choice of answers (more than 1 answer), correct answer should be array in this case.";
                break;
            case 'truefalse':
                typeOfQuizDescription =
                    ' Please generate only questions with true/false questions. (so only anwsers questions will be true/false';
                break;
            default:
                typeOfQuizDescription = 'Generate questions.';
                break;
        }

        let specificParameters = '';

        switch (category) {
            case 'MATH':
                specificParameters =
                    'When topic is about history of mathematician try do not generate questions about calculations. Be more specific about mathematicians and their work.';
                break;
            case 'HISTORY':
                specificParameters =
                    'Please do not add to many questions with dates. Be more specific about events and people.';
                break;
            case 'GEOGRAPHY':
                specificParameters =
                    'Be concise and specific about locations and events depending on the course.';
                break;
            case 'ENGLISH':
                specificParameters =
                    'Please add questions about grammar, vocabulary, literature, etc. based on the text above.';
                break;
            case 'ART':
                specificParameters =
                    'Please add questions about art history, techniques, artists, etc. based on the text above.';
                break;
            case 'SPORTS':
                specificParameters =
                    'Please add questions about sports history, rules, players, etc. based on the text above.';
                break;
            case 'SCIENCE':
                specificParameters =
                    'Please add questions about science history, theories, scientists, etc. based on the text above.';
                break;
            case 'MUSIC':
                specificParameters =
                    'Please add questions about music history, genres, artists, etc. based on the text above.';
                break;
            case 'OTHER' as string:
                specificParameters =
                    'Make sure that questions are based on the text above.';
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
                    role: 'user',
                    content:
                        'Please do not generate questions that are already in the database: ' +
                        oldQuestionsTexts.join(' ') + "If possible, do not generate a quiz with topics covered in older questions",
                },
                {
                    role: 'assistant',
                    content:
                        'Create a quiz based on the text above exactly ' +
                        numberOfQuestions +
                        ' questions and save it in a JSON file.(json with question, options and correct_answer) in the ' +
                        courseBasic.language +
                        'language. ' +
                        specificParameters +
                        typeOfQuizDescription,
                },
            ],
            model: 'gpt-4o-mini', // test this model instead of gpt-4o because of price
            response_format: { type: 'json_object' },
        });
        console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content;
    }

    // async translateTypeOfQuiz(
    //     courseId: string,
    //     typeOfQuiz: string
    // ): Promise<string> {
    //     const courseBasic = await this.prismaService.course.findUnique({
    //         where: {
    //             id: courseId,
    //         },
    //     });
    //     const language = courseBasic.language;
    //     console.log(typeOfQuiz);
    //     const translations = {
    //         en: {
    //             general: ' general',
    //             specific: ' specific',
    //             multiple: ' multiple choice',
    //             truefalse: ' true/false',
    //         },
    //         pl: {
    //             general: ' ogólne',
    //             specific: ' szczegółowe',
    //             multiple: ' wybór wielokrotny',
    //             truefalse: ' prawda/fałsz',
    //         },
    //         de: {
    //             general: ' allgemein',
    //             specific: ' spezifisch',
    //             multiple: ' mehrfachauswahl',
    //             truefalse: ' wahr/falsch',
    //         },
    //         fr: {
    //             general: ' général',
    //             specific: ' spécifique',
    //             multiple: ' choix multiple',
    //             truefalse: ' vrai/faux',
    //         },
    //         es: {
    //             general: ' general',
    //             specific: ' específico',
    //             multiple: ' opción múltiple',
    //             truefalse: ' verdadero/falso',
    //         },
    //     };

    //     return (
    //         translations[language]?.[typeOfQuiz] ||
    //         translations[language]?.general ||
    //         'general'
    //     );
    // }

    async generateMoreQuizzes(
        courseId: string,
        typeOfQuizzes: string[]
    ): Promise<Quiz[]> {
        if (!this.checkCourseExistence(courseId)) {
            throw new Error('The course does not exist.');
        }
        console.log(typeOfQuizzes);
        const quizList = [];
        const mergedText: string = await this.mergeTexts(courseId);
        let numberOfQuestions = 10; // fixed number of questions
        for (const typeOfQuiz of typeOfQuizzes) {
            console.log(typeOfQuiz);
            const courseName = await this.getCourseName(courseId);
            let typeOfQuizTranslated = '';
            switch (typeOfQuiz) {
                case 'general':
                    typeOfQuizTranslated = ' general';
                    break;
                case 'specific':
                    typeOfQuizTranslated = ' specific';
                    break;
                case 'multiple':
                    typeOfQuizTranslated = ' multiple_choice';
                    break;
                case 'truefalse':
                    typeOfQuizTranslated = ' true/false';
                    break;
                default:
                    typeOfQuizTranslated = ' general';
                    break;
            }
            //check if quiz with this type already exists
            const quiz = await this.prismaService.quiz.findFirst({
                where: {
                    courseId: courseId,
                    name: courseName + typeOfQuizTranslated,
                },
            });

            if (quiz) {
                continue;
            }

            const questions = await this.generateMoreQestionsforAddictionalQuiz(
                courseId,
                typeOfQuiz
            );
            const questionsJson = JSON.parse(questions);

            let verified = await this.verifyQuiz(
                questionsJson,
                numberOfQuestions,
                typeOfQuiz === 'truefalse' || typeOfQuiz === 'multiple'
            );
            let tries = 2;
            while (!verified) {
                if (tries > 0) {
                    const questions =
                        await this.generateMoreQestionsforAddictionalQuiz(
                            courseId,
                            typeOfQuiz
                        );
                    const questionsJson = JSON.parse(questions);
                    if (
                        typeOfQuiz === 'truefalse' ||
                        typeOfQuiz === 'multiple'
                    ) {
                        verified = await this.verifyQuiz(
                            questionsJson,
                            numberOfQuestions,
                            true
                        );
                    } else {
                        verified = await this.verifyQuiz(
                            questionsJson,
                            numberOfQuestions
                        );
                    }
                    tries--;
                } else {
                    throw new Error('Invalid data format.');
                }
            }

            if (
                questionsJson &&
                questionsJson.quiz &&
                Array.isArray(questionsJson.quiz)
            ) {
                if (typeOfQuiz === 'multiple') {
                    const quiz = await this.prismaService.quiz.create({
                        data: {
                            courseId: courseId,
                            name: courseName + typeOfQuizTranslated,
                            questions: {
                                create: questionsJson.quiz.map(
                                    (questionData) => ({
                                        question: questionData.question,
                                        answers: {
                                            set: questionData.options,
                                        },
                                        type: 'MULTIPLE_ANSWER',
                                        correct: questionData.correct_answer,
                                    })
                                ),
                            },
                        },
                        include: {
                            questions: true,
                            UserScores: true,
                        },
                    });
                    console.log('MULTIPLE QUIZ READY');

                    quizList.push(quiz);
                } else {
                    const quiz = await this.prismaService.quiz.create({
                        data: {
                            courseId: courseId,
                            name: courseName + typeOfQuizTranslated,
                            questions: {
                                create: questionsJson.quiz.map(
                                    (questionData) => ({
                                        question: questionData.question,
                                        answers: {
                                            set: questionData.options,
                                        },
                                        correct: [questionData.correct_answer],
                                    })
                                ),
                            },
                        },
                        include: {
                            questions: true,
                            UserScores: true,
                        },
                    });
                    console.log('QUIZ READY');

                    quizList.push(quiz);
                }
            } else {
                throw new Error('Invalid data format.');
            }
        }
        const keys = await this.cacheManager.store.keys();
        const cachesToDelete = [];
        for (const key of keys) {
            if (key.includes('all_quizzes')) {
                cachesToDelete.push(this.cacheManager.del(key));
            }
        }
        await Promise.all(cachesToDelete);

        return quizList;
    }

    async addUserScore(addScore: AddScore, userId: string): Promise<Quiz> {
        const numberOfQuestions = await this.prismaService.question.count({
            where: {
                quizId: addScore.quizId,
            },
        });
        // console.log('Number of questions: ', numberOfQuestions);
        // console.log('Score: ', addScore.score);
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
    async getUserScore(userId: string): Promise<any[]> {
        const scores = await this.prismaService.userScores.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                score: 'desc',
            },
        });
        const quizIds = scores.map((score) => score.quizId);
        const quizzes = await this.prismaService.quiz.findMany({
            where: {
                id: { in: quizIds },
            },
        });
        const quizMap = new Map<string, string>();
        quizzes.forEach((quiz) => {
            quizMap.set(quiz.id, quiz.name);
        });
        const bestScoresMap = new Map<string, any>();

        scores.forEach((score) => {
            if (!bestScoresMap.has(score.quizId)) {
                bestScoresMap.set(score.quizId, {
                    userId: score.userId,
                    quizId: score.quizId,
                    quizName: quizMap.get(score.quizId) || 'Unknown',
                    score: score.score,
                    noQuest: score.noQuest,
                });
            }
        });
        // console.log(Array.from(bestScoresMap.values()));
        return Array.from(bestScoresMap.values());
    }

    // Stats
    /*
    Stats:
    - Number of games played each category
    - Number of games as whole
    - Number of friends
    - Number of created quizes
    */
    async getAllUserGamesCount(userID: string): Promise<number> {
        return await this.prismaService.userScores.count({
            where: {
                userId: userID,
            },
        });
    }
    async getFriendsCount(userID: string): Promise<number> {
        return await this.prismaService.friends.count({
            where: {
                userId: userID,
            },
        });
    }
    async getMaxedQuizesCount(userID: string): Promise<number> {
        const userScores = await this.prismaService.userScores.findMany({
            where: {
                userId: userID,
            },
            select: {
                score: true,
                noQuest: true,
            },
        });

        const maxedQuizes = userScores.filter(
            (scoreRecord) => scoreRecord.score === scoreRecord.noQuest
        );
        return maxedQuizes.length;
    }

    async getCreatedCourses(userID: string): Promise<number> {
        return await this.prismaService.course.count({
            where: {
                creatorId: userID,
            },
        });
    }
    async getNumberOfCourses(userId: string): Promise<number> {
        return await this.prismaService.course.count({
            where: {
                creatorId: userId,
            },
        });
    }
    async numberOfUniqueQuizzesPlayed(
        userID: string,
        category: string
    ): Promise<number> {
        const result: number[] = [];
        const userScores = await this.prismaService.userScores.findMany({
            where: {
                userId: userID,
            },
            select: {
                score: true,
                noQuest: true,
                quizId: true,
            },
        });
        const uniqueUserScores = Array.from(
            new Map(userScores.map((item) => [item.quizId, item])).values()
        );
        for (const score of uniqueUserScores) {
            const quiz = await this.prismaService.quiz.findUnique({
                where: {
                    id: score.quizId,
                },
                include: {
                    course: true,
                },
            });
            if (quiz) {
                if (result[quiz.course.category]) {
                    result[quiz.course.category] += 1;
                } else {
                    result[quiz.course.category] = 1;
                }
            }
        }

        const percatage = result[category];
        return percatage;
    }

    async numberOfUniqueQuizzesPlayedByCategory(
        userId: string
    ): Promise<UniqueQuizzesPlayedDTO> {
        const result: UniqueQuizzesPlayedDTO = {
            MATH: 0,
            HISTORY: 0,
            GEOGRAPHY: 0,
            ENGLISH: 0,
            ART: 0,
            SPORTS: 0,
            SCIENCE: 0,
            MUSIC: 0,
            OTHER: 0,
        };
        for (const category of categories) {
            result[category] =
                ((await this.numberOfUniqueQuizzesPlayed(
                    userId,
                    category
                )) as number) || 0;
        }
        // console.log(result);
        return result;
    }
}
