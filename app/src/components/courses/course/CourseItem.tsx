import { View, Text } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { CourseListItem } from './CourseListItem';
import { fontPixel } from '../../../utils/Normalize';
import { Layout } from '@/components/Layout';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '@/components/CustomButton';
import { useTranslation } from 'react-i18next';

type course = NativeStackScreenProps<AuthenticatedRootStackParamList, 'course'>;

const Course = ({ route, navigation }: course) => {
    const { course } = route.params;
    const { t } = useTranslation();
    console.log(course);
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
            <View
                style={{
                    width: '80%',
                    margin: 20,
                    left: '10%',
                }}
            >
                <CustomButton
                    title={t('course_quizzes_list')}
                    onPress={() => {
                        navigation.navigate('CourseQuizzesList', {
                            courseId: course.id,
                        });
                    }}
                />
            </View>
        </Layout>
    );
};

export default Course;
