import {useContext, useState} from 'react';
import {Button, FlatList, Text, View} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {DragItem} from './CourseDragItem';
import {launchImageLibrary} from 'react-native-image-picker';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {Course, newCourse, addPhotos} from '../../../services/courses/courses';
import {AuthContext} from '../../../contexts/AuthContext';
import DocumentPicker from 'react-native-document-picker';
import {fontPixel} from '../../../utils/Normalize';
export type CourseItem = {
  type: 'text' | 'photo';
  value: string;
  id: string;
  imageType?: string;
};

const generateRandomId = () => {
  return Math.random().toString(36).substring(7);
};

export const CourseForm = () => {
  const {userInfo} = useContext(AuthContext);
  const [dragData, setData] = useState<CourseItem[]>([]);
  const [courseName, setCourseName] = useState<string>('');
  const [items, setItems] = useState<File[]>([]);

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
    console.log(res[0]);
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
          value: item.imageType || '',
        };
      }
    });
    return {
      name: courseName,
      text: data,
    };
  };

  const uploadPhotos = async (course: Course) => {
    const photosToUpload: File[] = [];
    for (let item of dragData) {
      if (item.type === 'photo') {
        //@ts-ignore
        const photo: File = items.filter(itemik => itemik.uri == item.value);
        photosToUpload.push(photo);
      }
    }
    let index = 0;
    console.log(course);
    const newPhotos = [];
    for (let i in dragData) {
      const photo = dragData[i];
      for (let it of items) {
        //@ts-ignore
        if (photo.value == it.uri) {
          //@ts-ignore
          const ending = it.type.split('/')[1];
          // console.log(it);
          it.name = `${course.text[i].id}.${ending}`;
          console.log(it);
          console.log(course.id);
          newPhotos.push(it);
        }
      }
    }
    await addPhotos(newPhotos, course.id);
  };

  const uploadCourse = async () => {
    const {data: addCourse} = await newCourse(parseData(), userInfo?.token);
    uploadPhotos(addCourse.addCourse);
  };

  return (
    <ScrollView style={{flex: 1, flexDirection: 'column'}}>
      <Text
        style={{
          fontSize: fontPixel(30),
          textAlign: 'center',
        }}>
        Create a new Course
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
        title="Create Course"
      />
    </ScrollView>
  );
};
