import {graphql} from '@/graphql';

export const quizQuestionFragment = graphql(`
  fragment quizQuestionFragment on Question {
    answers
    correct
    id
    question
    quizId
  }
`);

export const getQuizzesGQL = graphql(
  `
    query getQuizes {
      getAllQuizzes {
        courseId
        id
        name
        questions {
          ...quizQuestionFragment
        }
      }
    }
  `,
  [quizQuestionFragment],
);

export const getQuizByIdGQL = graphql(
  `
    query getQuiz($id: String!) {
      getQuiz(id: $id) {
        courseId
        id
        name
        questions {
          ...quizQuestionFragment
        }
      }
    }
  `,
  [quizQuestionFragment],
);

export const addQUizResultGQL = graphql(
  `
    mutation Mutation($addScore: AddScore!) {
      addUserScore(addScore: $addScore) {
        id
        name
        questions {
          ...quizQuestionFragment
        }
        courseId
      }
    }
  `,
  [quizQuestionFragment],
);
