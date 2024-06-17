import { Question } from '@prisma/client';

export class Room {
    id: string;
    users: PvpUser[];
    quizId: string;
    questionIndex: number;
    questions: Question[];
}

export class PvpUser {
    id: string;
    username: string;
    score: number;
}
