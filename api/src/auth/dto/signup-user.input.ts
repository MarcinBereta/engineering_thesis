import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SingUpUserInput {
    @Field()
    username: string;

    @Field()
    password: string;

    @Field()
    email: string;
}
