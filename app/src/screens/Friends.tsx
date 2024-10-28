import { View, Text, Modal, TextInput } from 'react-native';
import { AuthContext, UserInfo } from '../contexts/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { fontPixel, heightPixel, widthPixel } from '../utils/Normalize';
import { FlatList } from 'react-native-gesture-handler';
import { graphqlURL } from '@/services/settings';
import { useMutation, useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import {
    FriendUserFragmentGQL,
    addFriendRequestGQL,
    getFriendDataGQL,
} from '@/services/friends/friends';
import { readFragment } from '@/graphql';
import { FriendItem } from '@/components/friends/FriendItem';
import { FriendRequestItem } from '@/components/friends/FriendRequestItem';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
import { CustomButton } from '@/components/CustomButton';
import { Layout } from '@/components/Layout';
import { Button } from '@rneui/themed';

type Friends = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'Friends'
>;

const Friends = (props: Friends) => {
    const { t } = useTranslation();

    const { userInfo } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');

    const { data, isLoading, refetch, error } = useQuery({
        queryKey: ['friendsList'],
        queryFn: async () =>
            request(
                graphqlURL,
                getFriendDataGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    const addFriend = useMutation({
        mutationFn: async (name: string) =>
            request(
                graphqlURL,
                addFriendRequestGQL,
                {
                    friendName: name,
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
        onSuccess: (data, variables, context) => {
            setIsModalOpen(false);
            refetch();
        },
        onError: (data, variables, context) => {},
    });

    if (data == undefined || isLoading) {
        return <Text>{t('loading')}...</Text>;
    }

    const friendRequests = readFragment(
        FriendUserFragmentGQL,
        data.getUserFriendRequests
    );
    const friends = readFragment(FriendUserFragmentGQL, data.getUserFriends);
    return (
        <Layout navigation={props.navigation} icon="friends">
            <View style={{ flexDirection: 'column', flex: 1 }}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={isModalOpen}
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onRequestClose={() => {
                        setIsModalOpen(false);
                    }}
                >
                    <TextInput
                        placeholder={t('enter_username')}
                        onChangeText={(text) => {
                            setUsername(text);
                        }}
                        style={{
                            width: '90%',
                            height: heightPixel(50),
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderRadius: 10,
                            margin: 10,
                            padding: 10,
                            fontSize: fontPixel(20),
                        }}
                    />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                        }}
                    >
                        <View style={{ width: '45%' }}>
                            <CustomButton
                                title={t('add')}
                                onPress={() => {
                                    addFriend.mutate(username);
                                }}
                            />
                        </View>
                        <View style={{ width: '45%' }}>
                            <CustomButton
                                title={t('cancel')}
                                onPress={() => {
                                    setIsModalOpen(false);
                                }}
                            />
                        </View>
                    </View>
                </Modal>
                {friends.length > 0 && (
                    <>
                        <Text
                            style={{
                                fontSize: fontPixel(20),
                                padding: 10,
                                color: 'black',
                                alignItems: 'center',
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            {t('friend_list')}!
                        </Text>
                        <FlatList
                            data={friends}
                            renderItem={({ item }) => (
                                <FriendItem
                                    friend={item}
                                    navigation={props.navigation}
                                />
                            )}
                        />
                    </>
                )}

                {friendRequests.length > 0 && (
                    <>
                        <Text
                            style={{
                                fontSize: fontPixel(20),
                                padding: 10,
                                color: 'black',
                                alignItems: 'center',
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            {t('friend_request')}!
                        </Text>
                        <FlatList
                            data={friendRequests}
                            renderItem={({ item }) => (
                                <FriendRequestItem friend={item} />
                            )}
                        />
                    </>
                )}
                {friendRequests.length === 0 && friends.length === 0 ? (
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Button
                            title={t('add_friend')}
                            onPress={() => {
                                setIsModalOpen(true);
                            }}
                            iconContainerStyle={{ marginRight: 10 }}
                            titleStyle={{ fontWeight: '700' }}
                            buttonStyle={{
                                backgroundColor: 'rgba(90, 154, 230, 1)',
                                borderColor: 'transparent',
                                borderWidth: 0,
                                borderRadius: 30,
                                width: widthPixel(200),
                                height: heightPixel(50),
                            }}
                        />
                    </View>
                ) : (
                    <View>
                        <CustomButton
                            title={t('add_friend')}
                            onPress={() => {
                                setIsModalOpen(true);
                            }}
                        />
                    </View>
                )}
            </View>
        </Layout>
    );
};

export { Friends };
