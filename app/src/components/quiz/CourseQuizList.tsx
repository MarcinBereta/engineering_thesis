import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Button,
    Modal,
    StyleSheet,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AuthContext } from '../../contexts/AuthContext';
import { graphqlURL } from '@/services/settings';
import { useMutation, useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import {
    GetCoursesWithPaginationGQL,
    generateMoreQestionsforAddictionalQuizGQL,
    getUserScoreGQL,
} from '@/services/quiz/quiz';
import { useTranslation } from 'react-i18next';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckBox, normalizeText } from '@rneui/base';
import { QuizzesListItem } from './QuizListItem';
import { Layout } from '../Layout';
import { CustomButton } from '../CustomButton';
import { Alert } from 'react-native';

const ProgressBar = ({ progress }: { progress: number }) => {
    return (
        <View
            style={{
                width: '100%',
                backgroundColor: '#e0e0df',
                borderRadius: 5,
            }}
        >
            <View
                style={{
                    width: `${progress}%`,
                    height: 10,
                    backgroundColor: '#76c7c0',
                    borderRadius: 5,
                }}
            ></View>
        </View>
    );
};

type CourseQuizzesListProps = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'CourseQuizzesList'
>;

export type MoreQuizzesDto = {
    generateMoreQuestions: {
        courseId: string;
        quizOptions: string[];
    };
};

const CourseQuizzesList = (props: CourseQuizzesListProps) => {
    const { userInfo } = useContext(AuthContext);
    const { t } = useTranslation();
    const { courseId } = props.route.params;
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [progress, setProgress] = useState(0);
    const fetchQuizzes = async (courseId: string) => {
        return request(
            graphqlURL,
            GetCoursesWithPaginationGQL,
            { courseId },
            { Authorization: 'Bearer ' + userInfo?.token }
        );
    };

    const fetchUserScore = async () => {
        return request(
            graphqlURL,
            getUserScoreGQL,
            {},
            { Authorization: 'Bearer ' + userInfo?.token }
        );
    };

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['quizzes', courseId],
        queryFn: () => fetchQuizzes(courseId),
    });

    const { data: scoresData } = useQuery({
        queryKey: ['UserScore'],
        queryFn: fetchUserScore,
    });

    const toggleOption = (option: string) => {
        setSelectedOptions((prev) => {
            if (prev.includes(option)) {
                return prev.filter((item) => item !== option);
            } else {
                return [...prev, option];
            }
        });
    };

    const isAuthorized = () => {
        return (
            userInfo?.id === data?.getQuizzesByCourseId[0]?.course?.creatorId
        );
    };

    const generateMoreQuizzes = useMutation({
        mutationFn: async (data: MoreQuizzesDto) =>
            request(
                graphqlURL,
                generateMoreQestionsforAddictionalQuizGQL,
                data,
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
        onError: (err: any) => {
            Alert.alert(t('error'), t('failed_to_generate_quiz'));
            console.error('Error:', err);
        },
        onMutate: () => {
            setIsCreating(true);
            setProgress(0);
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev < 90) {
                        return prev + 10;
                    } else {
                        clearInterval(interval);
                        return prev;
                    }
                });
            }, 500);
        },
        onSuccess: (data) => {
            setProgress(100); // Complete progress

            console.log('Generated quizzes:', data);
            props.navigation.push('DashboardScreen');
            refetch();
        },
    });

    const extractQuizType = (quizName: string): string => {
        const lowerCaseName = quizName.toLowerCase();
        if (lowerCaseName.includes('general')) {
            return 'general';
        } else if (lowerCaseName.includes('specific')) {
            return 'specific';
        } else if (lowerCaseName.includes('multiple_choice')) {
            return 'multiple';
        } else if (lowerCaseName.includes('true/false')) {
            return 'truefalse';
        } else {
            return '';
        }
    };

    const handleQuizCreate = () => {
        const generatedQuizTypes =
            data?.getQuizzesByCourseId.map((quiz) => {
                return extractQuizType(quiz.name);
            }) || [];
        console.log('Generated quiz types:', generatedQuizTypes);
        console.log('Selected options:', selectedOptions);
        if(selectedOptions.length === 0) {
            Alert.alert(t('error'), t('select_at_least_one_quiz_type'));
            return;
        }
        for (const option of selectedOptions) {
            if (generatedQuizTypes.includes(option)) {
                Alert.alert(t('error'), t('quiz_type_already_exists'));
                return;
            }
        }

        generateMoreQuizzes.mutate({
            generateMoreQuestions: {
                courseId,
                quizOptions: selectedOptions,
            },
        });
    };

    if (!userInfo || !data || !scoresData) {
        return null;
    }

    return (
        <Layout navigation={props.navigation} icon="quiz">
            <Text
                style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: normalizeText(30),
                }}
            >
                {t('course_quizzes_list')}
            </Text>
            <FlatList
                data={data.getQuizzesByCourseId}
                renderItem={({ item }) => (
                    <QuizzesListItem
                        key={item.id}
                        item={item}
                        navigation={props.navigation}
                        userScore={scoresData.getUserScore}
                    />
                )}
            />
            {isAuthorized() && (
                <View style={{ width: '80%', left: '10%' }}>
                    <CustomButton
                        title={t('generate_more_quizzes')}
                        onPress={() => setModalVisible(true)}
                    />
                </View>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {isCreating ? (
                        <ProgressBar progress={progress} />
                    ) : (
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {t('select_quiz_types')}
                            </Text>
                            <View style={styles.checkboxContainer}>
                                <CheckBox
                                    checked={selectedOptions.includes(
                                        'truefalse'
                                    )}
                                    onPress={() => toggleOption('truefalse')}
                                    style={styles.checkbox}
                                />
                                <Text style={styles.label}>
                                    {t('truefalse')}
                                </Text>
                            </View>
                            <View style={styles.checkboxContainer}>
                                <CheckBox
                                    checked={selectedOptions.includes(
                                        'specific'
                                    )}
                                    onPress={() => toggleOption('specific')}
                                    style={styles.checkbox}
                                />
                                <Text style={styles.label}>
                                    {t('specific')}
                                </Text>
                            </View>
                            <View style={styles.checkboxContainer}>
                                <CheckBox
                                    checked={selectedOptions.includes(
                                        'general'
                                    )}
                                    onPress={() => toggleOption('general')}
                                    style={styles.checkbox}
                                />
                                <Text style={styles.label}>{t('general')}</Text>
                            </View>
                            <View style={styles.checkboxContainer}>
                                <CheckBox
                                    checked={selectedOptions.includes(
                                        'multiple'
                                    )}
                                    onPress={() => toggleOption('multiple')}
                                    style={styles.checkbox}
                                />
                                <Text style={styles.label}>
                                    {t('multiple')}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <CustomButton
                                    title={t('generate')}
                                    onPress={handleQuizCreate}
                                />
                                <CustomButton
                                    title={t('cancel')}
                                    onPress={() => setModalVisible(false)}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </Modal>
        </Layout>
    );
};

const styles = StyleSheet.create({
    generateButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        margin: 20,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
    },
    checkbox: {
        alignSelf: 'center',
    },
    label: {
        margin: 8,
    },
});

export { CourseQuizzesList };
