import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class simpleUser{
  @Field()
  id: string;
  @Field()
  email: string;
  @Field()
  username: string;
}

@ObjectType()
export class SignupResponse {
  @Field()
  access_token: string;
  @Field()
  user:simpleUser
}

