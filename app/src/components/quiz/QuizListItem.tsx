import { Text, TouchableOpacity, View } from 'react-native';
import { getQuizzesWithPaginationGQL } from '@/services/quiz/quiz';
import { Card } from '@rneui/themed';
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
}: {
    navigation: NavigationType;
    item: ResultOf<
        typeof getQuizzesWithPaginationGQL
    >['getQuizzesWithPagination'][0];
}) => {
    const { t } = useTranslation();

    const { userInfo } = useContext(AuthContext);
    const isAuthorized = () => {
        return (
            userInfo?.role === 'ADMIN' ||
            userInfo?.role === 'MODERATOR' ||
            userInfo?.id === item.course?.creatorId
        );
    };

    return (
        <Card
            containerStyle={{
                padding: 15,
                width: '90%',
                marginLeft: '5%',
                borderRadius: 20,
            }}
        >
            <TouchableOpacity
                onPress={() => {
                    navigation.push('quiz', { quiz: item });
                }}
            >
                <Card.Title>{item.name}</Card.Title>
                <Card.Divider />
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold' }}>
                            {t('course')}:
                        </Text>
                        <Text> {item.course?.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold' }}>
                            {t('category')}:
                        </Text>
                        <Text> {t(item.course?.category as string)}</Text>
                    </View>
                </View>
                <>
                    {isAuthorized() && (
                        <TouchableOpacity
                            style={{
                                width: '80%',
                                padding: 5,
                                backgroundColor: 'lightblue',
                                marginLeft: '10%',
                                borderRadius: 20,
                                marginTop: 20,
                            }}
                            onPress={() => {
                                navigation.push('QuizEdit', { quiz: item });
                            }}
                        >
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    fontSize: 15,
                                    color: 'white',
                                }}
                            >
                                Edit quiz
                            </Text>
                        </TouchableOpacity>
                    )}</>
            </TouchableOpacity>
        </Card>
    );
};

export { QuizzesListItem };
