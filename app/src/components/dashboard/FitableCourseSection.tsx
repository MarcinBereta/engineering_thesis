import { dashboardDataGQL } from '@/services/quiz/quiz';
import { normalizeText } from '@rneui/base';
import { Card, Icon } from '@rneui/themed';
import { ResultOf } from 'gql.tada';
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationType } from '../Navbar';
import { useTranslation } from 'react-i18next';

export const DashboardFitableCourseSection = ({
    navigation,
    course,
}: {
    navigation: NavigationType;
    course: ResultOf<typeof dashboardDataGQL>['getMostFitCourse'];
}) => {
    const { t } = useTranslation();
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {course.map((c: any) => (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.push('course', { course: c });
                        }}
                    >
                        <Card>
                            <Card.Title>{c.name}</Card.Title>
                            <Card.Divider />
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
