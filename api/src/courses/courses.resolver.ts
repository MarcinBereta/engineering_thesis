import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
    Course,
    CourseInput,
    EditCourseInput,
    ExtendedCourse,
    VerifyCourseDto,
} from './dto/CourseDTO';
import { CoursesService } from './courses.service';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { CountDto, PaginationDto } from 'src/utils/pagination.dto';

@Resolver((of) => Course)
@UseGuards(JwtAuthGuard)
export class CoursesResolver {
    constructor(private courseService: CoursesService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheKey('all_courses')
    @Query((returns) => [Course])
    async course() {
        console.log('all_courses');
        return await this.courseService.getAllCourses();
    }

    // @UseInterceptors(CacheInterceptor)
    // @CacheKey('dashboard_courses')
    @Query((returns) => [ExtendedCourse])
    async dashboardCourses() {
        console.log('dashboard_courses');
        return await this.courseService.getDashboardCourses();
    }

    @Query((returns) => [Course])
    async unVerifiedCourses(@Context() context) {
        if (
            context.req.user.role != 'ADMIN' &&
            context.req.user.role != 'MODERATOR'
        )
            throw new Error('You are not allowed to do this action');
        return await this.courseService.getUnVerifiedCourses(
            context.req.user.id
        );
    }

    @Query((returns) => [Course])
    async getCoursesWithPagination(
        @Args('pagination') pagination: PaginationDto
    ) {
        return await this.courseService.getAllCoursesWithPagination(pagination);
    }

    @Query((returns) => CountDto)
    async countCoursesWithPagination(
        @Args('pagination') pagination: PaginationDto
    ) {
        return await this.courseService.getCoursesCount(pagination);
    }

    @Query((returns) => [Course])
    async MyCourses(@Context() context) {
        return await this.courseService.getMyCourses(context.req.user.id);
    }

    @Mutation(() => Course)
    async addCourse(
        @Args('newCourse') newCourse: CourseInput,
        @Context() context
    ): Promise<Course> {
        return await this.courseService.addCourse(newCourse, context.req.user);
    }

    @Mutation(() => Course)
    async editCourse(
        @Args('editCourse') newCourse: EditCourseInput,
        @Context() context
    ): Promise<Course> {
        return await this.courseService.editCourse(newCourse, context.req.user);
    }

    @Mutation(() => Course)
    async verifyCourse(
        @Args('verifyCourse') verifyCourse: VerifyCourseDto,
        @Context() context
    ) {
        if (
            context.req.user.role != 'ADMIN' &&
            context.req.user.role != 'MODERATOR'
        )
            throw new Error('You are not allowed to do this action');
        return await this.courseService.verifyCourse(verifyCourse.courseId);
    }
}
