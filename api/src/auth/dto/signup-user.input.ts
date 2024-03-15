import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, Matches } from 'class-validator';

@InputType()
export class SingUpUserInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  email: string;
}
