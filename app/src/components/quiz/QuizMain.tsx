import {View, Text, Button, TouchableOpacity} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {fontPixel} from '../../utils/Normalize';
import {useContext, useState} from 'react';
import {QuizQuestion} from './QuizQuestion';
import {AuthContext} from '../../contexts/AuthContext';
import {graphqlURL} from '@/services/settings';
import {useMutation, useQuery} from '@tanstack/react-query';
import request from 'graphql-request';
import {addQUizResultGQL, quizQuestionFragment} from '@/services/quiz/quiz';
import {ResultOf, VariablesOf, readFragment} from '@/graphql';
import {FriendUserFragmentGQL, getFriendsGQL} from '@/services/friends/friends';

const shuffleArray = (array: string[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export type extendedQuestion = ResultOf<typeof quizQuestionFragment> & {
  userAnswer: string;
};

export type addQuizResultDto = VariablesOf<typeof addQUizResultGQL>;
const QuizMain = ({route, navigation}: any) => {
  const {userInfo, socket} = useContext(AuthContext);
  const [friendSelect, setFriendSelect] = useState(false);

  const {data, isLoading, refetch, error} = useQuery({
    queryKey: ['friendsList'],
    queryFn: async () =>
      request(
        graphqlURL,
        getFriendsGQL,
        {},
        {
          Authorization: 'Bearer ' + userInfo?.token,
        },
      ),
  });

  const addQuizResultMutation = useMutation({
    mutationFn: async (data: addQuizResultDto) =>
      request(graphqlURL, addQUizResultGQL, data, {
        Authorization: 'Bearer ' + userInfo?.token,
      }),
    // onSuccess: (data, variables, context) => {
    //   navigation.push('QuizResult', data);
    // },
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
    let correct = correctAnswers.length;
    let all = questions.length;
    setStart(false);
    console.log(
      `You answered ${correctAnswers.length} out of ${questions.length} questions correctly`,
    );
    // create screen to show result
    addQuizResultMutation.mutate({
      addScore: {
        quizId: quiz.id,
        userId: userInfo?.id,
        score: correctAnswers.length,
      },
    });
    navigation.navigate('QuizResult', {score: correct, total: all});
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
            if (currentQuestion + 1 == questions.length) {
              handleEndQuiz();
            } else setCurrentQuestion(currentQuestion + 1);
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

  if (friendSelect && data != undefined) {
    const friends = readFragment(FriendUserFragmentGQL, data.getUserFriends);
    return (
      <View>
        <Text>Friends list</Text>
        <FlatList
          data={friends}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{
                padding: 15,
                backgroundColor: 'lightgray',
                width: '90%',
                marginLeft: '5%',
                borderRadius: 20,
                marginTop: 10,
              }}
              onPress={() => {
                navigation.navigate('QuizWithFriends', {
                  quiz,
                  friendId: item.id,
                  invite: false,
                });
              }}>
              <Text>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
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
      <Button
        onPress={() => {
          setFriendSelect(true);
        }}
        title="Fight with friend"
      />
    </View>
  );
};

export default QuizMain;
