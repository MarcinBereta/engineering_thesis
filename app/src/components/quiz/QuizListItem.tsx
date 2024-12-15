import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { getQuizzesWithPaginationGQL, getUserScoreGQL } from '@/services/quiz/quiz';
import { Card, Icon } from '@rneui/themed';
import { NavigationType } from '../Navbar';
import { ResultOf } from 'gql.tada';
import { useTranslation } from 'react-i18next';
import { Touchable } from 'react-native';
import { AuthContext } from '@/contexts/AuthContext';
import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { getMyCoursesGQL } from '@/services/courses/courses';
import Course from '../courses/course/CourseItem';

const QuizzesListItem = ({
    navigation,
    item,
    userScore,
}: {
    navigation: NavigationType;
    item: ResultOf<
        typeof getQuizzesWithPaginationGQL
    >['getQuizzesWithPagination'][0];
    userScore: ResultOf<typeof getUserScoreGQL>['getUserScore'];
}) => {
    const { t } = useTranslation();
    const hasCompletedQuiz = (quizName: string) => {
        if (userScore === undefined) {
            return false;
        }
        return userScore.some((score) => score.quizName === quizName) || false;
    };

    const getResultOfQuiz = (quizName: string) => {
        if (userScore === undefined) {
            return '';
        }
        const quizResult = userScore.find(score => score.quizName === quizName);
        if (quizResult === undefined) {
            return '';
        }

        const { score, noQuest } = quizResult;
        return `${score}/${noQuest}`;
    };

    const { userInfo } = useContext(AuthContext);
    const isAuthorized = () => {
        return (
            userInfo?.role === 'ADMIN' ||
            userInfo?.role === 'MODERATOR' ||
            userInfo?.id === item.course?.creatorId
        );
    };

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

    const quizType = extractQuizType(item.name);

    return (
        <Card
            containerStyle={styles.cardContainer}
        >
            <TouchableOpacity
                onPress={() => {
                    navigation.push('quiz', { quiz: item });
                }}
            >
                <View style={styles.iconContainer}>
                    {quizType && getQuizTypeIcon(quizType)}
                </View>
                <Card.Title style={styles.cardTitle}>
                    <Text style={{ marginLeft: 0 }}>
                        {item.name.replace(/(general|specific|multiple_choice|true\/false)/i, '')}
                    </Text>
                    {hasCompletedQuiz(item.name) && (
                        <Icon
                            type="font-awesome"
                            name="check"
                            size={15}
                            color="green"
                            style={{ marginLeft: 10 }}
                        />
                    )}
                </Card.Title>
                <Text style={styles.resultText}>
                    {getResultOfQuiz(item.name)}
                </Text>
                <Card.Divider />
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                            {t('course')}:
                        </Text>
                        <Text> {item.course?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                            {t('category')}:
                        </Text>
                        <Text> {t(item.course?.category as string)}</Text>
                    </View>
                </View>
                <>
                    {isAuthorized() && (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => {
                                navigation.push('QuizEdit', { quiz: item });
                            }}
                        >
                            <Text style={styles.editButtonText}>
                                {t('edit')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </>
            </TouchableOpacity>
        </Card>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        padding: 10,
        width: '90%',
        marginLeft: '5%',
        borderRadius: 20,
    },
    iconContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    cardTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 25,
    },
    resultText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
        color: 'blue',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoRow: {
        flexDirection: 'row',
    },
    infoLabel: {
        fontWeight: 'bold',
    },
    editButton: {
        width: '80%',
        padding: 5,
        backgroundColor: 'lightblue',
        marginLeft: '10%',
        borderRadius: 20,
        marginTop: 20,
    },
    editButtonText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 15,
        color: 'white',
    },
});

export { QuizzesListItem };