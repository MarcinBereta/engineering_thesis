import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
@ObjectType()
export class SimpleModerator {
    @Field()
    id: string;
    @Field()
    userId: string;
    @Field({nullable:true})
    createdAt?: Date;
    @Field({nullable:true})
    updatedAt?: Date;
    @Field(() => [String])
    categories: string[];
}

@ObjectType()
export class User {
    @Field(() => String)
    id: string;
    @Field()
    username: string;
    @Field()
    email: string;
    @Field({ nullable: true })
    password: string;
    @Field(() => Date, { nullable: true })
    createdAt: Date;
    @Field({ nullable: true })
    updatedAt: Date;
    @Field()
    role: Role;
    @Field()
    verified: boolean;
    @Field({ nullable: true })
    image: string | null;
    @Field(() => SimpleModerator, { nullable: true })
    Moderator?: SimpleModerator;
}
