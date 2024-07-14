import { View, Text, Button } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { fontPixel } from '../../utils/Normalize';
import { useContext, useEffect, useState } from 'react';
import { QuizQuestion } from './QuizQuestion';
import { AuthContext } from '../../contexts/AuthContext';
import { ResultOf } from '@/graphql';
import { quizQuestionFragment } from '@/services/quiz/quiz';
import { useTranslation } from 'react-i18next';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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

type QuizSearch = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'QuizSearch'
>;

const QuizSocket = ({ route, navigation }: QuizSearch) => {
    const { userInfo, socket } = useContext(AuthContext);
    const { t } = useTranslation();
    const { quiz } = route.params;
    const [gameStage, setGameStage] = useState<
        'waiting' | 'lobby' | 'question' | 'answer' | 'end'
    >('waiting');
    const [questionAnswered, setQuestionAnswered] = useState(false);
    const [question, setQuestion] = useState<null | ResultOf<
        typeof quizQuestionFragment
    >>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [room, setRoom] = useState<Room | null>(null);
    useEffect(() => {
        if (socket) {
            socket.emit('joinQueue', { quizId: quiz.id, userId: userInfo?.id });

            socket.on('gameStart', (room: any) => {
                setRoom(room);
                setGameStage('lobby');
                // setQuestion(room.questions[0])
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
                setQuestionAnswered(false);
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
                <Text>
                    {t('correct_answer_is')} {question?.correct}
                </Text>
            </View>
        );
    }

    if (gameStage == 'lobby' && room) {
        return (
            <View>
                <Text>{t('game_starts_in')}</Text>
                <Text>{t('players')}:</Text>
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
                        if (socket && !questionAnswered) {
                            setQuestionAnswered(true);
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
                <Text>{t('game_ended')}</Text>
                <Text>{t('players')}:</Text>
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

    return (
        <View>
            <Text style={{ fontSize: fontPixel(40) }}>{quiz.name}</Text>
            <Button
                onPress={() => {
                    if (socket)
                        socket.emit('leaveQue', {
                            quizId: quiz.id,
                            userId: userInfo?.id,
                        });
                    navigation.goBack();
                }}
                title={t('cancel_search')}
            />
        </View>
    );
};

export default QuizSocket;
