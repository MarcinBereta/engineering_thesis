import { Field, InputType } from '@nestjs/graphql';
@InputType()
export class QuestionUpdateDto {
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

@InputType()
export class QuizUpdateDto {
    @Field()
    id: string;
    @Field(() => [QuestionUpdateDto])
    questions: QuestionUpdateDto[];
}
