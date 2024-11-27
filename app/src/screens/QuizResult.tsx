import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
import { CustomButton } from '@/components/CustomButton';
import Icon from 'react-native-vector-icons/FontAwesome';

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

    const isScoreHigh = score >= total / 2;

    return (
        <View style={styles.container}>
            <Icon
                name={isScoreHigh ? "heart-o" : "warning"}
                size={100}
                color={isScoreHigh ? "green" : "orange"}
                style={styles.icon}
            />
            <Text style={styles.resultText}>
                {t('you_answered')} {score} {t('out_of').toLowerCase()} {total}{' '}
                {t('questions_correctly').toLowerCase()}
            </Text>
            <CustomButton
                title={t('go_back_to_courses')}
                onPress={() => navigation.navigate('CoursesList')}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
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
        backgroundColor: '#f8f9fa',
    },
    icon: {
        marginBottom: 20,
        alignSelf: 'center',
    },
    resultText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#4A90E2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        alignSelf: 'center',
    },
    buttonTitle: {
        fontSize: 18,
        color: '#fff',
    },
});

export default QuizResult;