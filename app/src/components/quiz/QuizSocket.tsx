import {View, Text, Button} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import { fontPixel } from '../../utils/Normalize';
import { Question, addResults } from '../../services/quiz/quiz';
import { useContext, useEffect, useState } from 'react';
import { QuizQuestion } from './QuizQuestion';
import { AuthContext } from '../../contexts/AuthContext';

type extendedQuestion = Question & {
    userAnswer: string
}
type Room = {
    id: string,
    users: {
        id:string,
        username:string,
        score:number
    }[],
    quizId: string,
    questionIndex: number,
    questions: Question[]

}

const QuizSocket = ({route, navigation}: any) => {
    const {userInfo, socket} = useContext(AuthContext);

    const {quiz} = route.params;
    const [gameStage, setGameStage]=useState<'waiting'|'lobby'|'question'|'answer'|'end'>('waiting')
    const [questionAnserwed, setQuestionAnserwed] = useState(false)
    const [question, setQuestion] = useState<null|Question>(null)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [room, setRoom] = useState<Room | null>(null)
    useEffect(()=>{
        if(socket){
            
            socket.emit('joinQueue', {quizId: quiz.id, userId: userInfo?.id})
            
            socket.on('gameStart', (room:any)=>{
                setRoom(room)
                setGameStage('lobby')
                // setQuestion(room.questions[0])
            })

            socket.on('question', (question:any)=>{
                // console.log(data)
                setCurrentQuestion(
                    (prev)=>{
                        const q = room?.questions.find((q, i)=>q.question == question.question) as Question
                        return room?.questions.indexOf(q) || 0
                    }
                )
                setGameStage('question')
                setQuestion(question)
                setQuestionAnserwed(false)
            })

            socket.on('questionEnd', (correct:string)=>{
                setGameStage('answer')
            })

            socket.on('gameEnd', (room:any)=>{
                setGameStage('end')
                setRoom(room)
            })


        }
    },[])

    if(gameStage == "answer"){
        return <View>
            <Text>Correct answer is {question?.correct}</Text>
        </View>
    }

    if(gameStage == "lobby" && room){
        return <View>
            <Text>Game starting in 5 seconds</Text>
            <Text>Players:</Text>
            <FlatList
                data={room.users}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                    <Text>{item.username}</Text>
                )}
            />
        </View>
    }

  if(gameStage == "question" && question){
    return <View >
            <QuizQuestion question={question} index={0} setAnswer={(answer:string, index:number)=>{
            if (socket && !questionAnserwed) {
                setQuestionAnserwed(true)
                socket.emit('answer', {roomId: room?.id, userId: userInfo?.id, answer})}
        }}
     />
    </View>;
  }

    if(gameStage == "end" && room){
        return <View>
            <Text>Game ended</Text>
            <Text>Players:</Text>
            <FlatList
                data={room.users}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                    <Text>{item.username} - {item.score}</Text>
                )}
            />
        </View>
    }

  return (
    <View>
      <Text style={{fontSize: fontPixel(40)}}>{quiz.name}</Text>
      <Button onPress={()=>{
        
        if(socket) socket.emit('leaveQue', {quizId: quiz.id, userId: userInfo?.id})
      }}  title="Cancel searching" />
    </View>
  );
};

export default QuizSocket;
