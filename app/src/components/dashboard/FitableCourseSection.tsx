import {
    dashboardDataGQL,
    getUserScoreGQL,
    mostFitableCourseGQL,
} from '@/services/quiz/quiz';
import { normalizeText } from '@rneui/base';
import { Card, Icon } from '@rneui/themed';
import { ResultOf } from 'gql.tada';
import { Dimensions, Text, View, StyleSheet } from 'react-native';
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
    // const hasCompletedQuiz = (courseName: string) => {
    //     if (userScore === undefined) {
    //         return false;
    //     }
    //     const uniqueQuizzes = new Set(
    //         userScore.map((score) => score.quizName).filter((quizName) => quizName.includes(courseName))
    //     );
    //     const completedQuizzes = userScore.filter((score) => uniqueQuizzes.has(score.quizName));
    //     return (completedQuizzes.length === uniqueQuizzes.size && uniqueQuizzes.size !== 0);
    // };
    function shortenName(courseName: string, length: number) {
        if (courseName.length > length) {
            return courseName.substring(0, length) + '...';
        }
        return courseName;
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>{t('fitable_course')}</Text>
            </View>
            <View style={styles.courseContainer}>
                {course.map((c: any, index: number) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {
                            navigation.push('course', { course: c });
                        }}
                    >
                        <Card
                            containerStyle={[
                                styles.card,
                                index === 0 && styles.highlightedCard,
                            ]}
                        >
                            <Card.Title
                                style={
                                    index === 0 && styles.highlightedCardTitle
                                }
                            >
                                {c.name}
                            </Card.Title>
                            <Card.Divider />
                            <Card.FeaturedSubtitle
                                style={{
                                    color: 'purple',
                                    textAlign: 'center',
                                }}
                            >
                                {t('creator')}: {shortenName(c.creator.username, 10)}
                            </Card.FeaturedSubtitle>
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
    headerText: {
        fontSize: normalizeText(20),
        paddingRight: 20,
    },
    courseContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: width * 0.8,
    },
    highlightedCard: {
        // backgroundColor: '#f0f8ff',
        borderColor: '#4A90E2',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    highlightedCardTitle: {
        color: 'black',
    },
});
