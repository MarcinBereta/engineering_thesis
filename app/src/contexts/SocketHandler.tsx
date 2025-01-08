import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { View, Button, Text, TouchableOpacity } from 'react-native';
import * as RootNavigation from '@/utils/NavigationRef';
import { CustomButton } from '@/components/CustomButton';
import { fontPixel } from '@/utils/Normalize';

export const SocketHandler = () => {
    const { socket, userInfo, refreshUserData } = useContext(AuthContext);

    function shortenName(courseName: string, length: number) {
        if (courseName.length > length) {
            return courseName.substring(0, length) + '...';
        }
        return courseName;
    }

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
            console.log(userInfo.id)
            socket.emit('connectToOwnRoom', {
                userId: userInfo.id,
            });
            socket.on('fightWithFriend', (data: any) => {
                console.log(data);
                setGameRequest(data);
            });
            socket.on('refreshUserData', () => {
                console.log('refreshing user data');
                refreshUserData();
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
                {shortenName(gameRequest.userName, 8)} wants to play with you in{' '}
                {shortenName(gameRequest.quiz.name, 20)}
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
                        socket.emit('declineFight', {
                            friendId: gameRequest.userId,
                            userId: userInfo.id,
                        });
                        setGameRequest(null);
                    }}
                />
            </View>
        </View>
    );
};
