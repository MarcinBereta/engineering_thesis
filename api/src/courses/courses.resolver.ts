import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Course, CourseInput } from './dto/CourseDTO';
import { CoursesService } from './courses.service';

@Resolver((of) => Course)
export class CoursesResolver {
  constructor(private courseService: CoursesService) {}

  @Query((returns) => Course)
  async course() {
    return {
      name: 'Course Name',
      description: 'Course Description',
      text: [
        { type: 'text', value: 'Text 1' },
        { type: 'photo', value: 'Photo 1' },
      ],
    };
  }

  @Mutation(() => Course)
  async addCourse(
    @Args('newCourse') newCourse: CourseInput,
    @Context() context,
  ): Promise<Course> {
    return await this.courseService.addCourse(newCourse, context.user);
  }
}
