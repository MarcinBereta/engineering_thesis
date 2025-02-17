import {
    Resolver,
    Query,
    Mutation,
    Args,
    Context,
    Float,
} from '@nestjs/graphql';
import {
    Quiz,
    RecreateQuizDto,
    UserScoreExtended,
    MoreQuizzesDTO,
} from './dto/quiz.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AddScore } from './dto/addScore.dto';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { CountDto, PaginationDto } from 'src/utils/pagination.dto';
import { QuizUpdateDto } from '../quiz/dto/quiz.update';
import { UniqueQuizzesPlayedDTO } from './dto/uniqueQuizzesPlayed.dto';
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

    @Query(() => [Quiz])
    async getQuizzesByCourseId(@Args('courseId') courseId: string) {
        return await this.quizService.getQuizzesByCourseId(courseId);
    }

    @Query(() => CountDto)
    async countQuizWithPagination(
        @Args('pagination') pagination: PaginationDto
    ) {
        return await this.quizService.getQuizzesCountWithPagination(pagination);
    }
    @Query(() => [UserScoreExtended])
    async getUserScore(@Context() context): Promise<any[]> {
        return this.quizService.getUserScore(context.req.user.id);
    }

    @Query(() => Float)
    async getCreatedCourses(@Context() context): Promise<number> {
        return this.quizService.getCreatedCourses(context.req.user.id);
    }
    @Query(() => Float)
    async getCreatedCoursesByUserId(
        @Args('userId') userId: string
    ): Promise<number> {
        return this.quizService.getCreatedCourses(userId);
    }

    @Query(() => Number)
    async getAllUserGamesCount(@Context() context): Promise<number> {
        return this.quizService.getAllUserGamesCount(context.req.user.id);
    }

    @Query(() => Number)
    async getAllUserGamesCountByUserId(
        @Args('userId') userId: string
    ): Promise<number> {
        return this.quizService.getAllUserGamesCount(userId);
    }

    @Query(() => Number)
    async getMaxedQuizesCount(@Context() context): Promise<number> {
        return this.quizService.getMaxedQuizesCount(context.req.user.id);
    }

    @Query(() => Number)
    async getMaxedQuizesCountByUserId(
        @Args('userId') userId: string
    ): Promise<number> {
        return this.quizService.getMaxedQuizesCount(userId);
    }

    @Query(() => Number)
    async getFriendsCount(@Context() context): Promise<number> {
        return this.quizService.getFriendsCount(context.req.user.id);
    }

    @Query(() => Number)
    async getFriendsCountByUserId(
        @Args('userId') userId: string
    ): Promise<number> {
        return this.quizService.getFriendsCount(userId);
    }

    @Query(() => Number)
    async getNumberOfCourses(@Context() context): Promise<number> {
        return this.quizService.getNumberOfCourses(context.req.user.id);
    }

    @Query(() => Number)
    async getNumberOfCoursesByUserId(
        @Args('userId') userId: string
    ): Promise<number> {
        return this.quizService.getNumberOfCourses(userId);
    }

    @Query(() => Number)
    async percentOfCoursesByCategory(
        @Args('category') category: string,
        @Context() context
    ): Promise<number> {
        return this.quizService.numberOfUniqueQuizzesPlayed(
            context.req.user.id,
            category
        );
    }

    @Query(() => UniqueQuizzesPlayedDTO)
    async numberOfUniqueQuizzesPlayedByCategory(
        @Context() context
    ): Promise<UniqueQuizzesPlayedDTO> {
       return (await this.quizService.numberOfUniqueQuizzesPlayedByCategory(
            context.req.user.id
        )) as UniqueQuizzesPlayedDTO;
    }

    @Query(() => UniqueQuizzesPlayedDTO)
    async numberOfUniqueQuizzesPlayedByCategoryByUserId(
        @Args('userId') userId:string
    ): Promise<UniqueQuizzesPlayedDTO> {
        return (await this.quizService.numberOfUniqueQuizzesPlayedByCategory(
            userId
        )) as UniqueQuizzesPlayedDTO;
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

    @Mutation(() => [Quiz])
    async generateMoreQuizzes(
        @Args('generateMoreQuizzes') MoreQuizzes: MoreQuizzesDTO
    ) {
        return this.quizService.generateMoreQuizzes(
            MoreQuizzes.courseId,
            MoreQuizzes.quizOptions
        );
    }
}
