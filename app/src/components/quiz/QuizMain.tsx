import {View, Text, Button} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {fontPixel} from '../../utils/Normalize';
import {useContext, useState} from 'react';
import {QuizQuestion} from './QuizQuestion';
import {AuthContext} from '../../contexts/AuthContext';
import {graphqlURL} from '@/services/settings';
import {useMutation} from '@tanstack/react-query';
import request from 'graphql-request';
import {addQUizResultGQL, quizQuestionFragment} from '@/services/quiz/quiz';
import {ResultOf, VariablesOf} from '@/graphql';

const shuffleArray = (array: string[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export type extendedQuestion = ResultOf<typeof quizQuestionFragment> & {
  userAnswer: string;
};

export type addQuizResultDto = VariablesOf<typeof addQUizResultGQL>;
const QuizMain = ({route, navigation}: any) => {
  const {userInfo} = useContext(AuthContext);

  const addQuizResultMutation = useMutation({
    mutationFn: async (data: addQuizResultDto) =>
      request(graphqlURL, addQUizResultGQL, data, {
        Authorization: 'Bearer ' + userInfo?.token,
      }),
    onSuccess: (data, variables, context) => {
      navigation.push('CoursesList');
    },
  });

  const {quiz} = route.params;
  const [questions, setQuestions] = useState<extendedQuestion[]>(() => {
    const extendedQuestions = quiz.questions.map(
      (question: ResultOf<typeof quizQuestionFragment>) => {
        return {
          ...question,
          userAnswer: '',
          answers: shuffleArray(question.answers),
        };
      },
    );

    return extendedQuestions.sort(() => Math.random() - 0.5);
  });

  const [start, setStart] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const handleEndQuiz = async () => {
    const correctAnswers = questions.filter(
      question => question.userAnswer === question.correct,
    );
    setStart(false);
    console.log(
      `You answered ${correctAnswers.length} out of ${questions.length} questions correctly`,
    );
    addQuizResultMutation.mutate({
      addScore: {
        quizId: quiz.id,
        userId: userInfo?.id,
        score: correctAnswers.length,
      },
    });
  };

  if (start) {
    return (
      <View>
        <QuizQuestion
          question={questions[currentQuestion]}
          index={currentQuestion}
          setAnswer={(answer: string, index: number) => {
            const newQuestions = questions.map((question, i) => {
              if (i === index) {
                return {...question, userAnswer: answer};
              }
              return question;
            });
            setQuestions(newQuestions);
            setCurrentQuestion(currentQuestion + 1);
          }}
        />
        <View>
          <Text>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <Button
            onPress={() => {
              if (currentQuestion === questions.length - 1) {
                setStart(false);
                setCurrentQuestion(0);
                handleEndQuiz();
              } else {
                setCurrentQuestion(currentQuestion + 1);
              }
            }}
            title={`${
              currentQuestion == questions.length - 1
                ? 'End quiz'
                : 'Next question'
            }`}
          />
          {currentQuestion != 0 && (
            <Button
              onPress={() => {
                setCurrentQuestion(currentQuestion - 1);
              }}
              title="Previous question"
            />
          )}
        </View>
      </View>
    );
  }
  return (
    <View>
      <Text style={{fontSize: fontPixel(40)}}>{quiz.name}</Text>
      <Button
        onPress={() => {
          setStart(true);
        }}
        title="Start quiz"
      />
      <Button
        onPress={() => {
          navigation.navigate('QuizSearch', {quiz});
        }}
        title="Search for opoonents"
      />
    </View>
  );
};

export default QuizMain;
