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
            <Stack.Screen component={CourseForm} name="createCourse" />
            <Stack.Screen component={Course} name="course" />
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
