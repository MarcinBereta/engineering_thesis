import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NullResponse {
    @Field({ nullable: true })
    message: string;
}
