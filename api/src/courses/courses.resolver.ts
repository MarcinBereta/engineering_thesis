import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  Course,
  CourseInput,
  EditCourseInput,
  VerifyCourseDto,
} from './dto/CourseDTO';
import { CoursesService } from './courses.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Resolver((of) => Course)
@UseGuards(JwtAuthGuard)
export class CoursesResolver {
  constructor(private courseService: CoursesService) {}

  @Query((returns) => [Course])
  async course() {
    return await this.courseService.getAllCourses();
  }

  @Query((returns) => [Course])
  async unVerifiedCourses(@Context() context) {
    if (
      context.req.user.role != 'ADMIN' &&
      context.req.user.role != 'MODERATOR'
    )
      throw new Error('You are not allowed to do this action');
    return await this.courseService.getUnVerifiedCourses(context.req.user.id);
  }

  @Query((returns) => [Course])
  async MyCourses(@Context() context) {
    return await this.courseService.getMyCourses(context.req.user.id);
  }

  @Mutation(() => Course)
  async addCourse(
    @Args('newCourse') newCourse: CourseInput,
    @Context() context,
  ): Promise<Course> {
    return await this.courseService.addCourse(newCourse, context.req.user);
  }

  @Mutation(() => Course)
  async editCourse(
    @Args('editCourse') newCourse: EditCourseInput,
    @Context() context,
  ): Promise<Course> {
    return await this.courseService.editCourse(newCourse, context.req.user);
  }

  @Mutation(() => Course)
  async verifyCourse(
    @Args('verifyCourse') verifyCourse: VerifyCourseDto,
    @Context() context,
  ) {
    if (
      context.req.user.role != 'ADMIN' &&
      context.req.user.role != 'MODERATOR'
    )
      throw new Error('You are not allowed to do this action');
    return await this.courseService.verifyCourse(verifyCourse.courseId);
  }
}
