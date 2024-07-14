import {
    View,
    Text,
    Button,
    TouchableOpacity,
    Modal,
    TextInput,
} from 'react-native';
import { AuthContext, UserInfo } from '../contexts/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { fontPixel } from '../utils/Normalize';
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
                />

                <Button
                    title={t('add')}
                    onPress={() => {
                        addFriend.mutate(username);
                    }}
                />
                <Button
                    title={t('cancel')}
                    onPress={() => {
                        setIsModalOpen(false);
                    }}
                />
            </Modal>
            <Text
                style={{
                    fontSize: fontPixel(20),
                    padding: 10,
                    color: 'black',
                }}
            >
                {t('friend_list')}!
            </Text>
            <FlatList
                data={friends}
                renderItem={({ item }) => <FriendItem friend={item} />}
            />
            <Text
                style={{
                    fontSize: fontPixel(20),
                    padding: 10,
                    color: 'black',
                }}
            >
                {t('friend_request')}!
            </Text>
            <FlatList
                data={friendRequests}
                renderItem={({ item }) => <FriendRequestItem friend={item} />}
            />
            <Button
                title={t('add_friend')}
                onPress={() => {
                    setIsModalOpen(true);
                }}
            />
        </View>
    );
};

export { Friends };
