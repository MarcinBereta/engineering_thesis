import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ProviderInput {
  @Field()
  email: string;
  @Field()
  username: string;
}
