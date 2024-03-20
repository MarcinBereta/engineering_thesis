import {Text, TouchableOpacity} from 'react-native';
import {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {CourseItem} from './CourseForm';
type Item = {
  key: string;
  label: string;
  height: number;
  width: number;
  backgroundColor: string;
};

export const renderItem = ({
  item,
  drag,
  isActive,
}: RenderItemParams<CourseItem>) => {
  return (
    <ScaleDecorator>
      <TouchableOpacity onLongPress={drag} disabled={isActive}>
        <Text>{item.value}</Text>
      </TouchableOpacity>
    </ScaleDecorator>
  );
};
