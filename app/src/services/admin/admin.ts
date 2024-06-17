import { graphql } from '@/graphql';

export const getUsersGQL = graphql(`
    query getUsers {
        getAllUsers {
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

export const getVerifyRequestsGQL = graphql(`
    query getVerifyRequests {
        getVerifyRequests {
            id
            userId
            text
            createdAt
            updatedAt
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
