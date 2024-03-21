import axios from 'axios';
import {apiCall} from '../graphqlHandler';
import constants from '../../../constants';

export type CourseItem = {
  id: string;
  type: 'text' | 'photo';
  value: string;
};
export type Course = {
  id: string;
  name: string;
  text: CourseItem[];
};

export type CourseItemInput = {
  id: string;
  type: 'text' | 'photo';
  value: string;
};
export type CourseInput = {
  name: string;
  text: CourseItemInput[];
};

export const newCourse = (
  data: CourseInput,
  token: string,
): Promise<{
  data: {
    addCourse: Course;
  };
}> => {
  const call = `
        mutation AddCourse($CourseInput:CourseInput!){
            addCourse(newCourse:$CourseInput){
                id
                name
                text{
                id
                type
                value
                }
            }
        }
    `;
  //@ts-ignore
  return apiCall(call, {CourseInput: data}, token);
};

export const addPhotos = async (photos: File[], id: string) => {
  const formData = new FormData();
  for (const photo of photos) {
    formData.append('files[]', photo);
  }
  const res = await axios({
    method: 'POST',
    url: constants.url + `/files/${id}`,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
  });
};
