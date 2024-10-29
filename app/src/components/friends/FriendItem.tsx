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
        <View
            style={{
                width: '80%',
                backgroundColor: 'white',
                padding: fontPixel(20),
                left: '10%',
                borderRadius: fontPixel(10),
                flexDirection: 'column',
            }}
        >
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
                    width: '80%',
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                }}
            >
                {friend.image ? <Image src={friend.image} /> : null}
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: fontPixel(20),
                        fontWeight: 'bold',
                    }}
                >
                    {friend.username}
                </Text>
                <Text style={{ textAlign: 'center' }}>{friend.email}</Text>
            </TouchableOpacity>
        </View>
    );
};
