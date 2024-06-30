import { View, Text, Button, Dimensions } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useEffect } from 'react';
import { fontPixel } from '../utils/Normalize';
import { setNavigationRef } from '@/utils/NavigationRef';
import { Layout } from '@/components/Layout';
import { Avatar, Icon } from '@rneui/themed';
import { DashboardCourseSection } from '@/components/dashboard/CourseSection';
import { DashboardQuizSection } from '@/components/dashboard/QuizSection';
const {height, width} = Dimensions.get('window');
const DashboardScreen = (props: any) => {
    const { logout, userInfo, socket } = useContext(AuthContext);
    
    if(userInfo === null){
        return null;
    }

    useEffect(() => {
        setNavigationRef(props.navigation);
    }, []);

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
                    containerStyle={{margin:10}}
                        size={width*0.1}
                        rounded
                        source={{
                            uri: 'https://randomuser.me/api/portraits/men/36.jpg',
                        }}
                    />
                    <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                        <Icon type="font-awesome" name="bell" size={width*0.08} color="black" containerStyle={{margin:5}}/>
                        <Icon type="font-awesome" name="gear" size={width*0.08} color="black" containerStyle={{margin:5}}/>
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
                    <DashboardCourseSection navigation={props.navigation}/>
                    <DashboardQuizSection navigation={props.navigation}/>

                </View>

                <Button
                    title="View courses"
                    onPress={() => {
                        props.navigation.push('CoursesList');
                    }}
                />
                <Button
                    title="View quizes"
                    onPress={() => {
                        props.navigation.push('QuizesList');
                    }}
                />
                <Button
                    title="My courses"
                    onPress={() => {
                        props.navigation.push('MyCourses');
                    }}
                />
                {userInfo?.verified ? (
                    <Button
                        title="Create course"
                        onPress={() => {
                            props.navigation.push('createCourse');
                        }}
                    />
                ) : (
                    <Button
                        title="Verify account"
                        onPress={() => {
                            props.navigation.push('VerifyAccount');
                        }}
                    />
                )}

                <Button
                    title="Friends"
                    onPress={() => {
                        props.navigation.push('Friends');
                    }}
                />
                {userInfo?.role == 'ADMIN' || userInfo?.role == 'MODERATOR' ? (
                    <Button
                        title="Verify courses"
                        onPress={() => {
                            props.navigation.push('UnVerifiedCourses');
                        }}
                    />
                ) : null}
                {userInfo?.role == 'ADMIN' || userInfo?.role == 'MODERATOR' ? (
                    <Button
                        title="Verify users"
                        onPress={() => {
                            props.navigation.push('VerifyUsers');
                        }}
                    />
                ) : null}
                {userInfo?.role == 'ADMIN' ? (
                    <Button
                        title="Go to admin"
                        onPress={() => {
                            props.navigation.push('AdminPanel');
                        }}
                    />
                ) : null}

                <Button
                    title="Logout"
                    onPress={() => {
                        logout();
                    }}
                />
            </View>
        </Layout>
    );
};

export { DashboardScreen };
