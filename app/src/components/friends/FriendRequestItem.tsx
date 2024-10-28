import { AuthContext } from '@/contexts/AuthContext';
import { ResultOf } from '@/graphql';
import {
    FriendUserFragmentGQL,
    acceptFriendRequestGQL,
    declineFriendRequestGQL,
    removeFriendGQL,
} from '@/services/friends/friends';
import { graphqlURL } from '@/services/settings';
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

export const FriendRequestItem = ({
    friend,
}: {
    friend: ResultOf<typeof FriendUserFragmentGQL>;
}) => {
    const { userInfo } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const acceptFriendRequest = useMutation({
        mutationFn: async () =>
            request(
                graphqlURL,
                acceptFriendRequestGQL,
                {
                    friendId: friend.id,
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
        onSuccess: (data, variables, context) => {
            setIsModalOpen((o) => !o);
            queryClient.invalidateQueries({
                queryKey: ['friendsList'],
            });
        },
    });

    const removeFriendRequest = useMutation({
        mutationFn: async () =>
            request(
                graphqlURL,
                declineFriendRequestGQL,
                {
                    friendId: friend.id,
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
        onSuccess: (data, variables, context) => {
            setIsModalOpen((o) => !o);
            queryClient.invalidateQueries({
                queryKey: ['friendsList'],
            });
        },
    });

    return (
        <View>
            <Modal
                animationType="slide"
                transparent={false}
                visible={isModalOpen}
                onRequestClose={() => {
                    setIsModalOpen(false);
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
                    Do you want to accept this request
                </Text>

                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                    <View style={{ width: '45%' }}>
                        <CustomButton
                            title="Yes"
                            onPress={() => {
                                acceptFriendRequest.mutate();
                            }}
                        />
                    </View>
                    <View style={{ width: '45%' }}>
                        <CustomButton
                            title="No"
                            onPress={() => {
                                removeFriendRequest.mutate();
                            }}
                        />
                    </View>
                </View>
            </Modal>
            <TouchableOpacity
                onPress={() => {
                    setIsModalOpen(true);
                }}
                style={{
                    width: '80%',
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                }}
            >
                {friend.image ? <Image src={friend.image} /> : null}
                <Text>{friend.username}</Text>
                <Text>{friend.email}</Text>
            </TouchableOpacity>
        </View>
    );
};
