import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class FileDTO {
  @Field()
  filename: String;
  @Field()
  mimetype: String;
  @Field()
  encoding: String;
}
