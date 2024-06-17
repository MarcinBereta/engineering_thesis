import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SigninUserInput {
    @Field()
    username: string;

    @Field()
    password: string;
}
