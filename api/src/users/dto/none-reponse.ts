import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NullResponse {
  @Field()
  message: string;
}
