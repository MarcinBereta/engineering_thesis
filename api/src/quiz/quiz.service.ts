import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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

  async isCourseExist(courseId: string): Promise<boolean> {
    let course = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
      },
    });
    if (course) {
      return true;
    } else {
      return false;
    }
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
  async getCourseName(courseId: string): Promise<string> {
    let course = await this.prismaService.course.findUnique({
      where: {
        id: courseId,
      },
    });
    return course.name;
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
        { "role": "assistant", "content": "Create a quiz based on the text above (4 answers) 10 questions and save it in a JSON file.(json with question, options and correct_anwser)" }
      ],
      model: "gpt-3.5-turbo",
      response_format: { "type": "json_object" },
    });
    console.log(completion.choices[0].message.content)
    return completion.choices[0].message.content;
  }
  /*
  Dodać weryfikację czy kurs istnieje
  Dodać weryfikację poprawności formatu danych z OpenAI
  Dodać możliwość edycji pytań
  
  */
  async addQuizToDataBase(courseId: string): Promise<Quiz> {
    if (!this.isCourseExist) {
      throw new Error('The course does not exist.');
    }
    let questions = await this.generateQuestions(courseId);
    let questionsJson = JSON.parse(questions);
    let courseName = await this.getCourseName(courseId);
    if (questionsJson && questionsJson.quiz && Array.isArray(questionsJson.quiz)) {
      let quiz = await this.prismaService.quiz.create({
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
      return quiz;
    } else {
      throw new Error('Invalid data format.');
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
