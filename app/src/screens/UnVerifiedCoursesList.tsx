import {View, Text, Button, TouchableOpacity} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {useContext, useEffect, useState} from 'react';
import {FlatList} from 'react-native-gesture-handler';
import request from 'graphql-request';
import {graphqlURL} from '@/services/settings';
import {
  getUnverifiedCoursesGQL,
  verifyCourseGQL,
} from '@/services/courses/courses';
import {useMutation, useQuery} from '@tanstack/react-query';
import {VariablesOf} from '@/graphql';

export type verifyCourseDto = VariablesOf<typeof verifyCourseGQL>;
const UnVerifiedCoursesList = (props: any) => {
  const {userInfo} = useContext(AuthContext);

  const {data, isLoading, refetch} = useQuery({
    queryKey: ['userId'],
    queryFn: async () =>
      request(
        graphqlURL,
        getUnverifiedCoursesGQL,
        {},
        {
          Authorization: 'Bearer ' + userInfo?.token,
        },
      ),
  });

  const verifyCourseMutation = useMutation({
    mutationFn: async (data: verifyCourseDto) =>
      request(graphqlURL, verifyCourseGQL, data, {
        Authorization: 'Bearer ' + userInfo?.token,
      }),
    onSuccess: (data, variables, context) => {
      props.navigation.push('CoursesList');
    },
  });

  if (isLoading || data == undefined) {
    return <Text>Loading...</Text>;
  }

  const handleVerify = async (courseId: string) => {
    verifyCourseMutation.mutate({
      verifyCourse: {
        courseId,
      },
    });
  };

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <Text>Course list: </Text>
      <FlatList
        data={data.unVerifiedCourses}
        renderItem={({item}) => (
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
                props.navigation.push('course', {course: item});
              }}>
              <Text>{item.name}</Text>
              <Button
                onPress={() => {
                  console.log(item);
                  handleVerify(item?.id || '');
                }}
                title="Verify"
              />
            </TouchableOpacity>
          </View>
        )}
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

export {UnVerifiedCoursesList};
