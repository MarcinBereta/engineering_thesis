import {View, Text, Button, TouchableOpacity} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {useContext, useEffect, useState} from 'react';
import {fontPixel} from '../utils/Normalize';
import {CourseForm} from '../components/courses/CourseForm/CourseForm';
import {getCourses} from '../services/courses/courses';
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
const CoursesList = (props: any) => {
  const {userInfo} = useContext(AuthContext);
  const [courses, setCourses] = useState<course[]>([]);
  const getCoursesAsync = async () => {
    const {
      data,
    }: {
      data: {
        course: course[];
      };
    } = await getCourses(userInfo?.token);
    setCourses(data.course);
  };

  useEffect(() => {
    getCoursesAsync();
    return () => {
      console.log('DashboardScreen unmounted');
    };
  }, []);

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

export {CoursesList};
