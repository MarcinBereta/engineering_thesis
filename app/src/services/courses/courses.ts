import axios from 'axios';
import { apiCall } from '../graphqlHandler';
import constants from '../../../constants';
import { graphql } from '@/graphql';

export const courseFragment = graphql(`
    fragment courseFragment on Course {
        id
        name
        text {
            id
            type
            value
        }
    }
`);

export const addCourseGQL = graphql(
    `
        mutation AddCourse($CourseInput: CourseInput!) {
            addCourse(newCourse: $CourseInput) {
                ...courseFragment
            }
        }
    `,
    [courseFragment]
);

export const changeDataGQL = graphql(`
    mutation ChangeData($changeData: ChangeData!) {
        changeData(changeData: $changeData) {
            message
        }
    }
`);

export const verifyCourseGQL = graphql(`
    mutation verifyCourse($verifyCourse: VerifyCourseDto!) {
        verifyCourse(verifyCourse: $verifyCourse) {
            id
            name
            text {
                id
                type
                value
            }
        }
    }
`);
export const editCourseGQL = graphql(
    `
        mutation EditCourse($EditCourseInput: EditCourseInput!) {
            editCourse(editCourse: $EditCourseInput) {
                ...courseFragment
            }
        }
    `,
    [courseFragment]
);

export const getCoursesGQL = graphql(`
    query getCourses {
        course {
            name
            text {
                id
                type
                value
            }
        }
    }
`);

export const getCoursesWithPaginationGQL = graphql(`
    query GetCoursesWithPagination($pagination: PaginationDto!) {
        getCoursesWithPagination(pagination: $pagination) {
            id
            name
            summary
            category
            text {
                id
                type
                value
            }
            language
        }
        countCoursesWithPagination(pagination: $pagination) {
            count
            size
        }
    }
`);

export const getUnverifiedCoursesGQL = graphql(`
    query getCourses {
        unVerifiedCourses {
            id
            name
            summary
            category
            text {
                id
                type
                value
            }
            language
        }
    }
`);

export const userStatsGQL = graphql(`
    query getUserStats {
        getCreatedCourses
        getAllUserGamesCount
        getMaxedQuizesCount
        getFriendsCount
        getNumberOfCourses
        getPercentageOfCategory {
            MATH
            HISTORY
            GEOGRAPHY
            ENGLISH
            ART
            SPORTS
            SCIENCE
            MUSIC
            OTHER
        }
    }
`);

export const getMyCoursesGQL = graphql(`
    query getCourses {
        MyCourses {
            id
            name
            summary
            category
            text {
                id
                type
                value
            }
            courseId
            language
        }
    }
`);

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

export const addAvatar = async (photo: File, id: string) => {
    const formData = new FormData();

    formData.append('file', photo);
    console.log(photo);
    return await axios({
        method: 'POST',
        url: constants.url + `/files/avatar/${id}/${photo.name}`,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        data: formData,
    });
};
