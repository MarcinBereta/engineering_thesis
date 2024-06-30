import { View, Text, Button, TouchableOpacity, Dimensions } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import {
    getUnverifiedCoursesGQL,
    verifyCourseGQL,
} from '@/services/courses/courses';
import { useMutation, useQuery } from '@tanstack/react-query';
import { VariablesOf } from '@/graphql';
import { CourseListItem } from '@/components/courses/list/CourseListItem';
import { CustomButton } from '@/components/CustomButton';
import { Layout } from '@/components/Layout';
import { normalizeText } from '@rneui/base';
const { height } = Dimensions.get('window');

export type verifyCourseDto = VariablesOf<typeof verifyCourseGQL>;
const UnVerifiedCoursesList = (props: any) => {
    const { userInfo } = useContext(AuthContext);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['userId'],
        queryFn: async () =>
            request(
                graphqlURL,
                getUnverifiedCoursesGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    const verifyCourseMutation = useMutation({
        mutationFn: async (data: verifyCourseDto) =>
            request(graphqlURL, verifyCourseGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: (data, variables, context) => {
            props.navigation.push('CoursesList');
            refetch();
        },
    });

    if (isLoading || data == undefined) {
        return <Text>Loading...</Text>;
    }

    const handleVerify = async (courseId: string) => {
        verifyCourseMutation.mutate({
            verifyCourse: {
                courseId,
            },
        });
    };

    return (
        <Layout navigation={props.navigation} icon="course">
            <View style={{ flexDirection: 'column', flex: 1 }}>
            <Text style={{textAlign: 'center', fontWeight:'bold', fontSize:normalizeText(30)}}>Course list</Text>
                <FlatList
                    data={data.unVerifiedCourses}
                    contentContainerStyle={{ maxHeight: height * 0.6 }}
                    renderItem={({ item }) => (
                        <CourseListItem
                            course={item}
                            navigation={props.navigation}
                        >
                            <CustomButton
                                onPress={() => {
                                    handleVerify(item?.id || '');
                                }}
                                title="Verify"
                            />
                        </CourseListItem>
                    )}
                />
            </View>
        </Layout>
    );
};

export { UnVerifiedCoursesList };
