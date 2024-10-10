import {
    dashboardDataGQL,
    getUserScoreGQL,
    mostFitableCourseGQL,
} from '@/services/quiz/quiz';
import { normalizeText } from '@rneui/base';
import { Card, Icon } from '@rneui/themed';
import { ResultOf } from 'gql.tada';
import { Dimensions, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationType } from '../Navbar';
import { useTranslation } from 'react-i18next';
const { width } = Dimensions.get('window');
export const DashboardFitableCourseSection = ({
    navigation,
    course,
    userScore,
}: {
    navigation: NavigationType;
    course: ResultOf<typeof mostFitableCourseGQL>['getMostFitCourse'];
    userScore: ResultOf<typeof getUserScoreGQL>['getUserScore'];
}) => {
    const { t } = useTranslation();
    const hasCompletedQuiz = (courseName: string) => {
        if (userScore === undefined) {
            return false;
        }
        return (
            userScore.some((score) => score.quizName === courseName) || false
        );
    };
    return (
        <View style={{ display: 'flex', flexDirection: 'column' }}>
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: 'black',
                }}
            >
                <Text style={{ fontSize: normalizeText(20), paddingRight: 20 }}>
                    {t('fitable_course')}
                </Text>
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {course.map((c: any) => (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.push('course', { course: c });
                        }}
                    >
                        <Card
                            containerStyle={{
                                width: width * 0.8,
                            }}
                        >
                            <Card.Title>
                                {c.name}
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
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
