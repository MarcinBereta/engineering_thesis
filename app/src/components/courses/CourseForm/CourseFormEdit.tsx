import {useContext, useEffect, useState} from 'react';
import {Button, FlatList, Text, View} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {DragItem} from './CourseDragItem';
import {launchImageLibrary} from 'react-native-image-picker';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {
  addCourseGQL,
  addPhotos,
  courseFragment,
  editCourseGQL,
} from '../../../services/courses/courses';
import {AuthContext} from '../../../contexts/AuthContext';
import DocumentPicker from 'react-native-document-picker';
import {fontPixel} from '../../../utils/Normalize';
import RNPickerSelect from 'react-native-picker-select';
import {graphqlURL} from '@/services/settings';
import {useMutation} from '@tanstack/react-query';
import {ResultOf, VariablesOf, readFragment} from '@/graphql';
import request from 'graphql-request';
import {addCourseDto} from './CourseForm';

export type CourseItem = {
  type: 'text' | 'photo';
  value: string;
  id: string;
  imageType?: string;
};

const generateRandomId = () => {
  return Math.random().toString(36).substring(7);
};
export type editCourseDto = VariablesOf<typeof editCourseGQL>;

export const CourseEditForm = ({route, navigation}: any) => {
  const {course} = route.params;

  const {userInfo} = useContext(AuthContext);
  const [dragData, setData] = useState<CourseItem[]>(course.text);
  const [courseName, setCourseName] = useState<string>(course.name);
  const [category, setCategory] = useState(course.category);

  const [items, setItems] = useState<File[]>([]);

  const editCourseMutation = useMutation({
    mutationFn: async (data: editCourseDto) =>
      request(graphqlURL, editCourseGQL, data, {
        Authorization: 'Bearer ' + userInfo?.token,
      }),
    onSuccess: (data, variables, context) => {
      const course = readFragment(courseFragment, data.editCourse);
      uploadPhotos(course);
    },
  });

  const updateItemValue = (index: string, value: string) => {
    const newData = dragData.map(item => {
      if (item.id === index) {
        return {
          ...item,
          value: value,
        };
      }
      return item;
    });
    setData(newData);
  };

  const deleteItem = (index: string) => {
    const item = dragData.find(item => item.id === index);
    if (item?.type === 'photo') {
      //@ts-ignore
      const newItems = items.filter(itemik => itemik.uri !== item.value);
      setItems(newItems);
    }
    const newData = dragData.filter(item => item.id !== index);
    setData(newData);
  };

  const uploadFile = async () => {
    const res: any = await DocumentPicker.pick({
      type: [DocumentPicker.types.images],
    });
    const id = generateRandomId();
    setData([
      ...dragData,
      {
        id: id,
        type: 'photo',
        value: res[0].uri as string,
        imageType: res[0].name.split('.')[1],
      },
    ]);
    setItems([...items, res[0]]);
  };

  const parseData = () => {
    const data = dragData.map(item => {
      if (item.type === 'text') {
        return {
          id: item.id,
          type: item.type,
          value: item.value,
        };
      } else {
        return {
          id: item.id,
          type: item.type,
          value: (item.value as string).includes('files/courses/')
            ? item.value
            : item.imageType || '',
        };
      }
    });
    return {
      name: courseName,
      text: data,
      id: course.id,
      category: category,
    };
  };

  const uploadPhotos = async (course: ResultOf<typeof courseFragment>) => {
    const photosToUpload: File[] = [];
    for (let item of dragData) {
      if (item.type === 'photo') {
        //@ts-ignore
        const photo: File = items.filter(itemik => itemik.uri == item.value);
        photosToUpload.push(photo);
      }
    }
    let index = 0;
    const newPhotos = [];
    for (let i in dragData) {
      const photo = dragData[i];
      for (let it of items) {
        //@ts-ignore
        if (photo.value == it.uri) {
          //@ts-ignore
          const ending = it.type.split('/')[1];
          it.name = `${course.text[i].id}.${ending}`;
          newPhotos.push(it);
        }
      }
    }
    const res: any = await addPhotos(newPhotos, course.id);
    if (res.status == 201) {
      navigation.push('CoursesList');
    }
  };

  const uploadCourse = async () => {
    editCourseMutation.mutate({
      EditCourseInput: parseData(),
    });
  };

  return (
    <ScrollView style={{flex: 1, flexDirection: 'column'}}>
      <Text
        style={{
          fontSize: fontPixel(30),
          textAlign: 'center',
        }}>
        Edit a Course
      </Text>
      <Text style={{textAlign: 'center', color: 'gray'}}>
        All the texts will be full size once created, you can drag and drop all
        inputs and images to correct their position (in order to drag close your
        keyboard)
      </Text>
      <TextInput
        style={{fontSize: fontPixel(30), textAlign: 'center'}}
        placeholder="Course Name"
        value={courseName}
        onChangeText={text => setCourseName(text)}
      />
      <RNPickerSelect
        onValueChange={value => {
          setCategory(value);
        }}
        items={[
          {label: 'MATH', value: 'MATH'},
          {label: 'SCIENCE', value: 'SCIENCE'},
          {label: 'HISTORY', value: 'HISTORY'},
          {label: 'GEOGRAPHY', value: 'GEOGRAPHY'},
          {label: 'ENGLISH', value: 'ENGLISH'},
          {label: 'ART', value: 'ART'},
          {label: 'MUSIC', value: 'MUSIC'},
          {label: 'SPORTS', value: 'SPORTS'},
          {label: 'OTHER', value: ''},
        ]}
        value={category}
      />
      <DraggableFlatList
        data={dragData}
        keyExtractor={(item, index) => `item-${item.type} - ${index}`}
        onDragEnd={({data}) => setData(data)}
        scrollEnabled={true}
        style={{flex: 1, flexDirection: 'column'}}
        renderItem={(params: {
          item: any;
          getIndex: () => number | undefined;
          drag: () => void;
          isActive: boolean;
        }) => {
          return (
            <DragItem
              {...params}
              handleChange={updateItemValue}
              handleDelete={deleteItem}
            />
          );
        }}
      />
      <Button
        onPress={() =>
          setData([
            ...dragData,
            {
              id: generateRandomId(),
              type: 'text',
              value: 'New Item',
            },
          ])
        }
        title="Add new text field"
      />
      <Button
        onPress={() =>
          // setData([
          //   ...dragData,
          //   {
          //     id: generateRandomId(),
          //     type: 'photo',
          //     value: 'New Photo',
          //   },
          // ])
          uploadFile()
        }
        title="Add new photo"
      />
      <Button
        onPress={() => {
          uploadCourse();
        }}
        title="Edit Course"
      />
    </ScrollView>
  );
};
