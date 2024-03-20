import {View, Text, Button} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {useContext, useState} from 'react';
import {fontPixel} from '../utils/Normalize';
import {CourseForm, CourseItem} from '../components/CourseForm/CourseForm';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {renderItem} from '../components/CourseForm/CourseDragItem';
import Animated, {useSharedValue, withSpring} from 'react-native-reanimated';

const DashboardScreen = (props: any) => {
  const {logout, userInfo} = useContext(AuthContext);
  const [dragData, setData] = useState<CourseItem[]>([]);
  const width = useSharedValue(100);
  const handlePress = () => {
    width.value = withSpring(width.value + 50);
  };

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <Text
        style={{
          fontSize: fontPixel(20),
          padding: 10,
          color: 'black',
        }}>
        Hellosad {userInfo?.username}!
      </Text>
      <CourseForm />
      {/* <DraggableFlatList
        data={[]}
        keyExtractor={(item, index) => `draggable-item-${index}`}
        onDragEnd={({data}) => setData(data)}
        renderItem={renderItem}
      /> */}
      <Animated.View style={{width}} />
      <Button
        title="Logout"
        onPress={() => {
          logout();
        }}
      />
    </View>
  );
};

export {DashboardScreen};
