import { graphql } from '@/graphql';
import { FriendUserFragmentGQL } from '../friends/friends';

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
    [quizQuestionFragment]
);

export const getQuizzesWithPaginationGQL = graphql(
    `
        query GetCoursesWithPagination($pagination: PaginationDto!) {
            getQuizzesWithPagination(pagination: $pagination) {
                id
                courseId
                name
                questions {
                    ...quizQuestionFragment
                }
            }
            countQuizWithPagination(pagination: $pagination) {
                count
                size
            }
        }
    `,
    [quizQuestionFragment]
);

export const getQuizByIdGQL = graphql(
    `
        query getQuiz($id: String!) {
            getQuizById(id: $id) {
                courseId
                id
                name
                questions {
                    ...quizQuestionFragment
                }
            }
        }
    `,
    [quizQuestionFragment]
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
    [quizQuestionFragment]
);

export const dashboardDataGQL = graphql(
    `
        query DashboardCourses {
            dashboardCourses {
                id
                name
                summary
                text {
                    id
                    type
                    value
                }
                creator {
                    username
                    email
                }
            }
            getDashboardQuizzes {
                name
                category
            }
            getUserFriends {
                ...FriendUserFragment
            }
        }
    `,
    [FriendUserFragmentGQL]
);