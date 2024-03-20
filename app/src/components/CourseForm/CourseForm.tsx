import {useState} from 'react';
import {Button, FlatList, View} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {DragItem} from './CourseDragItem';
export type CourseItem = {
  type: 'text' | 'photo';
  value: string;
  id: string;
};

const generateRandomId = () => {
  return Math.random().toString(36).substring(7);
};

export const CourseForm = () => {
  const [dragData, setData] = useState<CourseItem[]>([]);
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
  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      <DraggableFlatList
        data={dragData}
        keyExtractor={(item, index) => `item-${item.type} - ${index}`}
        onDragEnd={({data}) => setData(data)}
        renderItem={(params: {
          item: any;
          getIndex: () => number | undefined;
          drag: () => void;
          isActive: boolean;
        }) => {
          return <DragItem {...params} handleChange={updateItemValue} />;
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
          setData([
            ...dragData,
            {
              id: generateRandomId(),
              type: 'photo',
              value: 'New Photo',
            },
          ])
        }
        title="Add new photo"
      />
    </View>
  );
};
