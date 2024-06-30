import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Quiz } from './dto/quiz.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AddScore } from './dto/addScore.dto';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { CountDto, PaginationDto } from 'src/utils/pagination.dto';
import { DashboardQuiz } from './dto/quiz.dashboard';

@Resolver((of) => Quiz)
@UseGuards(JwtAuthGuard)
export class QuizResolver {
    constructor(private quizService: QuizService) {}

    @Query((returns) => Quiz)
    async getQuizById(@Args('id') id: string): Promise<Quiz> {
        return this.quizService.getQuizById(id);
    }

    @UseInterceptors(CacheInterceptor)
    @CacheKey('all_quizzes')
    @Query((returns) => [Quiz])
    async getAllQuizzes(): Promise<Quiz[]> {
        return this.quizService.getAllQuizzes();
    }

    @UseInterceptors(CacheInterceptor)
    @CacheKey('dashboard_quizzes')
    @Query((returns) => [DashboardQuiz])
    async getDashboardQuizzes(): Promise<DashboardQuiz[]> {
        return this.quizService.getDashboardQuizzes();
    }

    @Query((returns) => [Quiz])
    async getQuizzesWithPagination(
        @Args('pagination') pagination: PaginationDto
    ): Promise<Quiz[]> {
        return this.quizService.getQuizzesWithPagination(pagination);
    }

    @Query((returns) => CountDto)
    async countQuizWithPagination(
        @Args('pagination') pagination: PaginationDto
    ) {
        return await this.quizService.getQuizzesCountWithPagination(pagination);
    }

    @Mutation((returns) => Quiz)
    async addUserScore(
        @Args('addScore') addScore: AddScore,
        @Context() context
    ) {
        return this.quizService.addUserScore(addScore, context.req.user.id);
    }
}
