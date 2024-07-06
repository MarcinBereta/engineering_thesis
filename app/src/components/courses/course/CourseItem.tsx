import { View, Text } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { CourseListItem } from './CourseListItem';
import { fontPixel } from '../../../utils/Normalize';
import { Layout } from '@/components/Layout';

const Course = ({ route, navigation }: any) => {
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
