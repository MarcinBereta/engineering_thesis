import { View, Text, Button, Dimensions, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useEffect } from 'react';
import { fontPixel } from '../utils/Normalize';
import { setNavigationRef } from '@/utils/NavigationRef';
import { Layout } from '@/components/Layout';
import { Avatar, Icon } from '@rneui/themed';
import { DashboardCourseSection } from '@/components/dashboard/CourseSection';
import { DashboardQuizSection } from '@/components/dashboard/QuizSection';
import { DashboardFitableCourseSection } from '@/components/dashboard/FitableCourseSection';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { dashboardDataGQL, getUserScoreGQL, mostFitableCourseGQL } from '@/services/quiz/quiz';
import { DashboardFriendsSection } from '@/components/dashboard/FriendsSection';
import { CustomButton } from '@/components/CustomButton';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
import { getUsersGQL } from '@/services/admin/admin';
const { height, width } = Dimensions.get('window');

type DashboardScreen = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'DashboardScreen'
>;
const DashboardScreen = (props: DashboardScreen) => {
    const { t } = useTranslation();
    const { logout, userInfo, socket } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const { data: data, isLoading, refetch, isError, error } = useQuery({
        queryKey: ['courses'],
        queryFn: async () =>
            request(
                graphqlURL,
                dashboardDataGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });
    const { data: mostFitableCourseData } = useQuery({
        queryKey: ['MostFitableCourse'],
        queryFn: async () =>
            request(
                graphqlURL,
                mostFitableCourseGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            )
    });
    const { data: scoresData } = useQuery({
        queryKey: ['UserScore'],
        queryFn: async () =>
            request(
                graphqlURL,
                getUserScoreGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            )
    });
    useEffect(() => {
        setNavigationRef(props.navigation);
    }, []);

    if (userInfo === null || data === undefined) {
        return null;
    }
    if (scoresData === undefined || mostFitableCourseData === undefined) {
        return null;
    }
    return (
        <Layout navigation={props.navigation} icon="home">
            <View style={{ flexDirection: 'column' }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <Avatar
                        containerStyle={{ margin: 10 }}
                        size={width * 0.1}
                        rounded
                        source={{
                            uri: 'https://randomuser.me/api/portraits/men/36.jpg',
                        }}
                        onPress={() => {
                            props.navigation.navigate('UserProfile');
                        }}
                    />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                        }}
                    >
                        <Icon
                            type="font-awesome"
                            name="bell"
                            size={width * 0.08}
                            color="black"
                            containerStyle={{ margin: 5 }}
                        />
                        <TouchableOpacity
                            onPress={() => {
                                props.navigation.navigate('UserSettings');
                            }}
                        >
                            <Icon
                                type="font-awesome"
                                name="gear"
                                size={width * 0.08}
                                color="black"
                                containerStyle={{ margin: 5 }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flexDirection: 'column' }}>
                    <Text
                        style={{
                            fontSize: fontPixel(20),
                            padding: 10,
                            color: 'black',
                        }}
                    >
                        {t('hello')} {userInfo.username}
                    </Text>
                </View>

                <ScrollView
                    style={{
                        maxHeight: height * 0.7,
                    }}
                >
                    <DashboardFitableCourseSection
                        navigation={props.navigation}
                        course={mostFitableCourseData?.getMostFitCourse}
                        userScore={scoresData?.getUserScore}
                    />
                    <DashboardCourseSection
                        navigation={props.navigation}
                        courses={data?.dashboardCourses}
                        userScore={scoresData?.getUserScore}
                    />
                    <DashboardQuizSection
                        navigation={props.navigation}
                        quizzes={data?.getDashboardQuizzes}
                        userScore={scoresData?.getUserScore}
                    />
                    <DashboardFriendsSection
                        navigation={props.navigation}
                        friends={data?.getUserFriends}
                    />
                </ScrollView>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        marginTop: 10,
                    }}
                >
                    {userInfo?.verified ? (
                        <CustomButton
                            title={t('create_course')}
                            onPress={() => {
                                props.navigation.push('createCourse');
                            }}
                        />
                    ) : (
                        <CustomButton
                            title={t('verify_account')}
                            onPress={() => {
                                props.navigation.push('VerifyAccount');
                            }}
                        />
                    )}

                    <CustomButton
                        title={t('logout')}
                        onPress={() => {
                            logout();
                        }}
                    />
                </View>
            </View>
        </Layout>
    );
};

export { DashboardScreen };
