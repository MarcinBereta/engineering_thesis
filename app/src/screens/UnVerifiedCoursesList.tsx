import {View, Text, Button, TouchableOpacity} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {useContext, useEffect, useState} from 'react';
import {getUnVerifiedCourses, verifyCourse} from '../services/courses/courses';
import {FlatList} from 'react-native-gesture-handler';

export type courseItem = {
  id: string;
  type: 'text' | 'photo';
  value: string;
};
export type course = {
  id?: string;
  name: string;
  text: courseItem[];
};
const UnVerifiedCoursesList = (props: any) => {
  const {userInfo} = useContext(AuthContext);
  const [courses, setCourses] = useState<course[]>([]);
  const getCoursesAsync = async () => {
    const {
      data,
    }: {
      data: {
        unVerifiedCourses: course[];
      };
    } = await getUnVerifiedCourses(userInfo?.token);
    setCourses(data.unVerifiedCourses);
  };

  useEffect(() => {
    getCoursesAsync();
    return () => {
      console.log('DashboardScreen unmounted');
    };
  }, []);

  const handleVerify = async (courseId: string) => {
    const {
      data,
    }: {
      data: {verifyCourse: course};
    } = await verifyCourse({courseId: courseId}, userInfo?.token);
    props.navigation.push('CoursesList');
  };

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <Text>Course list: </Text>
      <FlatList
        data={courses}
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
