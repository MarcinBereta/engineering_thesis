import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Course, CourseInput } from './dto/CourseDTO';
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

  @Mutation(() => Course)
  async addCourse(
    @Args('newCourse') newCourse: CourseInput,
    @Context() context,
  ): Promise<Course> {
    return await this.courseService.addCourse(newCourse, context.user);
  }
}
