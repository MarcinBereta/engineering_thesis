import {Image, Text, View} from 'react-native';
import constants from '../../../../constants';
import {courseItem} from '../../../screens/CoursesList';

export const CourseListItem = ({course: item}: {course: courseItem}) => {
  if (item.type == 'photo') {
    console.log(constants.url + '/' + item.value);
  }
  return (
    <View style={{backgroundColor: 'red', flexDirection: 'row'}}>
      {item.type == 'text' ? (
        <Text>{item.value}</Text>
      ) : (
        <Image
          style={{width: '100%', height: 300}}
          resizeMethod="resize"
          source={{uri: constants.url + '/' + item.value}}
        />
      )}
    </View>
  );
};
