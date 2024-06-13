import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

interface QuizResultProps {
    route: any;
    navigation: NavigationProp<any>;
}

const QuizResult: React.FC<QuizResultProps> = ({ route, navigation }) => {
    const { score, total } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.resultText}>
                You answered {score} out of {total} questions correctly
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
