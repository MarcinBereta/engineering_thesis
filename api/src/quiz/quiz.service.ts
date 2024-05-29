import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Quiz } from './dto/quiz.dto';
import { AddScore } from './dto/addScore.dto';

@Injectable()
export class QuizService {
  constructor(private prismaService: PrismaService) {}

  async getQuizById(id: string): Promise<Quiz> {
    return this.prismaService.quiz.findUnique({
      where: {
        id: id,
      },
      include: {
        questions: true,
        UserScores: true,
      },
    });
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return this.prismaService.quiz.findMany({
      include: {
        questions: true,
        UserScores: true,
      },
    });
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
