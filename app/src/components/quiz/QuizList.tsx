import { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AuthContext } from '../../contexts/AuthContext';
import { graphqlURL } from '@/services/settings';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { getQuizzesWithPaginationGQL } from '@/services/quiz/quiz';
import { useDebounce } from '@/utils/Debouncer';
import { Pagination } from '../utils/Pagination';

const QuizesList = (props: any) => {
    const { userInfo } = useContext(AuthContext);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const debounceSearch = useDebounce(search);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['quizzes', page, debounceSearch],
        queryFn: async () =>
            request(
                graphqlURL,
                getQuizzesWithPaginationGQL,
                {
                    pagination: {
                        page: page,
                        search: debounceSearch,
                    },
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });
    if (data == undefined || isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={{ flexDirection: 'column', flex: 1 }}>
            <Text>Quizes list: </Text>
            <TextInput
                placeholder="Search"
                value={search}
                onChangeText={(text) => {
                    setSearch(text);
                }}
            />
            <FlatList
                data={data.getQuizzesWithPagination}
                renderItem={({ item }) => (
                    <View
                        style={{
                            padding: 15,
                            backgroundColor: 'lightgray',
                            width: '90%',
                            marginLeft: '5%',
                            borderRadius: 20,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                props.navigation.push('quiz', { quiz: item });
                            }}
                        >
                            <Text>{item.name}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <Pagination
                currentPage={page}
                pageSize={data.countQuizWithPagination.size}
                count={data.countQuizWithPagination.count}
                changePage={(page) => setPage(page)}
            />
        </View>
    );
};

export { QuizesList };
