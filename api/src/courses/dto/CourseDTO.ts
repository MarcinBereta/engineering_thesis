import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Category } from '@prisma/client';

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
    @Field()
    category: Category;
}

@InputType()
export class EditCourseInput {
    @Field()
    name: string;
    @Field()
    category: Category;
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
