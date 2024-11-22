import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { View, Button, Text, TouchableOpacity } from 'react-native';
import * as RootNavigation from '@/utils/NavigationRef';
import { CustomButton } from '@/components/CustomButton';
import { fontPixel } from '@/utils/Normalize';

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
            console.log('connected to socket');
            socket.emit('connectToOwnRoom', {
                userId: userInfo.id,
            });
            socket.on('fightWithFriend', (data: any) => {
                console.log(data);
                setGameRequest(data);
            });
            return () => {
                socket.disconnect();
            };
        }
    }, [socket, userInfo]);

    return gameRequest == null || socket == null || userInfo == null ? null : (
        <View
            style={{
                gap: fontPixel(10),
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text>
                {gameRequest.userName} wants to play with you in{' '}
                {gameRequest.quiz.name}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    width: '80%',
                    justifyContent: 'space-around',
                }}
            >
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
                    backgroundColor="red"
                    title="Decline"
                    onPress={() => {
                        socket.emit('declineGameRequest', {
                            friendId: gameRequest.userId,
                            userId: userInfo.id,
                        });
                    }}
                />
            </View>
        </View>
    );
};
