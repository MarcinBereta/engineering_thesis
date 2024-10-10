import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserAchievement {
    @Field()
    id: string;
    @Field()
    name: string;
    @Field()
    icon: string;
}