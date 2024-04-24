import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Course {
  @Field()
  id: string;
  @Field()
  name: string;
  @Field((type) => [CourseItem])
  text: CourseItem[];
}

@ObjectType()
export class CourseItem {
  @Field()
  id: string;
  @Field()
  type: 'text' | 'photo';
  @Field()
  value: string;
}

@InputType()
export class CourseInput {
  @Field()
  name: string;
  @Field((type) => [CourseItemInput])
  text: CourseItemInput[];
}

@InputType()
export class EditCourseInput {
  @Field()
  name: string;
  @Field((type) => [CourseItemInput])
  text: CourseItemInput[];
  @Field()
  id: string;
}

@InputType()
export class CourseItemInput {
  @Field()
  id: string;
  @Field()
  type: 'text' | 'photo';
  @Field()
  value: string;
}

@InputType()
export class VerifyCourseDto {
  @Field()
  courseId: string;
}
