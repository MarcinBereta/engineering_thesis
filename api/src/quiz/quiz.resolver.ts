import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Quiz, RecreateQuizDto } from './dto/quiz.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AddScore } from './dto/addScore.dto';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { CountDto, PaginationDto } from 'src/utils/pagination.dto';
import { QuizUpdateDto } from '../quiz/dto/quiz.update';
@Resolver(() => Quiz)
@UseGuards(JwtAuthGuard)
export class QuizResolver {
    constructor(private quizService: QuizService) {}

    @Query(() => Quiz)
    async getQuizById(@Args('id') id: string): Promise<Quiz> {
        return this.quizService.getQuizById(id);
    }

    @UseInterceptors(CacheInterceptor)
    @CacheKey('all_quizzes')
    @Query(() => [Quiz])
    async getAllQuizzes(): Promise<Quiz[]> {
        return this.quizService.getAllQuizzes();
    }

    @UseInterceptors(CacheInterceptor)
    @CacheKey('dashboard_quizzes')
    @Query(() => [Quiz])
    async getDashboardQuizzes(): Promise<Quiz[]> {
        return this.quizService.getDashboardQuizzes();
    }

    @Query(() => [Quiz])
    async getQuizzesWithPagination(
        @Args('pagination') pagination: PaginationDto
    ): Promise<Quiz[]> {
        return this.quizService.getQuizzesWithPagination(pagination);
    }

    @Query(() => CountDto)
    async countQuizWithPagination(
        @Args('pagination') pagination: PaginationDto
    ) {
        return await this.quizService.getQuizzesCountWithPagination(pagination);
    }

    @Mutation(() => Quiz)
    async addUserScore(
        @Args('addScore') addScore: AddScore,
        @Context() context
    ) {
        return this.quizService.addUserScore(addScore, context.req.user.id);
    }

    @Mutation(() => Quiz)
    async RecreateQuiz(@Args('recreateQuiz') recreateDto: RecreateQuizDto) {
        return this.quizService.recreateQuiz(
            recreateDto.quizOptions,
            recreateDto.quizId,
            recreateDto.questionCount,
            recreateDto.answerCount
        );
    }

    @Mutation(() => Quiz)
    async updateQuiz(@Args('updateQuiz') quizUpdate: QuizUpdateDto) {
        return this.quizService.updateQuizQuestions(quizUpdate);
    }
}
