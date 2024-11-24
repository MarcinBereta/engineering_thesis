import { graphql } from '@/graphql';

export const getUsersGQL = graphql(`
    query getUsers($pagination: PaginationDto!) {
        getUsersWithPagination(pagination: $pagination) {
            id
            email
            username
            role
            verified
            image
            Moderator {
                id
                userId
                createdAt
                updatedAt
                categories
            }
        }
        countUsersWithPagination(pagination: $pagination) {
            count
            size
        }
    }
`);

export const getVerifyRequestsGQL = graphql(`
    query getVerifyRequests {
        getVerifyRequests {
            id
            userId
            text
            User {
                id
                email
                username
                role
                verified
                image
            }
        }
    }
`);

export const updateUserDataGQL = graphql(`
    mutation EditUser($UserEdit: UserEdit!) {
        updateUser(UserEdit: $UserEdit) {
            id
            email
            username
            role
            verified
            image
            Moderator {
                id
                userId
                createdAt
                updatedAt
                categories
            }
        }
    }
`);

export const verifyUserDataGQL = graphql(`
    mutation verifyUser($VerifyUser: VerifyUser!) {
        verifyUser(VerifyUser: $VerifyUser) {
            id
            email
            username
            role
            verified
            image
        }
    }
`);

export const declineUserDataGQL = graphql(`
    mutation DeclineUserVerification($verifyUser: VerifyUser!) {
        declineUserVerification(VerifyUser: $verifyUser) {
            id
            email
            username
            role
            verified
            image
        }
    }
`);

export const addVerificationRequestGQL = graphql(`
    mutation addVerificationForm($VerificationForm: VerificationForm!) {
        addVerificationForm(VerificationForm: $VerificationForm) {
            id
            email
            username
            role
            verified
            image
        }
    }
`);
