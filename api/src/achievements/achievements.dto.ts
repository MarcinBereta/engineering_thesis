import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserAchievement {
    @Field()
    userId: string;
    @Field()
    name: string;
    @Field()
    icon: string;
}