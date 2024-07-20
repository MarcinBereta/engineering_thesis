import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
@ObjectType()
export class simpleUser {
    @Field()
    id: string;
    @Field()
    email: string;
    @Field()
    username: string;
    @Field({ nullable: true })
    image: string;
    @Field()
    verified: boolean;
    @Field()
    role: Role;
}

@ObjectType()
export class SignupResponse {
    @Field()
    access_token: string;
    @Field()
    refresh_token: string;
    @Field()
    expires: Date;
    @Field()
    user: simpleUser;
}
