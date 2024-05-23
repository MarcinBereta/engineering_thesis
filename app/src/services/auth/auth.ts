import {graphql} from '@/graphql';

export const registerGQL = graphql(`
  mutation Register($loginInput: SingUpUserInput!) {
    signup(registerUserInput: $loginInput) {
      user {
        id
        email
        username
        image
        role
        verified
      }
      access_token
    }
  }
`);

export const loginGQL = graphql(`
  mutation Login($loginInput: SigninUserInput!) {
    signin(loginUserInput: $loginInput) {
      user {
        id
        email
        username
        image
        role
        verified
      }
      access_token
    }
  }
`);

export const loginGoogleGQL = graphql(`
  mutation LoginWithProvider($loginInput: ProviderInput!) {
    providerLogin(providerUserInput: $loginInput) {
      user {
        id
        email
        username
        image
        role
        verified
      }
      access_token
    }
  }
`);

export const refreshUserGQL = graphql(`
  query getUserData {
    refreshUserData {
      id
      email
      username
      role
      verified
      image
    }
  }
`);
