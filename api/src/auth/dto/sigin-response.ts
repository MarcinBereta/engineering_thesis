import { Field, ObjectType } from '@nestjs/graphql';
import { simpleUser } from './signup-response';

@ObjectType()
export class SigninResponse {
    @Field()
    access_token: string;

    @Field()
    user: simpleUser;
}
