import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { fontPixel } from '../utils/Normalize';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { graphqlURL } from '@/services/settings';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import {
    addQUizResultGQL,
    quizQuestionFragment,
    recreateQuizGQL,
    updateQuizGQL,
} from '@/services/quiz/quiz';
import { ResultOf, VariablesOf, readFragment } from '@/graphql';
import { Layout } from '../components/Layout';
import { CustomButton } from '../components/CustomButton';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
import { Button, Icon } from '@rneui/base';

const allOptions = ['EXCLUDE_DATES', 'MULTIPLE_CHOICES', 'TRUE_FALSE'];

export type extendedQuestion = ResultOf<typeof quizQuestionFragment> & {};

export type recreateQuizGQLDto = VariablesOf<typeof recreateQuizGQL>;
export type updateQuizGQLDto = VariablesOf<typeof updateQuizGQL>;

type quiz = NativeStackScreenProps<AuthenticatedRootStackParamList, 'QuizEdit'>;

const QuizEdit = ({ route, navigation }: quiz) => {
    const { t } = useTranslation();
    const { userInfo } = useContext(AuthContext);
    const [questionCount, setQuestionCount] = useState(10);
    const [answerCount, setAnswerCount] = useState(4);
    const [types, setTypes] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quiz, setQuiz] = useState(route.params.quiz);
    const [editActive, setEditActive] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const regenerateQuiz = useMutation({
        mutationFn: async (data: recreateQuizGQLDto) =>
            request(graphqlURL, recreateQuizGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),

        onSuccess: (data) => {
            const questions = readFragment(
                quizQuestionFragment,
                data.RecreateQuiz.questions
            );
            setQuiz({ ...data.RecreateQuiz, questions: [...questions] });
        },
    });

    const updateQuiz = useMutation({
        mutationFn: async (data: updateQuizGQLDto) =>
            request(graphqlURL, updateQuizGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),

        onSuccess: (data) => {
            const questions = readFragment(
                quizQuestionFragment,
                data.updateQuiz.questions
            );
            setQuiz({ ...data.updateQuiz, questions: [...questions] });
        },
    });

    if (regenerateQuiz.isPending) {
        return (
            <Layout navigation={navigation} icon="quiz">
                <ActivityIndicator size="large" color="blue" />
            </Layout>
        );
    }
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
        if (lowerCaseName.endsWith('general')) {
            return 'general';
        } else if (lowerCaseName.endsWith('specific')) {
            return 'specific';
        } else if (lowerCaseName.endsWith('multiple_choice')) {
            return 'multiple_choice';
        } else if (lowerCaseName.endsWith('true/false')) {
            return 'true/false';
        } else {
            return '';
        }
    };

    const quizType = extractQuizType(quiz.name);

    const generateQuestionLayout = (index: number) => {
        if (quiz.questions[index].type === 'TRUE_FALSE') {
            return (
                <View>
                    <TextInput
                        placeholder="Question"
                        value={quiz.questions[index].question}
                        onChangeText={(text) => {
                            setQuiz((q) => {
                                return {
                                    ...q,
                                    questions: q.questions.map(
                                        (question, i) => {
                                            if (i === index) {
                                                return {
                                                    ...question,
                                                    question: text,
                                                };
                                            }
                                            return question;
                                        }
                                    ),
                                };
                            });
                        }}
                    />
                    <CustomButton
                        title={t('set_true')}
                        onPress={() => {
                            setQuiz((q) => {
                                return {
                                    ...q,
                                    questions: q.questions.map(
                                        (question, i) => {
                                            if (i === index) {
                                                return {
                                                    ...question,
                                                    correct: ['true'],
                                                };
                                            }
                                            return question;
                                        }
                                    ),
                                };
                            });
                        }}
                    />
                    <CustomButton
                        title={t('set_false')}
                        onPress={() => {
                            setQuiz((q) => {
                                return {
                                    ...q,
                                    questions: q.questions.map(
                                        (question, i) => {
                                            if (i === index) {
                                                return {
                                                    ...question,
                                                    correct: ['false'],
                                                };
                                            }
                                            return question;
                                        }
                                    ),
                                };
                            });
                        }}
                    />
                </View>
            );
        } else
            return (
                <View
                    style={{
                        alignItems: 'center',
                    }}
                >
                    <TextInput
                        style={{
                            fontSize: fontPixel(20),
                            textAlign: 'center',
                        }}
                        multiline
                        placeholder="Question"
                        value={quiz.questions[index].question}
                        onChangeText={(text) => {
                            setQuiz((q) => {
                                return {
                                    ...q,
                                    questions: q.questions.map(
                                        (question, i) => {
                                            if (i === index) {
                                                return {
                                                    ...question,
                                                    question: text,
                                                };
                                            }
                                            return question;
                                        }
                                    ),
                                };
                            });
                        }}
                    />

                    {quiz.questions[index].answers.map((ans) => {
                        return (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    padding: 10,
                                    width: '90%',
                                    borderWidth: 2,
                                    borderColor:
                                        ans === quiz.questions[index].correct[0]
                                            ? 'green'
                                            : 'transparent',
                                    borderRadius: 20,
                                }}
                            >
                                <TextInput
                                    placeholder="Answer"
                                    value={ans}
                                    multiline
                                    style={{
                                        width: '50%',
                                    }}
                                    onChangeText={(text) => {
                                        setQuiz((q) => {
                                            return {
                                                ...q,
                                                questions: q.questions.map(
                                                    (question, i) => {
                                                        if (i === index) {
                                                            return {
                                                                ...question,
                                                                answers:
                                                                    question.answers.map(
                                                                        (
                                                                            answer,
                                                                            j
                                                                        ) => {
                                                                            if (
                                                                                j ===
                                                                                index
                                                                            ) {
                                                                                return text;
                                                                            }
                                                                            return answer;
                                                                        }
                                                                    ),
                                                            };
                                                        }
                                                        return question;
                                                    }
                                                ),
                                            };
                                        });
                                    }}
                                />
                                <CustomButton
                                    title={t('set_correct')}
                                    onPress={() => {
                                        setQuiz((q) => {
                                            return {
                                                ...q,
                                                questions: q.questions.map(
                                                    (question, i) => {
                                                        if (i === index) {
                                                            return {
                                                                ...question,
                                                                correct: [ans],
                                                            };
                                                        }
                                                        return question;
                                                    }
                                                ),
                                            };
                                        });
                                    }}
                                />
                            </View>
                        );
                    })}
                </View>
            );
    };

    if (editActive) {
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
                <View>{generateQuestionLayout(currentIndex)}</View>
                <View
                    style={{
                        width: '80%',
                        marginLeft: '10%',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        margin: 10,
                    }}
                >
                    {currentIndex != 0 && (
                        <CustomButton
                            onPress={() => {
                                setCurrentIndex(currentIndex - 1);
                            }}
                            title={t('previous_question')}
                        />
                    )}
                    <CustomButton
                        onPress={() => {
                            if (currentIndex === quiz.questions.length - 1) {
                                updateQuiz.mutate({
                                    updateQuiz: {
                                        id: quiz.id,
                                        questions: quiz.questions,
                                    },
                                });

                                setEditActive(false);
                            } else {
                                setCurrentIndex((ind) => {
                                    return ind + 1;
                                });
                            }
                        }}
                        title={`${currentIndex == quiz.questions.length - 1
                            ? t('save_quiz')
                            : t('next_question')
                            }`}
                    />
                </View>
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
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                {quizType ? (
                    <Text style={{ textAlign: 'center', fontSize: fontPixel(20), color: 'red' }}>
                        {t('additional_quiz_only_editable')}
                    </Text>
                ) : (
                    <>
                        <Text style={{ textAlign: 'center', fontSize: fontPixel(40) }}>
                            {t('recreate_quiz')}
                        </Text>
                        <TextInput
                            placeholder={t('question_count')}
                            keyboardType="numeric"
                            onChangeText={(text) => setQuestionCount(parseInt(text))}
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                fontSize: fontPixel(20),
                            }}
                        />
                        <TextInput
                            placeholder={t('answer_count')}
                            keyboardType="numeric"
                            onChangeText={(text) => setAnswerCount(parseInt(text))}
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                fontSize: fontPixel(20),
                            }}
                        />
                        <View style={{ padding: 5 }}>
                            <Text
                                style={{
                                    fontSize: fontPixel(20),
                                    padding: 10,
                                    color: 'black',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }}
                            >
                                {t('moderator_categories')}
                            </Text>
                            {types.map((c) => {
                                return (
                                    <TouchableOpacity key={c} onPress={() => { }}>
                                        <Text>{c}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                            <CustomButton
                                title={t('add_options')}
                                onPress={() => {
                                    setIsModalOpen(true);
                                }}
                            />
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={isModalOpen}
                                onRequestClose={() => {
                                    setIsModalOpen(false);
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: 'white',
                                            padding: 20,
                                            margin: 20,
                                            borderRadius: 10,
                                        }}
                                    >
                                        <Text>{t('select_categories_to_add')}</Text>
                                        {types.map((c) => {
                                            return (
                                                <TouchableOpacity
                                                    key={c}
                                                    onPress={() => {
                                                        setTypes((typ) => {
                                                            return typ.filter(
                                                                (t) => t !== c
                                                            );
                                                        });
                                                    }}
                                                >
                                                    <Text>{c}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                        <Text>{t('remaining_categories')}</Text>
                                        {allOptions
                                            .filter((option) => !types.includes(option))
                                            .map((c) => {
                                                return (
                                                    <TouchableOpacity
                                                        key={c}
                                                        style={{
                                                            padding: 5,
                                                            backgroundColor:
                                                                'lightgray',
                                                            margin: 2,
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            justifyContent: 'center',
                                                        }}
                                                        onPress={() => {
                                                            setTypes((typ) => {
                                                                return [...typ, c];
                                                            });
                                                        }}
                                                    >
                                                        <Text>{t(c)}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        <CustomButton
                                            onPress={() => {
                                                setIsModalOpen(false);
                                            }}
                                            title={t('close')}
                                        />
                                    </View>
                                </View>
                            </Modal>
                        </View>
                        <View style={{ height: 10 }} />

                        <CustomButton
                            onPress={() => {
                                regenerateQuiz.mutate({
                                    recreateQuiz: {
                                        quizId: quiz.id,
                                        questionCount: questionCount,
                                        answerCount: answerCount,
                                        quizOptions: types,
                                    },
                                });
                            }}
                            title={t('recreate_quiz')}
                        />
                    </>
                )}
                <View style={{ height: 10 }} />
                <CustomButton
                    onPress={() => {
                        setEditActive(!editActive);
                    }}
                    title={t('edit')}
                />
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
});

export default QuizEdit;