import { View, Text, Button } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { fontPixel } from '../../utils/Normalize';
import { useContext, useEffect, useState } from 'react';
import { QuizQuestion } from './QuizQuestion';
import { AuthContext } from '../../contexts/AuthContext';
import { ResultOf } from '@/graphql';
import { quizQuestionFragment } from '@/services/quiz/quiz';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../CustomButton';

type Room = {
    id: string;
    users: {
        id: string;
        username: string;
        score: number;
    }[];
    quizId: string;
    questionIndex: number;
    questions: ResultOf<typeof quizQuestionFragment>[];
};

type QuizWithFriends = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'QuizWithFriends'
>;

const QuizFriends = ({ route, navigation }: QuizWithFriends) => {
    const { userInfo, socket } = useContext(AuthContext);

    const { quiz, friendId, invite } = route.params;
    const [gameCancelled, setGameCancelled] = useState(false);
    const [gameStage, setGameStage] = useState<
        'waiting' | 'lobby' | 'question' | 'answer' | 'end'
    >('waiting');

    const [questionAnserwed, setQuestionAnserwed] = useState(false);
    const [question, setQuestion] = useState<null | ResultOf<
        typeof quizQuestionFragment
    >>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [room, setRoom] = useState<Room | null>(null);
    useEffect(() => {
        if (socket) {
            if (!invite && userInfo !== null)
                socket.emit('fightWithFriend', {
                    quizId: quiz.id,
                    userId: userInfo?.id,
                    friendId,
                    username: userInfo.username,
                });
            else
                socket.emit('acceptFight', {
                    userId: userInfo?.id,
                    friendId,
                });
            socket.on('fightCanceled', (data) => {
                setGameCancelled(true);
            });

            socket.on('gameStart', (room: any) => {
                setRoom(room);
                setGameStage('lobby');
            });

            socket.on('question', (question: any) => {
                setCurrentQuestion((prev) => {
                    const q = room?.questions.find(
                        (q, i) => q.question == question.question
                    ) as ResultOf<typeof quizQuestionFragment>;
                    return room?.questions.indexOf(q) || 0;
                });
                setGameStage('question');
                setQuestion(question);
                setQuestionAnserwed(false);
            });

            socket.on('questionEnd', (correct: string) => {
                setGameStage('answer');
            });

            socket.on('gameEnd', (room: any) => {
                setGameStage('end');
                setRoom(room);
            });
        }
    }, []);

    if (gameStage == 'answer') {
        return (
            <View>
                <Text>Correct answer is {question?.correct}</Text>
            </View>
        );
    }

    if (gameStage == 'lobby' && room) {
        return (
            <View>
                <Text>Game starting in 5 seconds</Text>
                <Text>Players:</Text>
                <FlatList
                    data={room.users}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <Text>{item.username}</Text>}
                />
            </View>
        );
    }

    if (gameStage == 'question' && question) {
        return (
            <View>
                <QuizQuestion
                    question={question}
                    index={0}
                    setAnswer={(answer: string, index: number) => {
                        if (socket && !questionAnserwed) {
                            setQuestionAnserwed(true);
                            socket.emit('answer', {
                                roomId: room?.id,
                                userId: userInfo?.id,
                                answer,
                            });
                        }
                    }}
                />
            </View>
        );
    }

    if (gameStage == 'end' && room) {
        return (
            <View>
                <Text>Game ended</Text>
                <Text>Players:</Text>
                <FlatList
                    data={room.users}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Text>
                            {item.username} - {item.score}
                        </Text>
                    )}
                />
            </View>
        );
    }

    if (gameCancelled) {
        return (
            <View>
                <Text>Your friend declined game invite</Text>
                <CustomButton title="Go back" onPress={() => navigation.goBack()} />
            </View>
        );
    }

    return (
        <View>
            {/* <Text style={{fontSize: fontPixel(40)}}>{quiz.name}</Text> */}
            <Text>Loading game with friends</Text>
        </View>
    );
};

export default QuizFriends;
