import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { quizQuestionFragment } from '../../services/quiz/quiz';
import { fontPixel } from '../../utils/Normalize';
import { useState } from 'react';
import { ResultOf } from '@/graphql';
import { Card } from '@rneui/themed';
const { width, height } = Dimensions.get('window');

export const QuizQuestion = ({
    question,
    index,
    setAnswer,
}: {
    question: ResultOf<typeof quizQuestionFragment>;
    index: number;
    setAnswer: (answer: string, index: number) => void;
}) => {
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string[] }>({});

    const handleAnswerPress = (answer: string) => {
        const currentAnswers = selectedAnswers[index] || [];
        if (question.type === 'MULTIPLE_ANSWER') {
            // console.log(currentAnswers)
            if (currentAnswers.includes(answer)) {
                const newAnswers = currentAnswers.filter((ans) => ans !== answer);
                setSelectedAnswers({ ...selectedAnswers, [index]: newAnswers });
                setAnswer(newAnswers.join(','), index);
            } else {
                const newAnswers = [...currentAnswers, answer];
                setSelectedAnswers({ ...selectedAnswers, [index]: newAnswers });
                setAnswer(newAnswers.join(','), index);
            }
        } else {
            setSelectedAnswers({ ...selectedAnswers, [index]: [answer] });
            setAnswer(answer, index);
        }
    };

    const currentAnswers = selectedAnswers[index] || [];

    return (
        <View style={[styles.container, {width:'100%', height:700}]}>
            <Text style={styles.question}>{question.question}</Text>
            <FlatList
                data={question.answers}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <Card
                        containerStyle={{
                            backgroundColor:
                                currentAnswers.includes(item) ? 'lightblue' : 'white',
                            width: width * 0.6,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => handleAnswerPress(item)}
                        >
                            <Text style={[styles.answer]}>{item}</Text>
                        </TouchableOpacity>
                    </Card>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    question: {
        fontSize: fontPixel(19),
        padding: 10,
        borderRadius: 10,
        width: '75%',
        textAlign: 'center',
    },
    answer: {
        fontSize: fontPixel(15),
        padding: 10,
        margin: 5,
        borderRadius: 10,
        textAlign: 'center',
    },
});