import {View, Button, TextInput} from 'react-native';
import {useContext, useState} from 'react';
import {AuthContext, UserInfo} from '../../contexts/AuthContext';
import {addVerificationRequest} from '../../services/admin/admin';

const VerifyAccount = ({route, navigation}: any) => {
  const {userInfo} = useContext(AuthContext);

  const [text, setText] = useState('');
  const handleSave = async () => {
    const res: any = await addVerificationRequest(
      {
        text: text,
      },
      userInfo?.token,
    );

    console.log(res);
  };

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <TextInput
        style={{
          width: '80%',
          backgroundColor: 'gray',
          color: 'white',
          margin: 5,
          padding: 5,
        }}
        multiline={true}
        value={text}
        placeholder="Enter why you should be verified"
        onChange={e => setText(e.nativeEvent.text)}
      />
      <Button title="Submit" onPress={handleSave} />
    </View>
  );
};

export {VerifyAccount};
