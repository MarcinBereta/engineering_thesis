import {Socket} from 'socket.io-client';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {DashboardScreen} from './DashboardScreen';
import {LoginScreen} from './LoginScreen';
import {RegisterScreen} from './RegisterScreen';
import {SplashScreen} from './SplashScreen';
import {useContext} from 'react';
import {AuthContext} from '../contexts/AuthContext';
import {CourseForm} from '../components/courses/CourseForm/CourseForm';
import Course from '../components/courses/course/CourseItem';
import {CoursesList} from './CoursesList';
import {MyCourses} from './MyCourses';
import {CourseEditForm} from '../components/courses/CourseForm/CourseFormEdit';
import {UserList} from './UserList';
import {AdminPanel} from './AdminPanel';
import {User} from './User';
import {UnVerifiedCoursesList} from './UnVerifiedCoursesList';
import {VerifyAccount} from '../components/users/VerifyAccount';
import {VerifyUsers} from '../components/users/VerifyUsers';
// import {Stack}
const Stack = createNativeStackNavigator();

const Navigator = ({socket}: {socket: Socket}) => {
  const {userInfo, splashLoading} = useContext(AuthContext);
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}>
        {splashLoading ? (
          <Stack.Screen component={SplashScreen} name="SplashScreen" />
        ) : userInfo != null ? (
          <>
            <Stack.Screen component={DashboardScreen} name="DashboardScreen" />
            <Stack.Screen component={CoursesList} name="CoursesList" />
            <Stack.Screen
              component={UnVerifiedCoursesList}
              name="UnVerifiedCourses"
            />
            <Stack.Screen component={MyCourses} name="MyCourses" />
            <Stack.Screen component={CourseEditForm} name="EditCourse" />
            <Stack.Screen component={CourseForm} name="createCourse" />
            <Stack.Screen component={Course} name="course" />
            <Stack.Screen component={User} name="User" />
            <Stack.Screen component={UserList} name="UserList" />
            <Stack.Screen component={AdminPanel} name="AdminPanel" />
            <Stack.Screen component={VerifyUsers} name="VerifyUsers" />

            <Stack.Screen component={VerifyAccount} name="VerifyAccount" />
          </>
        ) : (
          <>
            <Stack.Screen component={LoginScreen} name="LoginScreen" />
            <Stack.Screen component={RegisterScreen} name="RegisterScreen" />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export {Navigator};
