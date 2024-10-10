import { useContext, useState, SetStateAction } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AuthContext } from '../../contexts/AuthContext';
import { graphqlURL } from '@/services/settings';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import {
    GetCoursesWithPaginationGQL,
    getQuizzesWithPaginationGQL,
    getUserScoreGQL,
} from '@/services/quiz/quiz';
import { useDebounce } from '@/utils/Debouncer';
import { Pagination } from '../utils/Pagination';
import { SearchBar } from '@rneui/themed';
import { normalizeText } from '@rneui/base';
import { QuizzesListItem } from './QuizListItem';
import { Layout } from '../Layout';
import { useTranslation } from 'react-i18next';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Picker from 'react-native-picker-select';
type CourseQuizzesList = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'CourseQuizzesList'
>;
const CourseQuizzesList = (props: CourseQuizzesList) => {
    const { userInfo } = useContext(AuthContext);
    const { t } = useTranslation();
    const { courseId } = props.route.params;
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['quizzes', courseId],
        queryFn: async () =>
            request(
                graphqlURL,
                GetCoursesWithPaginationGQL,
                {
                    courseId,
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });
    const { data: scoresData } = useQuery({
        queryKey: ['UserScore'],
        queryFn: async () =>
            request(
                graphqlURL,
                getUserScoreGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    if (userInfo === null || data === undefined) {
        return null;
    }
    if (scoresData === undefined) {
        return null;
    }

    if (data == undefined || isLoading) {
        return <Text>{t('loading')}...</Text>;
    }

    return (
        <Layout navigation={props.navigation} icon="quiz">
            <Text
                style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: normalizeText(30),
                }}
            >
                {t('course_quizzes_list')}
            </Text>
            <FlatList
                data={data.getQuizzesByCourseId}
                renderItem={({ item }) => (
                    <QuizzesListItem
                        key={item.id}
                        item={item}
                        navigation={props.navigation}
                        userScore={scoresData.getUserScore}
                    />
                )}
            />
        </Layout>
    );
};

export { CourseQuizzesList };
