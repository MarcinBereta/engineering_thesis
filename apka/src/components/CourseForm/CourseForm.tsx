import {useState} from 'react';
import {Button, View} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {renderItem} from './CourseDragItem';
export type CourseItem = {
  type: 'text' | 'photo';
  value: string;
};

export const CourseForm = () => {
  const [dragData, setData] = useState<CourseItem[]>([]);
  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      <Button
        onPress={() =>
          setData([
            ...dragData,
            {
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
