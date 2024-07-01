import { dashboardDataGQL } from '@/services/quiz/quiz';
import { normalizeText } from '@rneui/base';
import { Card, Icon } from '@rneui/themed';
import { ResultOf } from 'gql.tada';
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationType } from '../Navbar';

export const DashboardCourseSection = ({
    navigation,
    courses,
}: {
    navigation: NavigationType;
    courses: ResultOf<typeof dashboardDataGQL>['dashboardCourses'];
}) => {
    return (
        <View style={{ display: 'flex', flexDirection: 'column' }}>
            <TouchableOpacity
                onPress={() => {
                    navigation.push('CoursesList');
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: 'black',
                }}
            >
                <Text style={{ fontSize: normalizeText(20), paddingRight: 20 }}>
                    Featured courses
                </Text>
                <Icon type="font-awesome" name="arrow-right" size={30} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {courses.map((c) => (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.push('course', { course: c });
                        }}
                    >
                        <Card>
                            <Card.Title>{c.name}</Card.Title>
                            <Card.Divider />
                            <Card.FeaturedSubtitle>
                                {c.creator.username}
                            </Card.FeaturedSubtitle>
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
