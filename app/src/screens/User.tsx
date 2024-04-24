import {View, Text, Button} from 'react-native';
import {AuthContext, UserInfo} from '../contexts/AuthContext';
import {useContext, useState} from 'react';
import {fontPixel} from '../utils/Normalize';
import {updateUserData} from '../services/admin/admin';
import RNPickerSelect from 'react-native-picker-select';

const User = ({route, navigation}: any) => {
  const {userInfo} = useContext(AuthContext);
  const {user} = route.params;

  const [userData, setUserData] = useState<UserInfo>(user);

  const handleSave = async () => {
    const res: any = await updateUserData(
      {
        id: userData.id,
        role: userData.role,
        verified: userData.verified,
      },
      userInfo?.token,
    );

    setUserData(res.data.updateUser);
  };

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <Text
        style={{
          fontSize: fontPixel(20),
          padding: 10,
          color: 'black',
        }}>
        User
      </Text>
      <Text>Username:{userData.username}</Text>
      <Text>Email: {userData.email}</Text>
      <RNPickerSelect
        onValueChange={value => {
          setUserData(dt => {
            return {
              ...dt,
              role: value,
            };
          });
        }}
        items={[
          {label: 'ADMIN', value: 'ADMIN'},
          {label: 'MODERATOR', value: 'MODERATOR'},

          {label: 'USER', value: 'USER'},
        ]}
        value={userData.role}
      />
      <RNPickerSelect
        onValueChange={value => {
          setUserData(dt => {
            return {
              ...dt,
              verified: value === 'VERIFIED' ? true : false,
            };
          });
        }}
        items={[
          {label: 'VERIFIED', value: 'VERIFIED'},
          {label: 'NOT VERIFIED', value: 'NOT_VERIFIED'},
        ]}
        value={userData.verified ? 'VERIFIED' : 'NOT_VERIFIED'}
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

export {User};
