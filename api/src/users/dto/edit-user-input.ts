import { Field, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@InputType()
export class UserEdit {
    @Field()
    id: string;
    @Field()
    role: Role;
    @Field()
    verified: boolean;
    @Field((type) => [String])
    categories: string[];
}
