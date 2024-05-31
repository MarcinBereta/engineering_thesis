import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { Quiz } from './dto/quiz.dto';
import { AddScore } from './dto/addScore.dto';
import OpenAI from "openai";
@Injectable()
export class QuizService {
  constructor(private prismaService: PrismaService) { }
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

  async mergeTexts(courseId: string): Promise<string> {
    let course = await this.prismaService.course.findUnique({
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

  async generateQuestions(courseId: string): Promise<string> {
    let mergedText: string;
    mergedText = await this.mergeTexts(courseId);
    require('dotenv').config();
    const openai = new OpenAI({
      apiKey: process.env.OPEN_API_KEY,
    });
    const completion = await openai.chat.completions.create({
      messages: [
        { "role": "system", "content": "You are a helpful assistant designed to output JSON." },
        { "role": "user", "content": mergedText },
        { "role": "assistant", "content": "Create a quiz (in polish) based on the text above (4 answers) 10 questions and save it in a JSON file. (Also you can create mathematic task with 4 anwsers acording to the text above)." }
      ],
      model: "gpt-3.5-turbo",
      response_format: { "type": "json_object" },
    });
    return completion.choices[0].message.content;
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
