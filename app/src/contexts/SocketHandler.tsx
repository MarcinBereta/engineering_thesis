import {useContext, useEffect, useState} from 'react';
import {AuthContext} from './AuthContext';
import {View, Button, Text, TouchableOpacity} from 'react-native';
import * as RootNavigation from '@/utils/NavigationRef';

export const SocketHandler = () => {
  const {socket, userInfo} = useContext(AuthContext);
  const [gameRequest, setGameRequest] = useState<null | {
    userId: string;
    quizId: string;
    userName: string;
    quiz: {
      id: string;
      name: string;
    };
  }>(null);
  useEffect(() => {
    if (socket) {
      socket.connect();
      socket.emit('connectToOwnRoom', {
        userId: userInfo.id,
      });
      console.log(userInfo.id);
      socket.on('fightWithFriend', (data: any) => {
        setGameRequest(data);
      });
      return () => {
        socket.disconnect();
      };
    }
  }, [socket]);

  return gameRequest == null || socket == null ? null : (
    <View>
      <Text>
        {gameRequest.userName} wants to play with you in {gameRequest.quiz.name}
      </Text>
      <Button
        title="Accept"
        onPress={() => {
          RootNavigation.navigate('QuizWithFriends', {
            quizId: gameRequest.quizId,
            friendId: gameRequest.userId,
            quiz: gameRequest.quiz,
            invite: true,
          });
          setGameRequest(null);
        }}
      />
      <Button
        title="Decline"
        onPress={() => {
          socket.emit('declineGameRequest', {
            friendId: gameRequest.userId,
            userId: userInfo.id,
          });
        }}
      />
    </View>
  );
};
