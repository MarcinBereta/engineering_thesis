import { Resolver,Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Quiz } from './dto/quiz.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import {  UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AddScore } from './dto/addScore.dto';

@Resolver(of=>Quiz)
@UseGuards(JwtAuthGuard)
export class QuizResolver {
    constructor(private quizService: QuizService){}
    @Query(returns => Quiz)
    async getQuizById(id: string): Promise<Quiz>{
        return this.quizService.getQuizById(id)
    }

    @Query(returns => [Quiz])
    async getAllQuizzes(): Promise<Quiz[]>{
        return this.quizService.getAllQuizzes()
    }

    @Mutation(returns => Quiz)
    async addUserScore(@Args('addScore') addScore:AddScore, @Context() context){
        return this.quizService.addUserScore(addScore, context.req.user.id)
    }
}
