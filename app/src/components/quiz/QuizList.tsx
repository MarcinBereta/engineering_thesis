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
import { Card, SearchBar } from '@rneui/themed';
import { normalizeText } from '@rneui/base';
import { QuizzesListItem } from './QuizListItem';
import { Layout } from '../Layout';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type QuizzesList = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'QuizzesList'
>;
const QuizzesList = (props: QuizzesList) => {
    const { userInfo } = useContext(AuthContext);
    const { t } = useTranslation();
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
                {t('quizzes_list')}
            </Text>
            <SearchBar
                platform="android"
                placeholder="Search"
                value={search}
                onChangeText={(text) => {
                    setSearch(text);
                }}
            />
            <FlatList
                data={data.getQuizzesWithPagination}
                renderItem={({ item }) => (
                    <QuizzesListItem
                        key={item.id}
                        item={item}
                        navigation={props.navigation}
                    />
                )}
            />
            <Pagination
                currentPage={page}
                pageSize={data.countQuizWithPagination.size}
                count={data.countQuizWithPagination.count}
                changePage={(page) => setPage(page)}
            />
        </Layout>
    );
};

export { QuizzesList };
