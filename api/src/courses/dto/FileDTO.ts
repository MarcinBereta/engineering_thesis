import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class FileDTO {
    @Field()
    filename: string;
    @Field()
    mimetype: string;
    @Field()
    encoding: string;
}
