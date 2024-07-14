import { View, Text, Button, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { getMyCoursesGQL } from '@/services/courses/courses';
import { graphqlURL } from '@/services/settings';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';

type MyCourses = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'MyCourses'
>;
const MyCourses = (props: MyCourses) => {
    const { t } = useTranslation();

    const { userInfo } = useContext(AuthContext);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['userId'],
        queryFn: async () =>
            request(
                graphqlURL,
                getMyCoursesGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    if (isLoading || data == undefined) {
        return <Text>{t('loading')}...</Text>;
    }

    return (
        <View style={{ flexDirection: 'column', flex: 1 }}>
            <Text>{t('courses_list')}: </Text>
            <FlatList
                data={data.MyCourses}
                renderItem={({ item }) => (
                    <View
                        style={{
                            padding: 5,
                            borderColor: 'black',
                            borderWidth: 1,
                            margin: 5,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Text style={{ flex: 6 }}>{item.name}</Text>
                        <View
                            style={{
                                flex: 6,
                                justifyContent: 'space-around',
                                flexDirection: 'row',
                            }}
                        >
                            <Button
                                onPress={() => {
                                    props.navigation.push('course', {
                                        course: item,
                                    });
                                }}
                                title="View"
                            />
                            <Button
                                onPress={() => {
                                    props.navigation.push('EditCourse', {
                                        course: item,
                                    });
                                }}
                                title="Edit"
                            />
                        </View>
                    </View>
                )}
            />

            {userInfo?.verified ? (
                <Button
                    title={t('create_course')}
                    onPress={() => {
                        props.navigation.push('createCourse');
                    }}
                />
            ) : null}
        </View>
    );
};

export { MyCourses };
