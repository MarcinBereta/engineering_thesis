import {
    View,
    Text,
    Button,
    TouchableOpacity,
    TextInput,
    Dimensions,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useState } from 'react';
import { getCoursesWithPaginationGQL } from '../services/courses/courses';
import { FlatList } from 'react-native-gesture-handler';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { graphqlURL } from '@/services/settings';
import { useDebounce } from '@/utils/Debouncer';
import { Pagination } from '@/components/utils/Pagination';
import { Layout } from '@/components/Layout';
import { CustomButton } from '@/components/CustomButton';
import { SearchBar } from '@rneui/themed';
import { ResultOf } from 'gql.tada';
import { CourseListItem } from '@/components/courses/list/CourseListItem';
import { normalizeText } from '@rneui/base';

const { height } = Dimensions.get('window');
export type Course = ResultOf<
    typeof getCoursesWithPaginationGQL
>['getCoursesWithPagination'][0];
const CoursesList = (props: any) => {
    const { userInfo } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const debounceSearch = useDebounce(search);

    const { data, isLoading, refetch, isError, error } = useQuery({
        queryKey: ['courses', page, debounceSearch],
        queryFn: async () =>
            request(
                graphqlURL,
                getCoursesWithPaginationGQL,
                {
                    pagination: {
                        page,
                        search: debounceSearch,
                    },
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    if (isLoading || data == undefined) {
        return <Text>Loading...</Text>;
    }

    return (
        <Layout navigation={props.navigation} icon="course">
            <Text style={{textAlign: 'center', fontWeight:'bold', fontSize:normalizeText(30)}}>Course list </Text>

            <SearchBar
                platform="android"
                placeholder="Search"
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
