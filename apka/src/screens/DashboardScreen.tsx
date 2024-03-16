import {View, Text, Button} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {useContext} from 'react';
import {fontPixel} from '../utils/Normalize';

const DashboardScreen = (props: any) => {
  const {logout, userInfo} = useContext(AuthContext);

  return (
    <View>
      <Text
        style={{
          fontSize: fontPixel(20),
          padding: 10,
          color: 'black',
        }}>
        Hello {userInfo?.username}!
      </Text>
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
