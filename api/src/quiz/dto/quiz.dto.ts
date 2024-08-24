import { Field, ObjectType } from '@nestjs/graphql';
import { SimpleCourse } from 'src/courses/dto/CourseDTO';

@ObjectType()
export class Quiz {
    @Field()
    id: string;
    @Field()
    courseId: string;
    @Field()
    name: string;
    @Field((type) => [Question])
    questions: Question[];
    @Field((type) => [UserScore])
    UserScores: UserScore[];
    @Field((type) => SimpleCourse, { nullable: true })
    course?: SimpleCourse;
}

@ObjectType()
export class Question {
    @Field()
    id: string;
    @Field()
    quizId: string;
    @Field()
    question: string;
    @Field((type) => [String])
    answers: string[];
    @Field()
    correct: string;
}

@ObjectType()
export class UserScore {
    @Field()
    userId: string;
    @Field()
    quizId: string;
    @Field()
    score: number;
    @Field()
    noQuest: number;
    @Field()
    createdAt: Date;
}
