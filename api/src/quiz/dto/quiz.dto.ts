import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Quiz{
    @Field()
    id : string
    @Field()
    courseId : string
    @Field()
    name : string
    @Field(type=>[Question])
    questions : Question[]
    @Field(type=>[UserScore])
    UserScores : UserScore[]
}

@ObjectType()
export class Question{
    @Field()
    id : string
    @Field()
    quizId : string
    @Field()
    question : string
    @Field(type=>[String])
    answers : string[]
    @Field()
    correct : string
}

@ObjectType()
export class UserScore{
    @Field()
    userId : string
    @Field()
    quizId : string
    @Field()
    score : number
    @Field()
    createdAt : Date
}
