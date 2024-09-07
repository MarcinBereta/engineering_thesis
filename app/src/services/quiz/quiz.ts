import { graphql } from '@/graphql';
import { FriendUserFragmentGQL } from '../friends/friends';

export const quizQuestionFragment = graphql(`
    fragment quizQuestionFragment on Question {
        answers
        correct
        id
        question
        quizId
        type
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
                course {
                    id
                    name
                    summary
                    category
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

export const recreateQuizGQL = graphql(
    `
        mutation RecreateQuiz($recreateQuiz: RecreateQuizDto!) {
            RecreateQuiz(recreateQuiz: $recreateQuiz) {
                id
                courseId
                name
                questions {
                    ...quizQuestionFragment
                }
                course {
                    id
                    name
                    summary
                    category
                }
            }
        }
    `,
    [quizQuestionFragment]
);

export const updateQuizGQL = graphql(
    `
        mutation UpdateQuiz($updateQuiz: QuizUpdateDto!) {
            updateQuiz(updateQuiz: $updateQuiz) {
                id
                courseId
                name
                questions {
                    ...quizQuestionFragment
                }
                course {
                    id
                    name
                    summary
                    category
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
                id
                courseId
                name
                questions {
                    ...quizQuestionFragment
                }
                course {
                    id
                    name
                    summary
                    category
                }
            }
            getUserFriends {
                ...FriendUserFragment
            }
        }
    `,
    [FriendUserFragmentGQL, quizQuestionFragment]
);