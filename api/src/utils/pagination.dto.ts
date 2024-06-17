import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class PaginationDto {
    @Field()
    page: number;
    @Field({ nullable: true })
    search: string;
}

@ObjectType()
export class CountDto {
    @Field()
    count: number;
    @Field()
    size: number;
}
