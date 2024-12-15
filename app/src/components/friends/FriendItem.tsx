import { AuthContext } from '@/contexts/AuthContext';
import { ResultOf } from '@/graphql';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import {
    FriendUserFragmentGQL,
    removeFriendGQL,
} from '@/services/friends/friends';
import { graphqlURL } from '@/services/settings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { useContext, useState } from 'react';
import {
    View,
    Text,
    Image,
    Modal,
    Button,
    TouchableOpacity,
} from 'react-native';
import { CustomButton } from '../CustomButton';
import { fontPixel, heightPixel } from '@/utils/Normalize';
import constants from '../../../constants';
import { Avatar } from '@rneui/themed';

export const FriendItem = ({
    friend,
    navigation,
}: {
    friend: ResultOf<typeof FriendUserFragmentGQL>;
    navigation: NativeStackScreenProps<
        AuthenticatedRootStackParamList,
        'Friends'
    >['navigation'];
}) => {
    const { userInfo } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const removeFriend = useMutation({
        mutationFn: async () =>
            request(
                graphqlURL,
                removeFriendGQL,
                {
                    friendId: friend.id,
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
        onSuccess: (data, variables, context) => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({
                queryKey: ['friendsList'],
            });
        },
    });

    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalOpen}
                onRequestClose={() => {
                    setIsModalOpen(false);
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }}
                >
                    <View
                        style={{
                            width: '80%',
                            flexDirection: 'column',
                            height: heightPixel(200),
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: fontPixel(20),
                        }}
                    >
                        <Text
                            style={{
                                textAlign: 'center',
                                fontSize: 20,
                                fontWeight: 'bold',
                                marginBottom: 10,
                                color: 'black',
                            }}
                        >
                            Do you want to remove this user from friend list{' '}
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                            }}
                        >
                            <View style={{ width: '45%' }}>
                                <CustomButton
                                    title="Yes"
                                    onPress={() => {
                                        removeFriend.mutate();
                                    }}
                                />
                            </View>
                            <View style={{ width: '45%' }}>
                                <CustomButton
                                    title="No"
                                    onPress={() => {
                                        setIsModalOpen(false);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity
                onLongPress={() => {
                    setIsModalOpen(true);
                }}
                onPress={() => {
                    navigation.push('FriendProfile', {
                        friend,
                    });
                }}
                style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Avatar
                    source={{
                        uri:
                            friend.image != null
                                ? constants.url +
                                '/files/avatars/' +
                                friend.image
                                : 'https://randomuser.me/api/portraits/men/36.jpg',
                    }}
                    containerStyle={{
                        width: 50,
                        height: 50,
                        marginRight: 15,
                    }}
                />
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontSize: fontPixel(20),
                            fontWeight: 'bold',
                        }}
                    >
                        {friend.username}
                    </Text>
                    <Text>{friend.email}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};