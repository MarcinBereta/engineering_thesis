import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
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
            <View style={styles.container}>
                <View style={styles.answerContainer}>
                    <Text style={styles.message}>Correct answer is:</Text>
                    <Text style={styles.correctAnswer}>{question?.correct}</Text>
                </View>
            </View>
        );
    }

    if (gameStage == 'lobby' && room) {
        return (
            <View style={styles.container2}>
                <Text style={styles.message2}>Game starting in 5 seconds</Text>
                <Text style={styles.subMessage}>Players:</Text>
                <FlatList
                    data={room.users}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <Text style={styles.player}>{item.username}</Text>}
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
            <View style={endStyles.container}>
                <Text style={endStyles.message}>Game ended</Text>
                <Text style={endStyles.subMessage}>Players:</Text>
                <FlatList
                    data={room.users}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={endStyles.playerContainer}>
                            <Text style={endStyles.playerName}>{item.username}</Text>
                            <Text style={endStyles.playerScore}>{item.score}</Text>
                        </View>
                    )}
                />
                <CustomButton
                    title="Go to Dashboard"
                    onPress={() => navigation.navigate('DashboardScreen')}
                    buttonStyle={endStyles.button}
                    titleStyle={endStyles.buttonTitle}
                />
            </View>
        );
    }

    if (gameCancelled) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Your friend declined game invite</Text>
                <CustomButton
                    title="Go back"
                    onPress={() => navigation.goBack()}
                    buttonStyle={styles.button}
                    titleStyle={styles.buttonTitle}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.message}>Loading game with friends...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    message2: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    subMessage: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
        color: '#555',
    },
    player: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
        marginBottom: 5,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    answerContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    message: {
        fontSize: fontPixel(20),
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    correctAnswer: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#4A90E2',
    },
    button: {
        backgroundColor: '#4A90E2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonTitle: {
        fontWeight: '700',
        fontSize: fontPixel(16),
    },
});
const endStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    message: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    subMessage: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
        color: '#555',
    },
    playerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    playerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    playerScore: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    button: {
        backgroundColor: '#4A90E2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonTitle: {
        fontWeight: '700',
        fontSize: 16,
        color: '#fff',
    },
});
export default QuizFriends;