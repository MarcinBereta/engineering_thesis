import axios from 'axios';
import {apiCall} from '../graphqlHandler';
import constants from '../../../constants';
import {course} from '../../screens/CoursesList';
import {UserInfo} from '../../contexts/AuthContext';

export const getUsers = (
  token: string,
): Promise<{
  data: {
    getAllUsers: UserInfo[];
  };
}> => {
  const call = `
  query getUsers{
    getAllUsers{
        id
        email
        username
        role
        verified
        image
        Moderator{
          id
          userId
          createdAt
          updatedAt
          categories
        }
    }
    }
  `;
  //@ts-ignore
  return apiCall(call, {}, token);
};

export const getVerifyRequests = (
  token: string,
): Promise<{
  data: {
    getVerifyRequests: {
      id: string;
      userId: string;
      text: string;
      createdAt: string;
      updatedAt: string;
      User: UserInfo;
    }[];
  };
}> => {
  const call = `
   query getVerifyRequests{
    getVerifyRequests{
  		  id
      	userId
      text
      createdAt
      updatedAt
      User{
         id
        email
        username
        role
        verified
        image
      }
    }
  }
  `;
  //@ts-ignore
  return apiCall(call, {}, token);
};

export const updateUserData = (
  data: any,
  token: string,
): Promise<{
  data: {
    updateUser: UserInfo;
  };
}> => {
  const call = `
  mutation EditUser($UserEdit:UserEdit!){
    updateUser(UserEdit:$UserEdit){
      id
      email
      username
      role
      verified
      image
      Moderator{
          id
          userId
          createdAt
          updatedAt
          categories
        }
    }  
  }
  `;
  //@ts-ignore
  return apiCall(call, {UserEdit: data}, token);
};

export const verifyUserData = (
  data: any,
  token: string,
): Promise<{
  data: {
    verifyUser: UserInfo;
  };
}> => {
  const call = `
  mutation verifyUser($VerifyUser:VerifyUser!){
      verifyUser(VerifyUser:$VerifyUser){
        id
        email
        username
        role
        verified
        image
      }  
    }
  `;
  //@ts-ignore
  return apiCall(call, {VerifyUser: data}, token);
};

export const addVerificationRequest = (
  data: any,
  token: string,
): Promise<{
  data: {
    addVerificationForm: UserInfo;
  };
}> => {
  const call = `
  mutation addVerificationForm($VerificationForm:VerificationForm!){
      addVerificationForm(VerificationForm:$VerificationForm){
        id
        email
        username
        role
        verified
        image
      }  
    }
  `;
  //@ts-ignore
  return apiCall(call, {VerificationForm: data}, token);
};
