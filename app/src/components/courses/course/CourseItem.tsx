import { View, Text } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { CourseListItem } from './CourseListItem';
import { fontPixel } from '../../../utils/Normalize';

const Course = ({ route, navigation }: any) => {
    const { course } = route.params;
    return (
        <View>
            <Text style={{ fontSize: fontPixel(40) }}>{course.name}</Text>
            <FlatList
                data={course.text}
                renderItem={({ item }) => <CourseListItem course={item} />}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

export default Course;
