import { useContext, useState, useEffect } from 'react';
import {View, Text, Button, TouchableOpacity} from 'react-native';

import {FlatList} from 'react-native-gesture-handler';
import { AuthContext } from '../../contexts/AuthContext';
import { course } from '../../screens/CoursesList';
import { getCourses } from '../../services/courses/courses';
import { Quiz, getQuizes } from '../../services/quiz/quiz';



const QuizesList = (props: any) => {
  const {userInfo} = useContext(AuthContext);
  const [quizes, setQuizes] = useState<Quiz[]>([]);
  const getQuizesAsync = async () => {
    const {
      data,
    }: {
      data: {
        getAllQuizzes: Quiz[];
      };
    } = await getQuizes(userInfo?.token);
    console.log(data)
    setQuizes(data.getAllQuizzes);
  };

  useEffect(() => {
    getQuizesAsync();
    return () => {
      console.log('DashboardScreen unmounted');
    };
  }, []);

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <Text>Quizes list: </Text>
      <FlatList
        data={quizes}
        renderItem={({item}) => (
          <View
            style={{
              padding: 15,
              backgroundColor: 'lightgray',
              width: '90%',
              marginLeft: '5%',
              borderRadius: 20,
            }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.push('quiz', {quiz: item});
              }}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      
    </View>
  );
};

export {QuizesList};
