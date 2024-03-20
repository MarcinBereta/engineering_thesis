import {signInResponse} from '../../contexts/AuthContext';
import {apiCall, apiCallNoToken} from '../graphqlHandler';

const registerUser = (data: {
  email: string;
  username: string;
  password: string;
}): Promise<{
  data: {
    signup: signInResponse;
  };
}> => {
  const call = `
    mutation Register($loginInput: SingUpUserInput!){
        signup(registerUserInput:$loginInput){
          user{
            id
            email
            username
            image
          }
            access_token
        }
      }
    `;
  //@ts-ignore
  return apiCallNoToken(call, {loginInput: data});
};

const loginUser = (data: {
  username: string;
  password: string;
}): Promise<{
  data: {
    signin: signInResponse;
  };
}> => {
  const call = `
    mutation Login($loginInput: SigninUserInput!){
		signin(loginUserInput:$loginInput){
			user{
				id
				email
				username
        image
			}
				access_token
		}
	}
    `;
  //@ts-ignore
  return apiCallNoToken(call, {loginInput: data});
};

const googleLogin = (data: {
  email: string;
  username: string;
  image: string | null;
}): Promise<{
  data: {
    providerLogin: signInResponse;
  };
}> => {
  const call = `
    mutation LoginWithProvider($loginInput: ProviderInput!){
        providerLogin(providerUserInput:$loginInput){
            user{
                id
                email
                username
                image
            }
                access_token
        }
    }
    `;
  //@ts-ignore
  return apiCallNoToken(call, {loginInput: data});
};

export {registerUser, loginUser, googleLogin};
