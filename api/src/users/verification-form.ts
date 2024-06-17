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

@ObjectType()
export class VerificationFormData {
    @Field()
    id: string;
    @Field()
    userId: string;
    @Field()
    text: string;
    @Field()
    createdAt: Date;
    @Field()
    updatedAt: Date;
    @Field()
    User: simpleUser;
}
