import { View, Text, Dimensions } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import {
    declineCourseGQL,
    getUnverifiedCoursesGQL,
    verifyCourseGQL,
} from '@/services/courses/courses';
import { useMutation, useQuery } from '@tanstack/react-query';
import { VariablesOf } from '@/graphql';
import { CourseListItem } from '@/components/courses/list/CourseListItem';
import { CustomButton } from '@/components/CustomButton';
import { Layout } from '@/components/Layout';
import { normalizeText } from '@rneui/base';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
const { height } = Dimensions.get('window');

type UnVerifiedCourses = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'UnVerifiedCourses'
>;

export type verifyCourseDto = VariablesOf<typeof verifyCourseGQL>;
export type declineCourseDto = VariablesOf<typeof declineCourseGQL>;


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

const UnVerifiedCoursesList = (props: UnVerifiedCourses) => {
    const { t } = useTranslation();
    const { userInfo } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const { data, refetch } = useQuery({
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
        mutationFn: async (data: verifyCourseDto) => {
            try {
                console.log('Sending request with data:', data);
                const result = await request(
                    graphqlURL,
                    verifyCourseGQL,
                    data,
                    {
                        Authorization: 'Bearer ' + userInfo?.token,
                    }
                );
                console.log('Request result:', result);
                return result;
            } catch (error) {
                console.error('Request error:', error);
                throw error;
            }
        },
        onMutate: () => {
            setIsLoading(true);
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
        onSuccess: (data, variables, context) => {
            setProgress(100); // Complete progress
            setIsLoading(false);
            console.log('Done!');
            props.navigation.push('DashboardScreen');
            refetch();
        },
        onError: () => {
            setIsLoading(false);
            setProgress(0);
        },
    });

    const declineCourseMutation = useMutation({
        mutationFn: async (data: declineCourseDto) => {
            try {
                const result = await request(
                    graphqlURL,
                    declineCourseGQL,
                    data,
                    {
                        Authorization: 'Bearer ' + userInfo?.token,
                    }
                );
                return result;
            } catch (error) {
                console.error('Request error:', error);
                throw error;
            }
        },
        onMutate: () => {
            setIsLoading(true);
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
        onSuccess: (data, variables, context) => {
            setProgress(100); // Complete progress
            setIsLoading(false);
            console.log('Done!');
            props.navigation.push('UnVerifiedCourses');
            refetch();
        },
        onError: () => {
            setIsLoading(false);
            setProgress(0);
        },
    });

    const handleVerify = async (courseId: string) => {
        verifyCourseMutation.mutate({
            verifyCourse: {
                courseId,
            },
        });
    };
    const handleDecline = async (courseId: string) => {
        declineCourseMutation.mutate({
            verifyCourse: {
                courseId,
            },
        });
    };

    if (isLoading || data == undefined) {
        return (
            <View>
                <Text>Removing course...</Text>
                <ProgressBar progress={progress} />
            </View>
        );
    }

    return (
        <Layout navigation={props.navigation} icon="course">
            <View style={{ flexDirection: 'column', flex: 1 }}>
                <Text
                    style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: normalizeText(30),
                    }}
                >
                    {t('courses_list')}
                </Text>
                {isLoading && <ProgressBar progress={progress} />}
                <FlatList
                    data={data.unVerifiedCourses}
                    // contentContainerStyle={{ maxHeight: height * 0.5 }}
                    renderItem={({ item }) => (
                        <CourseListItem
                            course={item}
                            navigation={props.navigation}
                            userScore={[]}
                        >
                            <View
                                style={{
                                    justifyContent: 'space-around',
                                    flexDirection: 'row',
                                }}
                            >
                                <View>
                                    <CustomButton
                                        onPress={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleVerify(item?.id || '');
                                        }}
                                        title={t('verify')}
                                    />
                                </View>
                                <View>
                                    <CustomButton
                                        onPress={() => {
                                            handleDecline(item.id);
                                        }}
                                        backgroundColor="red"
                                        title="Decline"
                                    />
                                </View>
                            </View>
                        </CourseListItem>
                    )}
                />
            </View>
        </Layout>
    );
};

export { UnVerifiedCoursesList };
