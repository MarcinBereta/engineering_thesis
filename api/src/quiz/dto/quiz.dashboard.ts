import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DashboardQuiz{
    @Field()
    name:string;
    @Field()
    category:string
}