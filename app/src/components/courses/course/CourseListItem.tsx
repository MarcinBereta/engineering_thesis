import {Image, Text, View} from 'react-native';
import {courseItem} from '../../../screens/DashboardScreen';
import constants from '../../../../constants';

export const CourseListItem = ({course: item}: {course: courseItem}) => {
  console.log('http://localhost:3000/' + item.value);

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
