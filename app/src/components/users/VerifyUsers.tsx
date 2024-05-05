import {useContext, useState, useEffect} from 'react';
import {View, Text, Button, TouchableOpacity, FlatList} from 'react-native';
import {AuthContext, UserInfo} from '../../contexts/AuthContext';
import {
  getUsers,
  getVerifyRequests,
  verifyUserData,
} from '../../services/admin/admin';
import {fontPixel} from '../../utils/Normalize';

const VerifyUsers = (props: any) => {
  const {userInfo} = useContext(AuthContext);
  const [users, setUsers] = useState<
    {
      id: string;
      userId: string;
      text: string;
      createdAt: string;
      updatedAt: string;
      User: UserInfo;
    }[]
  >([]);

  useEffect(() => {
    const getUsersList = async () => {
      const res: any = await getVerifyRequests(userInfo?.token);
      setUsers(res.data.getVerifyRequests);
    };
    getUsersList();
  }, []);

  const handleClick = async (requestId: string) => {
    const res: any = await verifyUserData(
      {
        requestId: requestId,
      },
      userInfo?.token,
    );
    console.log(res);
  };

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <Text
        style={{
          fontSize: fontPixel(20),
          padding: 10,
          color: 'black',
        }}>
        Verify request!
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
            <View style={{flex: 6, display: 'flex', flexDirection: 'column'}}>
              <Text style={{flex: 6}}>{item.User.username}</Text>
              <Text style={{flex: 6}}>{item.text}</Text>
            </View>

            <View
              style={{
                flex: 6,
                justifyContent: 'space-around',
                flexDirection: 'row',
              }}>
              <Button
                onPress={() => {
                  handleClick(item.id);
                }}
                title="Verify"
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export {VerifyUsers};
