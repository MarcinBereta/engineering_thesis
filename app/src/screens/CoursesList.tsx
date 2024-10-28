import { Text, Dimensions, View, TouchableOpacity, StyleSheet } from 'react-native';
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
import { Icon, normalizeText } from '@rneui/base';
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
            ),
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
            <View style={styles.header}>
                <Text style={styles.title}>{t('courses_list')}</Text>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                        props.navigation.navigate('CategorySelection' as never, {
                            selectedCategory,
                            setSelectedCategory,
                        } as never)
                        setPage(1);
                    }}
                >
                    <Text>{selectedCategory !== "" && (
                        <Text>Category: {t(selectedCategory)}</Text>
                    )}</Text>
                    <Icon name="category" size={30} color="black" />
                </TouchableOpacity>
            </View>
            <SearchBar
                platform="android"
                placeholder={t('search')}
                value={search}
                onChangeText={(text) => {
                    setSearch(text);
                    setPage(1);
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
        </Layout >
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: normalizeText(30),
    },
    iconButton: {
        padding: 5,
    },
});

export { CoursesList };
