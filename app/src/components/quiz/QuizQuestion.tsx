import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { quizQuestionFragment } from '../../services/quiz/quiz';
import { fontPixel } from '../../utils/Normalize';
import { useState } from 'react';
import { ResultOf } from '@/graphql';

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
                    <TouchableOpacity
                        onPress={() => {
                            addAnswer(item);
                            setAnswer(item, index);
                        }}
                    >
                        <Text
                            style={[
                                styles.answer,
                                {
                                    backgroundColor:
                                        answer === item
                                            ? 'lightblue'
                                            : 'lightgray',
                                },
                            ]}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
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
        backgroundColor: 'lightgray',
        width: '60%',
    },
    answer: {
        fontSize: fontPixel(15),
        padding: 10,
        margin: 10,
        borderRadius: 10,

        backgroundColor: 'lightgray',
    },
});
