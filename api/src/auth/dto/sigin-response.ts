import { Field, ObjectType } from '@nestjs/graphql';
import { simpleUser } from './signup-response';

@ObjectType()
export class SigninResponse {
    @Field()
    access_token: string;
    @Field()
    refresh_token: string;
    @Field()
    expires: Date;

    @Field()
    user: simpleUser;
}
