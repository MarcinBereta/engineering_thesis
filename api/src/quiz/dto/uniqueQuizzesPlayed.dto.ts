import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UniqueQuizzesPlayedDTO {
    @Field(() => Number)
    MATH: number;

    @Field(() => Number)
    HISTORY: number;

    @Field(() => Number)
    GEOGRAPHY: number;

    @Field(() => Number)
    ENGLISH: number;

    @Field(() => Number)
    ART: number;

    @Field(() => Number)
    SPORTS: number;

    @Field(() => Number)
    SCIENCE: number;

    @Field(() => Number)
    MUSIC: number;

    @Field(() => Number)
    OTHER: number;
}