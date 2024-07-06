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
    const [answer, addAnswer] = useState('' as string);
    return (
        <View style={styles.container}>
            <Text style={styles.question}>{question.question}</Text>
            <FlatList
                data={question.answers}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <Card
                        containerStyle={{
                            backgroundColor:
                                answer == item ? 'lightblue' : 'white',
                            width: width * 0.6,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                addAnswer(item);
                                setAnswer(item, index);
                            }}
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
        fontSize: fontPixel(20),
        padding: 10,
        margin: 10,
        borderRadius: 10,
        marginBottom: 30,
        width: '70%',
        textAlign: 'center',
    },
    answer: {
        fontSize: fontPixel(15),
        padding: 10,
        margin: 10,
        borderRadius: 10,
        textAlign: 'center',
    },
});
