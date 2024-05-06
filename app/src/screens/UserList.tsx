import {View, Text, Button, TouchableOpacity} from 'react-native';
import {AuthContext, UserInfo} from '../contexts/AuthContext';
import {useContext, useEffect, useState} from 'react';
import {fontPixel} from '../utils/Normalize';
import {CourseForm} from '../components/courses/CourseForm/CourseForm';
import {getCourses} from '../services/courses/courses';
import {FlatList} from 'react-native-gesture-handler';
import {getUsers} from '../services/admin/admin';

const UserList = (props: any) => {
  const {userInfo} = useContext(AuthContext);
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    const getUsersList = async () => {
      const {data: getAllUsers}: any = await getUsers(userInfo?.token);
      // const res: any = await getUsers(userInfo?.token);

      // console.log(res);
      setUsers(getAllUsers.getAllUsers);
    };
    getUsersList();
  }, []);

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <Text
        style={{
          fontSize: fontPixel(20),
          padding: 10,
          color: 'black',
        }}>
        User list!
      </Text>

      <FlatList
        data={users}
        renderItem={({item}) => (
          <View
            style={{
              padding: 5,
              borderColor: 'black',
              borderWidth: 1,
              margin: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={{flex: 6}}>{item.username}</Text>
            <View
              style={{
                flex: 6,
                justifyContent: 'space-around',
                flexDirection: 'row',
              }}>
              <Button
                onPress={() => {
                  props.navigation.push('User', {user: item});
                }}
                title="View"
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export {UserList};
