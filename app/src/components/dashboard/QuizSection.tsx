import { ResultOf } from '@/graphql';
import { dashboardDataGQL, getUserScoreGQL } from '@/services/quiz/quiz';
import { normalizeText } from '@rneui/base';
import { Card, Icon } from '@rneui/themed';
import { Dimensions, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationType } from '../Navbar';
import { useTranslation } from 'react-i18next';
const { width } = Dimensions.get('window')
export const DashboardQuizSection = ({
    navigation,
    quizzes,
    userScore,
}: {
    navigation: NavigationType;
    quizzes: ResultOf<typeof dashboardDataGQL>['getDashboardQuizzes'];
    userScore: ResultOf<typeof getUserScoreGQL>['getUserScore'];
}) => {
    const { t } = useTranslation();
    const hasCompletedQuiz = (quizName: string) => {
        if (userScore === undefined) {
            return false;
        }
        return userScore.some((score) => score.quizName === quizName) || false;
    };
    const getResultOfQuiz = (quizName: string) => {
        if (userScore === undefined) {
            return '';
        }
        const quizResult = userScore.find(score => score.quizName === quizName);
        if (quizResult === undefined) {
            return '';
        }

        const { score, noQuest } = quizResult;
        return `${score}/${noQuest}`;

    };

    function shortenCourseName(courseName: string) {
        if (courseName.length > 13) {
            return courseName.substring(0, 13) + '...';
        }
        return courseName;
    }

    return (
        <View style={{ display: 'flex', flexDirection: 'column' }}>
            <TouchableOpacity
                onPress={() => {
                    navigation.push('QuizzesList');
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
                    {t('featured_quizzes')}
                </Text>
                <Icon type="font-awesome" name="arrow-right" size={30} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {quizzes.map((q) => (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.push('quiz', { quiz: q });
                        }}
                    >
                        <Card

                            containerStyle={{
                                width: width * 0.4,
                            }}
                        >

                            <Card.Title>{shortenCourseName(q.name)}
                                {hasCompletedQuiz(q.name) && (
                                    <Icon
                                        type="font-awesome"
                                        name="check"
                                        size={15}
                                        color="green" />
                                )}
                            </Card.Title>
                            <Card.Divider />
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    fontSize: 14,
                                    color: 'blue',
                                }}

                            >{getResultOfQuiz(q.name)}</Text>
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
