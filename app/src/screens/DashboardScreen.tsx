import {View, Text, Button} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {useContext} from 'react';
import {fontPixel} from '../utils/Normalize';
import {CourseForm} from '../components/CourseForm/CourseForm';

const DashboardScreen = (props: any) => {
  const {logout, userInfo} = useContext(AuthContext);

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
