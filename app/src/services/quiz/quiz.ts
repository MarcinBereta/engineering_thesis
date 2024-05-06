import axios from 'axios';
import {apiCall} from '../graphqlHandler';
import constants from '../../../constants';
import {course} from '../../screens/CoursesList';

export type Quiz={
    id : string
    courseId : string
    name: string
    questions : Question[]
    UserScores : UserScore[]
}

export type Question={
    id : string
    quizId : string
    question : string
    answers : string[]
    correct : string
}

export type UserScore={
    userId : string
    quizId : string
    score : number
    createdAt : Date
}

export const getQuizes = (
  token: string,
): Promise<{
  data: {
    getAllQuizzes: Quiz[];
  };
}> => {
  const call = `
  query getQuizes {
    getAllQuizzes {
      courseId
      id
      name
      questions {
        answers
        correct
        id
        question
        quizId
      }
    }
  }
  `;
  //@ts-ignore
  return apiCall(call, {}, token);
};

export const getQuiz = (
  id: string,
  token: string,
): Promise<{
  data: {
    getQuiz: Quiz;
  };
}> => {
  const call = `
  query getQuiz($id: String!) {
    getQuiz(id: $id) {
      courseId
      id
      name
      questions {
        answers
        correct
        id
        question
        quizId
      }
    }
  }
  `;
  //@ts-ignore
  return apiCall(call, {id}, token);
};

export const addResults= (data:{
  userId:string,
  quizId:string,
  score:number
}, token?:string)=>{
  const call = `
mutation Mutation($addScore: AddScore!) {
  addUserScore(addScore: $addScore) {
    id
    name
    questions {
      answers
      correct
      id
      question
      quizId
    }
    courseId
  }
}
    `
    return apiCall(call, {addScore:data}, token)
}
