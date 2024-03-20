import {Text, TouchableOpacity} from 'react-native';
import {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {CourseItem} from './CourseForm';
import {TextInput} from 'react-native-gesture-handler';

export type RenderItemType = RenderItemParams<CourseItem> & {
  handleChange: (index: string, value: string) => void;
};

export const DragItem = ({
  item,
  drag,
  isActive,
  handleChange,
}: RenderItemType) => {
  return (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={{backgroundColor: 'red'}}>
        {item.type == 'text' ? (
          <TextInput
            style={{width: '50%', backgroundColor: 'blue', color: 'white'}}
            multiline={true}
            value={item.value}
            onChange={e => handleChange(item.id, e.nativeEvent.text)}
          />
        ) : null}
      </TouchableOpacity>
    </ScaleDecorator>
  );
};
