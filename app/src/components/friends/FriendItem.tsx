import {AuthContext} from '@/contexts/AuthContext';
import {ResultOf} from '@/graphql';
import {
  FriendUserFragmentGQL,
  removeFriendGQL,
} from '@/services/friends/friends';
import {graphqlURL} from '@/services/settings';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import request from 'graphql-request';
import {useContext, useState} from 'react';
import {View, Text, Image, Modal, Button, TouchableOpacity} from 'react-native';

export const FriendItem = ({
  friend,
}: {
  friend: ResultOf<typeof FriendUserFragmentGQL>;
}) => {
  const {userInfo} = useContext(AuthContext);
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
        },
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
        transparent={false}
        visible={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
        }}>
        <Text>Do you want to remove this user from friend list</Text>
        <Button
          title="Yes"
          onPress={() => {
            removeFriend.mutate();
          }}
        />
        <Button
          title="No"
          onPress={() => {
            setIsModalOpen(false);
          }}
        />
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
        }}>
        {friend.image ? <Image src={friend.image} /> : null}
        <Text>{friend.username}</Text>
        <Text>{friend.email}</Text>
      </TouchableOpacity>
    </View>
  );
};
