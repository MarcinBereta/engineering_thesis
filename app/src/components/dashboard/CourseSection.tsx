import { dashboardDataGQL, getUserScoreGQL } from '@/services/quiz/quiz';
import { normalizeText } from '@rneui/base';
import { Card, Icon } from '@rneui/themed';
import { ResultOf } from 'gql.tada';
import { Dimensions, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationType } from '../Navbar';
import { useTranslation } from 'react-i18next';
const { width } = Dimensions.get('window');

export const DashboardCourseSection = ({
    navigation,
    courses,
    userScore,
}: {
    navigation: NavigationType;
    courses: ResultOf<typeof dashboardDataGQL>['dashboardCourses'];
    userScore: ResultOf<typeof getUserScoreGQL>['getUserScore'];
}) => {
    const { t } = useTranslation();
    const hasCompletedQuiz = (courseName: string) => {
        if (userScore === undefined) {
            return false;
        }
        return userScore.some((score) => score.quizName === courseName) || false;
    };
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
                    {t('featured_courses')}
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
                        <Card
                            containerStyle={{
                                width: width * 0.45,
                            }}
                        >
                            <Card.Title>{c.name}
                                {hasCompletedQuiz(c.name) && (
                                    <Icon
                                        type="font-awesome"
                                        name="check"
                                        size={15}
                                        color="green"
                                    />
                                )}
                            </Card.Title>
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
