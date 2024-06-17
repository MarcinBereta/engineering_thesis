import {View, Text, Button, TouchableOpacity} from 'react-native';
import {AuthContext, UserInfo} from '../contexts/AuthContext';
import {useContext, useEffect, useState} from 'react';
import {fontPixel} from '../utils/Normalize';
import {FlatList} from 'react-native-gesture-handler';
import {graphqlURL} from '@/services/settings';
import {useQuery} from '@tanstack/react-query';
import request from 'graphql-request';
import {getUsersGQL} from '@/services/admin/admin';

const UserList = (props: any) => {
  const {userInfo} = useContext(AuthContext);
  const {data, isLoading, refetch} = useQuery({
    queryKey: ['userId'],
    queryFn: async () =>
      request(
        graphqlURL,
        getUsersGQL,
        {},
        {
          Authorization: 'Bearer ' + userInfo?.token,
        },
      ),
  });
  if (data == undefined || isLoading) {
    return <Text>Loading...</Text>;
  }

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
        data={data?.getAllUsers}
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
