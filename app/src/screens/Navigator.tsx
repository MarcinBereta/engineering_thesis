import { Socket } from 'socket.io-client';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from './DashboardScreen';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { SplashScreen } from './SplashScreen';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { CourseForm } from '../components/courses/CourseForm/CourseForm';
import Course from '../components/courses/course/CourseItem';
import { CoursesList } from './CoursesList';
import { MyCourses } from './MyCourses';
import { CourseEditForm } from '../components/courses/CourseForm/CourseFormEdit';
import { UserList } from './UserList';
import { AdminPanel } from './AdminPanel';
import { UnVerifiedCoursesList } from './UnVerifiedCoursesList';
import { VerifyAccount } from '../components/users/VerifyAccount';
import { VerifyUsers } from '../components/users/VerifyUsers';
import { QuizzesList } from '../components/quiz/QuizList';
import QuizMain from './QuizMain';
import QuizSocket from '../components/quiz/QuizSocket';
import { Friends } from './Friends';
import QuizFriends from '@/components/quiz/QuizSocketFriends';
import QuizResult from './QuizResult';
import { ResultOf } from 'gql.tada';
import { quizQuestionFragment } from '@/services/quiz/quiz';
import { UserPage } from './User';
import { UserSettings } from './UserSettings';
import { UserProfile } from './UserProfile';
import QuizEdit from './QuizEdit';
import { CourseQuizzesList } from '@/components/quiz/CourseQuizList';

const Stack = createNativeStackNavigator();

export type Course = {
    id: string;
    name: string;
    category: string;
    summary: string | null;
    language: string | null;
    text: {
        id: string;
        type: string;
        value: string;
    }[];
};

export type Quiz = {
    courseId: string;
    id: string;
    name: string;
    questions: ResultOf<typeof quizQuestionFragment>[];
};
export type User = {
    username: string;
    email: string;
    id: string;
    token?: string;
    image: string | null;
    role: string;
    verified: boolean;
    Moderator?: {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        categories: string[];
    } | null;
};

export type AuthenticatedRootStackParamList = {
    DashboardScreen: undefined;
    CoursesList: undefined;
    QuizzesList: undefined;
    UnVerifiedCourses: undefined;
    MyCourses: undefined;
    EditCourse: { course: Course };
    createCourse: undefined;
    course: { course: Course };
    quiz: { quiz: Quiz };
    QuizEdit: { quiz: Quiz };
    QuizSearch: { quiz: Quiz };
    QuizWithFriends: { quiz: Quiz; friendId: string; invite: boolean };
    QuizResult: { score: number; total: number };
    Friends: undefined;
    User: { user: User };
    UserList: undefined;
    AdminPanel: undefined;
    VerifyUsers: undefined;
    VerifyAccount: undefined;
    UserSettings: undefined;
    UserProfile: undefined;
    CourseQuizzesList: {
        courseId: string;
    };
};

const Navigator = ({}: {}) => {
    const { userInfo, refreshLoading } = useContext(AuthContext);
    const AuthenticatedStack =
        createNativeStackNavigator<AuthenticatedRootStackParamList>();
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'none',
                }}
            >
                {refreshLoading ? (
                    <Stack.Screen
                        component={SplashScreen}
                        name="SplashScreen"
                    />
                ) : userInfo != null ? (
                    <>
                        <AuthenticatedStack.Screen
                            component={DashboardScreen}
                            name="DashboardScreen"
                        />
                        <AuthenticatedStack.Screen
                            component={CoursesList}
                            name="CoursesList"
                        />
                        <AuthenticatedStack.Screen
                            component={QuizzesList}
                            name="QuizzesList"
                        />

                        <AuthenticatedStack.Screen
                            component={UnVerifiedCoursesList}
                            name="UnVerifiedCourses"
                        />
                        <AuthenticatedStack.Screen
                            component={MyCourses}
                            name="MyCourses"
                        />
                        <AuthenticatedStack.Screen
                            component={CourseEditForm}
                            name="EditCourse"
                        />
                        <AuthenticatedStack.Screen
                            component={CourseForm}
                            name="createCourse"
                        />
                        <AuthenticatedStack.Screen
                            component={Course}
                            name="course"
                        />
                        <AuthenticatedStack.Screen
                            component={QuizMain}
                            name="quiz"
                        />
                        <AuthenticatedStack.Screen
                            component={QuizEdit}
                            name="QuizEdit"
                        />
                        <AuthenticatedStack.Screen
                            component={QuizSocket}
                            name="QuizSearch"
                        />
                        <AuthenticatedStack.Screen
                            component={QuizFriends}
                            name="QuizWithFriends"
                        />
                        <AuthenticatedStack.Screen
                            name="QuizResult"
                            component={QuizResult}
                        />
                        <AuthenticatedStack.Screen
                            component={Friends}
                            name="Friends"
                        />
                        <AuthenticatedStack.Screen
                            component={CourseQuizzesList}
                            name="CourseQuizzesList"
                        />
                        <AuthenticatedStack.Screen
                            component={UserPage}
                            name="User"
                        />
                        <AuthenticatedStack.Screen
                            component={UserSettings}
                            name="UserSettings"
                        />
                        <AuthenticatedStack.Screen
                            component={UserProfile}
                            name="UserProfile"
                        />
                        <AuthenticatedStack.Screen
                            component={UserList}
                            name="UserList"
                        />
                        <AuthenticatedStack.Screen
                            component={AdminPanel}
                            name="AdminPanel"
                        />
                        <AuthenticatedStack.Screen
                            component={VerifyUsers}
                            name="VerifyUsers"
                        />

                        <AuthenticatedStack.Screen
                            component={VerifyAccount}
                            name="VerifyAccount"
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            component={LoginScreen}
                            name="LoginScreen"
                        />
                        <Stack.Screen
                            component={RegisterScreen}
                            name="RegisterScreen"
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export { Navigator };
