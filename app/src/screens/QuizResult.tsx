import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';

interface QuizResultProps {
    route: any;
    navigation: NavigationProp<any>;
}

type QuizResult = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'QuizResult'
>;

const QuizResult = ({ route, navigation }: QuizResult) => {
    const { t } = useTranslation();

    const { score, total } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.resultText}>
                {t('you_answered')} {score} {t('out_of').toLowerCase()} {total}{' '}
                {t('questions_correctly').toLowerCase()}
            </Text>
            <Button
                title="Go back to courses"
                onPress={() => navigation.navigate('CoursesList')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    resultText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default QuizResult;
