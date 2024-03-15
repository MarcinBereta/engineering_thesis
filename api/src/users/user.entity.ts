import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field((type) => String)
  id: string;
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;

  @Field((type) => Date)
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
