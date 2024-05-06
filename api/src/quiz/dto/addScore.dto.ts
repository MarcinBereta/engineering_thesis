import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class AddScore{
    @Field()
    userId : string
    @Field()
    quizId : string
    @Field()
    score : number
}