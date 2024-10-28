import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { View, Button, Text, TouchableOpacity } from 'react-native';
import * as RootNavigation from '@/utils/NavigationRef';
import { CustomButton } from '@/components/CustomButton';

export const SocketHandler = () => {
    const { socket, userInfo } = useContext(AuthContext);
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
        if (socket && userInfo) {
            socket.connect();
            socket.emit('connectToOwnRoom', {
                userId: userInfo.id,
            });
            socket.on('fightWithFriend', (data: any) => {
                setGameRequest(data);
            });
            return () => {
                socket.disconnect();
            };
        }
    }, [socket, userInfo]);

    return gameRequest == null || socket == null || userInfo == null? null : (
        <View>
            <Text>
                {gameRequest.userName} wants to play with you in{' '}
                {gameRequest.quiz.name}
            </Text>
            <CustomButton
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
            <CustomButton
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
