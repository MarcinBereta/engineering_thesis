import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { SimpleCourse } from 'src/courses/dto/CourseDTO';

@ObjectType()
export class Quiz {
    @Field()
    id: string;
    @Field()
    courseId: string;
    @Field()
    name: string;
    @Field(() => [Question])
    questions: Question[];
    @Field(() => [UserScore])
    UserScores: UserScore[];
    @Field(() => SimpleCourse, { nullable: true })
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
    @Field(() => [String])
    answers: string[];
    @Field(() => [String])
    correct: string[];
    @Field(() => String)
    type: string;
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
@ObjectType()
export class UserScoreExtended extends UserScore {
    @Field()
    quizName: string;
}

@InputType()
export class RecreateQuizDto {
    @Field()
    quizId: string;
    @Field()
    questionCount: number;
    @Field()
    answerCount: number;
    @Field(() => [String])
    quizOptions: string[];
}
