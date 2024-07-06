import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DashboardQuiz {
    @Field()
    id: string;
    @Field()
    name: string;
    @Field()
    category: string;
}