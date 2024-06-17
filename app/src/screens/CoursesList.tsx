import { View, Text, Button, TouchableOpacity, TextInput } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useState } from 'react';
import { getCoursesWithPaginationGQL } from '../services/courses/courses';
import { FlatList } from 'react-native-gesture-handler';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { graphqlURL } from '@/services/settings';
import { useDebounce } from '@/utils/Debouncer';
import { Pagination } from '@/components/utils/Pagination';

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
        <View style={{ flexDirection: 'column', flex: 1 }}>
            <Text>Course list: </Text>

            <TextInput
                placeholder="Search"
                value={search}
                onChangeText={(text) => {
                    setSearch(text);
                }}
            />
            <FlatList
                data={data.getCoursesWithPagination}
                renderItem={({ item }) => (
                    <View
                        style={{
                            padding: 15,
                            backgroundColor: 'lightgray',
                            width: '90%',
                            marginLeft: '5%',
                            borderRadius: 20,
                            marginTop: 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                props.navigation.push('course', {
                                    course: item,
                                });
                            }}
                        >
                            <Text>{item.name}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <Pagination
                currentPage={page}
                pageSize={data.countCoursesWithPagination.size}
                count={data.countCoursesWithPagination.count}
                changePage={(page) => setPage(page)}
            />

            <Button
                title="Go to Main Page"
                onPress={() => {
                    props.navigation.push('DashboardScreen');
                }}
            />

            {userInfo?.verified ? (
                <Button
                    title="Create course"
                    onPress={() => {
                        props.navigation.push('createCourse');
                    }}
                />
            ) : null}
        </View>
    );
};

export { CoursesList };
