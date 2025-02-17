import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { simpleUser } from 'src/auth/dto/signup-response';

@InputType()
export class VerificationForm {
    @Field()
    text: string;
}

@InputType()
export class VerifyUser {
    @Field()
    requestId: string;
}

@InputType()
export class ChangeData {
    @Field()
    userName: string;
    @Field()
    email: string;
}
@ObjectType()
export class VerificationFormData {
    @Field()
    id: string;
    @Field()
    userId: string;
    @Field()
    text: string;
    @Field()
    User: simpleUser;
}
