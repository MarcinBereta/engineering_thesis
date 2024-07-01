import { View, Text, Button, Dimensions } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useEffect } from 'react';
import { fontPixel } from '../utils/Normalize';
import { setNavigationRef } from '@/utils/NavigationRef';
import { Layout } from '@/components/Layout';
import { Avatar, Icon } from '@rneui/themed';
import { DashboardCourseSection } from '@/components/dashboard/CourseSection';
import { DashboardQuizSection } from '@/components/dashboard/QuizSection';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { dashboardDataGQL } from '@/services/quiz/quiz';
import { DashboardFriendsSection } from '@/components/dashboard/FriendsSection';
import { CustomButton } from '@/components/CustomButton';
const { height, width } = Dimensions.get('window');
const DashboardScreen = (props: any) => {
    const { logout, userInfo, socket } = useContext(AuthContext);

    const { data, isLoading, refetch, isError, error } = useQuery({
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
    useEffect(() => {
        setNavigationRef(props.navigation);
    }, []);

    if (userInfo === null || data === undefined) {
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
                        <Icon
                            type="font-awesome"
                            name="gear"
                            size={width * 0.08}
                            color="black"
                            containerStyle={{ margin: 5 }}
                        />
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
                        {userInfo.username}
                    </Text>
                </View>

                <View>
                    <DashboardCourseSection
                        navigation={props.navigation}
                        courses={data?.dashboardCourses}
                    />
                    <DashboardQuizSection
                        navigation={props.navigation}
                        quizzes={data?.getDashboardQuizzes}
                    />
                    <DashboardFriendsSection
                        navigation={props.navigation}
                        friends={data?.getUserFriends}
                    />
                </View>
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
                            title="Create course"
                            onPress={() => {
                                props.navigation.push('createCourse');
                            }}
                        />
                    ) : (
                        <CustomButton
                            title="Verify account"
                            onPress={() => {
                                props.navigation.push('VerifyAccount');
                            }}
                        />
                    )}

                    <CustomButton
                        title="Logout"
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
