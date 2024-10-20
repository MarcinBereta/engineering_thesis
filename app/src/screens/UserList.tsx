import { View, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useState } from 'react';
import { fontPixel } from '../utils/Normalize';
import { FlatList } from 'react-native-gesture-handler';
import { graphqlURL } from '@/services/settings';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { getUsersGQL } from '@/services/admin/admin';
import { Avatar, Card, SearchBar } from '@rneui/themed';
import { useDebounce } from '@/utils/Debouncer';
import { Pagination } from '@/components/utils/Pagination';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
import { makeShareableCloneOnUIRecursive } from 'react-native-reanimated/lib/typescript/reanimated2/shareables';
import constants from '../../constants';
import { Layout } from '@/components/Layout';
type UserList = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'UserList'
>;

const UserList = (props: UserList) => {
    const { t } = useTranslation();

    const { userInfo } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const debounceSearch = useDebounce(search);

    const { data, isLoading, error } = useQuery({
        queryKey: ['userId', debounceSearch, page],
        queryFn: async () =>
            request(
                graphqlURL,
                getUsersGQL,
                {
                    pagination: {
                        search: debounceSearch,
                        page: page,
                    },
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    console.log(error);

    if (data == undefined || isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <Layout navigation={props.navigation} icon="admin">
            <View style={{ flexDirection: 'column', flex: 1 }}>
                <Text
                    style={{
                        fontSize: fontPixel(30),
                        padding: 10,
                        color: 'black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                    }}
                >
                    User list!
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
                    data={data?.getUsersWithPagination}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                props.navigation.push('User', {
                                    user: item,
                                });
                            }}
                        >
                            <Card
                                containerStyle={{
                                    padding: 10,
                                    margin: 5,
                                    flexDirection: 'row',
                                    display: 'flex',
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        flexGrow: 1,
                                    }}
                                >
                                    <Avatar
                                        containerStyle={{ margin: 10 }}
                                        source={{
                                            uri:
                                                item.image != null ? constants.url + '/files/avatars/' + item.image :
                                                    'https://randomuser.me/api/portraits/men/36.jpg',
                                        }}
                                    />
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text>{item.username}</Text>
                                        <Text style={{ fontWeight: '300' }}>
                                            {item.role}
                                        </Text>
                                    </View>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    )}
                />
                <Pagination
                    currentPage={page}
                    pageSize={data.countUsersWithPagination.size}
                    count={data.countUsersWithPagination.count}
                    changePage={(page: number) => setPage(page)}
                />
            </View>
        </Layout>
    );
};

export { UserList };
