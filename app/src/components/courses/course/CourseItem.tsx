import { View, Text } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { CourseListItem } from './CourseListItem';
import { fontPixel } from '../../../utils/Normalize';
import { Layout } from '@/components/Layout';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type course = NativeStackScreenProps<AuthenticatedRootStackParamList, 'course'>;

const Course = ({ route, navigation }: course) => {
    const { course } = route.params;
    return (
        <Layout navigation={navigation} icon="course">
            <Text style={{ fontSize: fontPixel(40), textAlign: 'center' }}>
                {course.name}
            </Text>
            <FlatList
                data={course.text}
                renderItem={({ item }) => <CourseListItem course={item} />}
                keyExtractor={(item) => item.id}
            />
        </Layout>
    );
};

export default Course;
