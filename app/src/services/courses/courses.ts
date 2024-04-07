import axios from 'axios';
import {apiCall} from '../graphqlHandler';
import constants from '../../../constants';
import {course} from '../../screens/CoursesList';

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

export const newCourse = async (
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

export const courseEdit = async (
  data: CourseInput,
  token: string,
): Promise<{
  data: {
    editCourse: Course;
  };
}> => {
  console.log(data);
  const call = `
        mutation EditCourse($EditCourseInput:EditCourseInput!){
            editCourse(editCourse:$EditCourseInput){
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
  return apiCall(call, {EditCourseInput: data}, token);
};
export const getCourses = (
  token: string,
): Promise<{
  data: {
    course: course[];
  };
}> => {
  console.log(token);
  const call = `
  query getCourses{
  course{
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
  return apiCall(call, {}, token);
};

export const getMyCourses = (
  token: string,
): Promise<{
  data: {
    MyCourses: course[];
  };
}> => {
  const call = `
  query getCourses{
  MyCourses{
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
  return apiCall(call, {}, token);
};

export const addPhotos = async (photos: File[], id: string) => {
  const formData = new FormData();
  for (const photo of photos) {
    formData.append('files[]', photo);
  }
  return await axios({
    method: 'POST',
    url: constants.url + `/files/${id}`,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
  });
};
