import { Text, Dimensions, View } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { SetStateAction, useContext, useState } from 'react';
import { getCoursesWithPaginationGQL } from '../services/courses/courses';
import { FlatList } from 'react-native-gesture-handler';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { graphqlURL } from '@/services/settings';
import { useDebounce } from '@/utils/Debouncer';
import { Pagination } from '@/components/utils/Pagination';
import { Layout } from '@/components/Layout';
import { SearchBar } from '@rneui/themed';
import { ResultOf } from 'gql.tada';
import { CourseListItem } from '@/components/courses/list/CourseListItem';
import { normalizeText } from '@rneui/base';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
import Picker from 'react-native-picker-select';
import { getUserScoreGQL } from '@/services/quiz/quiz';
const { height } = Dimensions.get('window');
export type Course = ResultOf<
    typeof getCoursesWithPaginationGQL
>['getCoursesWithPagination'][0];

type CoursesList = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'CoursesList'
>;

const CoursesList = (props: CoursesList) => {
    const { t } = useTranslation();

    const { userInfo } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const debounceSearch = useDebounce(search);
    const debounceCategory = useDebounce(selectedCategory);
    const { data, isLoading, refetch, isError, error } = useQuery({
        queryKey: ['courses', page, debounceSearch, debounceCategory],
        queryFn: async () =>
            request(
                graphqlURL,
                getCoursesWithPaginationGQL,
                {
                    pagination: {
                        page,
                        search: debounceSearch,
                        category: debounceCategory,
                    },
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
            )
    });

    if (userInfo === null || data === undefined) {
        return null;
    }
    if (scoresData === undefined) {
        return null;
    }


    if (isLoading || data == undefined) {
        return <Text>{t('loading')}...</Text>;
    }
    return (
        <Layout navigation={props.navigation} icon="course">
            <Text
                style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: normalizeText(30),
                }}
            >
                {t('courses_list')}
            </Text>
            <View>
                <Text
                    style={{
                        padding: 10,
                        fontWeight: 'bold',
                        fontSize: normalizeText(15),
                    }}
                >Select Category:</Text>
                <Picker
                    style={{
                        inputAndroid: {
                            backgroundColor: 'white',
                            color: 'black',
                            padding: 10,
                            margin: 10,
                            borderRadius: 10,
                        },
                    }}
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value)}
                    items={[
                        { label: 'All', value: '' },
                        { label: 'History', value: 'HISTORY' },
                        { label: 'Music', value: 'MUSIC' },
                        { label: 'Science', value: 'SCIENCE' },
                        { label: 'Maths', value: 'MATHS' },
                        { label: 'Art', value: 'ART' },
                        { label: 'English', value: 'ENGLISH' },
                        { label: 'Geography', value: 'GEOGRAPHY' },
                        { label: 'Sports', value: 'SPORTS' },
                        { label: 'Other', value: 'OTHER' },
                    ]}
                />
            </View>
            <SearchBar
                platform="android"
                placeholder={t('search')}
                value={search}
                onChangeText={(text) => {
                    setSearch(text);
                }}
            />
            <FlatList
                data={data.getCoursesWithPagination}
                contentContainerStyle={{ maxHeight: height * 0.6 }}
                renderItem={({ item }) => (
                    <CourseListItem
                        course={item}
                        navigation={props.navigation}
                        userScore={scoresData.getUserScore}
                    />
                )}
            />

            <Pagination
                currentPage={page}
                pageSize={data.countCoursesWithPagination.size}
                count={data.countCoursesWithPagination.count}
                changePage={(page) => setPage(page)}
            />
        </Layout>
    );
};

export { CoursesList };
