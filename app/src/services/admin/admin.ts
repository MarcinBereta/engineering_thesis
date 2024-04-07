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
    }  
  }
  `;
  //@ts-ignore
  return apiCall(call, {UserEdit: data}, token);
};
