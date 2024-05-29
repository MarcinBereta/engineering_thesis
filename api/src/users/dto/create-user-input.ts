import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}
