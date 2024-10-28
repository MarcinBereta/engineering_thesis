import { useContext, useState, SetStateAction } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AuthContext } from '../../contexts/AuthContext';
import { graphqlURL } from '@/services/settings';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import {
    getQuizzesWithPaginationGQL,
    getUserScoreGQL,
} from '@/services/quiz/quiz';
import { useDebounce } from '@/utils/Debouncer';
import { Pagination } from '../utils/Pagination';
import { SearchBar } from '@rneui/themed';
import { Icon, normalizeText } from '@rneui/base';
import { QuizzesListItem } from './QuizListItem';
import { Layout } from '../Layout';
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
    const [selectedCategory, setSelectedCategory] = useState('');
    const debounceCategory = useDebounce(selectedCategory);
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['quizzes', page, debounceSearch, debounceCategory],
        queryFn: async () =>
            request(
                graphqlURL,
                getQuizzesWithPaginationGQL,
                {
                    pagination: {
                        page: page,
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

    if (data == undefined || isLoading) {
        return <Text>{t('loading')}...</Text>;
    }

    function getCategory(selectedCategory: string) {
        switch (selectedCategory) {
            case '':
                return 'All';
            case 'MATH':
                return 'Math';
            case 'ENGLISH':
                return 'English';
            case 'HISTORY':
                return 'History';
            case 'SCIENCE':
                return 'Science';
            case 'SPORTS':
                return 'Sports';
            case 'MUSIC':
                return 'Music';
            case 'ART':
                return 'Art';
            case 'GEOGRAPHY':
                return 'Geography';
            case 'OTHER':
                return 'Other';
            default:
                return '';
        }
    }

    return (
        <Layout navigation={props.navigation} icon="quiz">
            <View style={styles.header}>
                <Text style={styles.title}>{t('quizzes_list')}</Text>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                        props.navigation.navigate('CategorySelection' as never, {
                            selectedCategory,
                            setSelectedCategory,
                        } as never);
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
                data={data.getQuizzesWithPagination.filter(
                    (item) =>
                        selectedCategory === '' ||
                        (item.course &&
                            item.course.category === selectedCategory)
                )}
                renderItem={({ item }) => (
                    <QuizzesListItem
                        key={item.id}
                        item={item}
                        navigation={props.navigation}
                        userScore={scoresData.getUserScore}
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

export { QuizzesList };