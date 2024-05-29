import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

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
  @Field()
  role: Role;
  @Field()
  verified: boolean;
  @Field({ nullable: true })
  image: string | null;
  @Field((type) => [SimpleModerator])
  Moderator?: SimpleModerator[];
}

@ObjectType()
export class SimpleModerator {
  @Field()
  id: String;
  @Field()
  userId: String;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
  @Field((type) => [String])
  categories: String[];
}
