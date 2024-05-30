import {View, Text, Button} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {useContext, useEffect} from 'react';
import {fontPixel} from '../utils/Normalize';
import {setNavigationRef} from '@/utils/NavigationRef';

const DashboardScreen = (props: any) => {
  const {logout, userInfo, socket} = useContext(AuthContext);

  useEffect(() => {
    setNavigationRef(props.navigation);
  }, []);

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <Text
        style={{
          fontSize: fontPixel(20),
          padding: 10,
          color: 'black',
        }}>
        Hello {userInfo?.username}!
      </Text>

      <Button
        title="View courses"
        onPress={() => {
          props.navigation.push('CoursesList');
        }}
      />
      <Button
        title="View quizes"
        onPress={() => {
          props.navigation.push('QuizesList');
        }}
      />
      <Button
        title="My courses"
        onPress={() => {
          props.navigation.push('MyCourses');
        }}
      />
      {userInfo?.verified ? (
        <Button
          title="Create course"
          onPress={() => {
            props.navigation.push('createCourse');
          }}
        />
      ) : (
        <Button
          title="Verify account"
          onPress={() => {
            props.navigation.push('VerifyAccount');
          }}
        />
      )}

      <Button
        title="Friends"
        onPress={() => {
          props.navigation.push('Friends');
        }}
      />
      {userInfo?.role == 'ADMIN' || userInfo?.role == 'MODERATOR' ? (
        <Button
          title="Verify courses"
          onPress={() => {
            props.navigation.push('UnVerifiedCourses');
          }}
        />
      ) : null}
      {userInfo?.role == 'ADMIN' || userInfo?.role == 'MODERATOR' ? (
        <Button
          title="Verify users"
          onPress={() => {
            props.navigation.push('VerifyUsers');
          }}
        />
      ) : null}
      {userInfo?.role == 'ADMIN' ? (
        <Button
          title="Go to admin"
          onPress={() => {
            props.navigation.push('AdminPanel');
          }}
        />
      ) : null}

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
