import { View, Text, Button, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { fontPixel } from '../utils/Normalize';
import { useContext, useState } from 'react';
import { QuizQuestion } from '../components/quiz/QuizQuestion';
import { AuthContext } from '../contexts/AuthContext';
import { graphqlURL } from '@/services/settings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { addQUizResultGQL, quizQuestionFragment } from '@/services/quiz/quiz';
import { ResultOf, VariablesOf, readFragment } from '@/graphql';
import {
    FriendUserFragmentGQL,
    getFriendsGQL,
} from '@/services/friends/friends';
import { Layout } from '../components/Layout';
import { CustomButton } from '../components/CustomButton';
import { Avatar, Card, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
import constants from '../../constants';

const shuffleArray = (array: string[]) => {
    return array.sort(() => Math.random() - 0.5);
};

export type extendedQuestion = ResultOf<typeof quizQuestionFragment> & {
    userAnswer: string[];
};

export type addQuizResultDto = VariablesOf<typeof addQUizResultGQL>;

const { height, width } = Dimensions.get('window');
type quiz = NativeStackScreenProps<AuthenticatedRootStackParamList, 'quiz'>;

const QuizMain = ({ route, navigation }: quiz) => {
    const { t } = useTranslation();
    const { userInfo, socket } = useContext(AuthContext);
    const [friendSelect, setFriendSelect] = useState(false);
    const queryClient = useQueryClient();
    const { data, isLoading, refetch, error } = useQuery({
        queryKey: ['friendsList'],
        queryFn: async () =>
            request(
                graphqlURL,
                getFriendsGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    const addQuizResultMutation = useMutation({
        mutationFn: async (data: addQuizResultDto) =>
            request(graphqlURL, addQUizResultGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['MostFitableCourse'] });
            queryClient.invalidateQueries({ queryKey: ['UserScore'] });
        },
    });

    const { quiz } = route.params;
    const [questions, setQuestions] = useState<extendedQuestion[]>(() => {
        const extendedQuestions = quiz.questions.map(
            (question: ResultOf<typeof quizQuestionFragment>) => {
                return {
                    ...question,
                    userAnswer: [],
                    answers: shuffleArray(question.answers),
                };
            }
        );

        return extendedQuestions.sort(() => Math.random() - 0.5);
    });

    const getQuizTypeIcon = (typeOfQuiz: string) => {
        switch (typeOfQuiz) {
            case 'general':
                return <Icon type="font-awesome" name="globe" size={25} color="blue" />;
            case 'specific':
                return <Icon type="font-awesome" name="bullseye" size={25} color="blue" />;
            case 'multiple_choice':
                return <Icon type="font-awesome" name="list-ul" size={25} color="blue" />;
            case 'true/false':
                return <Icon type="font-awesome" name="adjust" size={25} color="blue" />;
            default:
                return null;
        }
    };

    const extractQuizType = (quizName: string) => {
        const lowerCaseName = quizName.toLowerCase();
        if (lowerCaseName.includes('general')) {
            return 'general';
        } else if (lowerCaseName.includes('specific')) {
            return 'specific';
        } else if (lowerCaseName.includes('multiple_choice')) {
            return 'multiple_choice';
        } else if (lowerCaseName.includes('true/false')) {
            return 'true/false';
        } else {
            return '';
        }
    };

    const quizType = extractQuizType(quiz.name);

    const [start, setStart] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const handleEndQuiz = async () => {
        console.log(questions)
        if (userInfo == null) return;

        const correctAnswers = questions.filter((question) => {
            if (question.type === 'SINGLE' || question.type === 'TRUE_FALSE') {
                return question.correct[0] === question.userAnswer[0];
            } else {
                if(question.correct.length !== question.userAnswer.length) return false;

                return question.correct.every((answer) =>
                    question.userAnswer.includes(answer)
                );
            }
        });
        let correct = correctAnswers.length;
        let all = questions.length;
        setStart(false);
        console.log(
            `You answered ${correctAnswers.length} out of ${questions.length} questions correctly`
        );
        // create screen to show result
        addQuizResultMutation.mutate({
            addScore: {
                quizId: quiz.id,
                userId: userInfo.id || '',
                score: correctAnswers.length,
            },
        });
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['UserScore'] });
        navigation.navigate('QuizResult', { score: correct, total: all });
    };

    const setAnswer = (answer: string, index: number) => {
        const newQuestions = questions.map((question, i) => {
            if (i === index) {
                if (question.type === 'MULTIPLE_ANSWER') {
                    return {
                        ...question,
                        userAnswer: answer.split(','),
                    };
                } else {
                    return {
                        ...question,
                        userAnswer: [answer],
                    };
                }
            }
            return question;
        });
        setQuestions(newQuestions);
        // Przechodzenie do następnego pytania tylko dla typów innych niż MULTIPLE_ANSWER
        if (questions[currentQuestion].type !== 'MULTIPLE_ANSWER') {
            if (currentQuestion + 1 == questions.length) {
                // handleEndQuiz();
            } else {
                setCurrentQuestion(currentQuestion + 1);
            }
        }
    };

    if (start) {
        return (
            <Layout navigation={navigation} icon="quiz">
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: fontPixel(20),
                        fontWeight: 'bold',
                        margin: 10,
                    }}
                >
                    {t('question')} {currentQuestion + 1} {t('of')}{' '}
                    {questions.length}
                </Text>
                <QuizQuestion
                    question={questions[currentQuestion]}
                    index={currentQuestion}
                    setAnswer={setAnswer}
                />
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        margin: 10,
                    }}
                >
                    {currentQuestion != 0 && (
                        <CustomButton
                            onPress={() => {
                                setCurrentQuestion(currentQuestion - 1);
                            }}
                            title={t('previous_question')}
                        />
                    )}
                    <CustomButton
                        onPress={() => {
                            if (currentQuestion === questions.length - 1) {
                                setStart(false);
                                setCurrentQuestion(0);
                                handleEndQuiz();
                            } else {
                                setCurrentQuestion(currentQuestion + 1);
                            }
                        }}
                        title={`${currentQuestion == questions.length - 1
                            ? t('end_quiz')
                            : t('next_question')
                            }`}
                    />
                </View>
            </Layout>
        );
    }

    if (friendSelect && data != undefined) {
        const friends = readFragment(
            FriendUserFragmentGQL,
            data.getUserFriends
        );
        return (
            <Layout navigation={navigation} icon="quiz">
                <Text
                    style={{
                        fontSize: fontPixel(40),
                        textAlign: 'center',
                        fontWeight: 'bold',
                    }}
                >
                    {t('friend_list')}
                </Text>
                <FlatList
                    data={friends}
                    renderItem={({ item }) => (
                        <Card>
                            <TouchableOpacity
                                style={{
                                    padding: 15,
                                    width: '90%',
                                    marginLeft: '5%',
                                    borderRadius: 20,
                                    marginTop: 10,
                                    flexDirection: 'row',
                                    // justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={() => {
                                    navigation.navigate('QuizWithFriends', {
                                        quiz,
                                        friendId: item.id,
                                        invite: false,
                                    });
                                }}
                            >
                                <Avatar
                                    source={{
                                        uri:
                                            item.image != null
                                                ? constants.url +
                                                '/files/avatars/' +
                                                item.image
                                                : 'https://randomuser.me/api/portraits/men/36.jpg',
                                    }}
                                    size="medium"
                                    rounded
                                />
                                <Text
                                    style={{
                                        fontSize: fontPixel(20),
                                        marginLeft: 10,
                                    }}
                                >
                                    {item.username}
                                </Text>
                            </TouchableOpacity>
                        </Card>
                    )}
                />
            </Layout>
        );
    }

    return (
        <Layout navigation={navigation} icon="quiz">
            <View style={styles.iconContainer}>
                {quizType && getQuizTypeIcon(quizType)}
            </View>
            <Text style={{
                fontSize: fontPixel(40),
                textAlign: 'center',
                fontWeight: 'bold',
            }}>
                {quiz.name.replace(/(general|specific|multiple_choice|true\/false)/i, '')}
            </Text>
            <View
                style={{
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    height: height * 0.2,
                    padding: 10,
                }}
            >
                <CustomButton
                    onPress={() => {
                        setStart(true);
                    }}
                    title={t('start_quiz')}
                />
                <CustomButton
                    onPress={() => {
                        navigation.navigate('QuizSearch', { quiz });
                    }}
                    title={t('search_for_opponents')}
                />
                <CustomButton
                    onPress={() => {
                        setFriendSelect(true);
                    }}
                    title={t('fight_with_friend')}
                />
            </View>
        </Layout >
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
});


export default QuizMain;