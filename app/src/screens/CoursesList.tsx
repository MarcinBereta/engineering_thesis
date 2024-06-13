import { View, Text, Button, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import { getCoursesGQL } from '../services/courses/courses';
import { FlatList } from 'react-native-gesture-handler';
import request from 'graphql-request';
import constants from 'constants';
import { useQuery } from '@tanstack/react-query';
import { graphqlURL } from '@/services/settings';

const CoursesList = (props: any) => {
  const { userInfo } = useContext(AuthContext);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userId'],
    queryFn: async () =>
      request(
        graphqlURL,
        getCoursesGQL,
        {},
        {
          Authorization: 'Bearer ' + userInfo?.token,
        },
      ),
  });

  if (isLoading || data == undefined) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{ flexDirection: 'column', flex: 1 }}>
      <Text>Course list: </Text>
      <FlatList
        data={data.course}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              backgroundColor: 'lightgray',
              width: '90%',
              marginLeft: '5%',
              borderRadius: 20,
              marginTop: 10,
            }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.push('course', { course: item });
              }}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button
        title="Go to Main Page"
        onPress={() => {
          props.navigation.push('DashboardScreen');
        }}
      />

      {userInfo?.verified ? (
        <Button
          title="Create course"
          onPress={() => {
            props.navigation.push('createCourse');
          }}
        />
      ) : null}
    </View>
  );
};

export { CoursesList };
