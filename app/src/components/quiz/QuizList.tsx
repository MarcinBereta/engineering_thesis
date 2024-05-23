import {useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import {FlatList} from 'react-native-gesture-handler';
import {AuthContext} from '../../contexts/AuthContext';
import {graphqlURL} from '@/services/settings';
import {useQuery} from '@tanstack/react-query';
import request from 'graphql-request';
import {getQuizzesGQL} from '@/services/quiz/quiz';

const QuizesList = (props: any) => {
  const {userInfo} = useContext(AuthContext);

  const {data, isLoading, refetch} = useQuery({
    queryKey: ['userId'],
    queryFn: async () =>
      request(
        graphqlURL,
        getQuizzesGQL,
        {},
        {
          Authorization: 'Bearer ' + userInfo?.token,
        },
      ),
  });
  if (data == undefined || isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <Text>Quizes list: </Text>
      <FlatList
        data={data.getAllQuizzes}
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
