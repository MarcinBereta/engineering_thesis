import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Button, Modal, StyleSheet } from 'react-native';
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
            userInfo?.role === 'ADMIN' ||
            userInfo?.role === 'MODERATOR' ||
            userInfo?.id === data?.getQuizzesByCourseId[0]?.course?.creatorId
        );
    };

    const generateMoreQuizzes = useMutation({
        mutationFn: async (data: MoreQuizzesDto) =>
            request(graphqlURL, generateMoreQestionsforAddictionalQuizGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onError: (err: any) => {
            console.error('Error:', err);
        },
        onSuccess: (data) => {
            console.log('Generated quizzes:', data);
            props.navigation.push('DashboardScreen');
            refetch();
        },
    });

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
                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.generateButtonText}>{t('generate_more_quizzes')}</Text>
                </TouchableOpacity>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('select_quiz_types')}</Text>
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                checked={selectedOptions.includes('truefalse')}
                                onPress={() => toggleOption('truefalse')}
                                style={styles.checkbox}
                            />
                            <Text style={styles.label}>{t('truefalse')}</Text>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                checked={selectedOptions.includes('specific')}
                                onPress={() => toggleOption('specific')}
                                style={styles.checkbox}
                            />
                            <Text style={styles.label}>{t('specific')}</Text>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                checked={selectedOptions.includes('general')}
                                onPress={() => toggleOption('general')}
                                style={styles.checkbox}
                            />
                            <Text style={styles.label}>{t('general')}</Text>
                        </View>
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                checked={selectedOptions.includes('multiple')}
                                onPress={() => toggleOption('multiple')}
                                style={styles.checkbox}
                            />
                            <Text style={styles.label}>{t('multiple')}</Text>
                        </View>
                        <Button
                            title={t('generate')}
                            onPress={() =>
                                generateMoreQuizzes.mutate({
                                    generateMoreQuestions: {
                                        courseId,
                                        quizOptions: selectedOptions,
                                    },
                                })
                            }
                        />
                        <Button title={t('cancel')} onPress={() => setModalVisible(false)} />
                    </View>
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