import { ResultOf } from '@/graphql';
import { dashboardDataGQL } from '@/services/quiz/quiz';
import { normalizeText } from '@rneui/base';
import { Card, Icon } from '@rneui/themed';
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationType } from '../Navbar';
import { useTranslation } from 'react-i18next';

export const DashboardQuizSection = ({
    navigation,
    quizzes,
}: {
    navigation: NavigationType;
    quizzes: ResultOf<typeof dashboardDataGQL>['getDashboardQuizzes'];
}) => {
    const { t } = useTranslation();
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
                        <Card>
                            <Card.Title>{q.name}</Card.Title>
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
