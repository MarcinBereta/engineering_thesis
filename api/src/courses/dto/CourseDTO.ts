import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Category } from '@prisma/client';
@ObjectType()
export class SimpleCourse {
    @Field()
    id: string;
    @Field()
    name: string;
    @Field({ nullable: true })
    summary: string;
    @Field()
    category: Category;
    @Field({ nullable: true })
    tag: string;
    @Field({ nullable: true })
    creatorId: string;
}

@ObjectType()
export class Course extends SimpleCourse {
    @Field(() => [CourseItem])
    text: CourseItem[];
    @Field({nullable:true})
    courseId?: string;
}

@ObjectType()
export class CourseCreator {
    @Field()
    username: string;
    @Field()
    email: string;
}
@ObjectType()
export class ExtendedCourse extends Course {
    @Field(() => CourseCreator)
    creator: CourseCreator;
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
    @Field(() => [CourseItemInput])
    text: CourseItemInput[];
    @Field()
    category: Category;
    @Field()
    language: string;
}

@InputType()
export class EditCourseInput {
    @Field()
    name: string;
    @Field()
    category: Category;
    @Field(() => [CourseItemInput])
    text: CourseItemInput[];
    @Field()
    id: string;
    @Field()
    language: string;
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
