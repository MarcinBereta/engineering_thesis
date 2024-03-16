import {useContext, useState} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';
import {fontPixel} from '../utils/Normalize';

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: 'white',
    width: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  buttonProps: {
    margin: 5,
    width: '80%',
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#195ee6',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

const RegisterScreen = (props: any) => {
  const authContext = useContext(AuthContext);
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    email: '',
  });

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center',
          paddingTop: '20%',
        }}>
        <Text
          style={{
            padding: 10,
            fontSize: fontPixel(40),
            color: 'black',
            fontWeight: 'bold',
          }}>
          Register!
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Username"
          value={registerForm.username}
          onChange={e => {
            setRegisterForm({...registerForm, username: e.nativeEvent.text});
          }}
        />

        <TextInput
          style={styles.textInput}
          placeholder="email"
          value={registerForm.email}
          onChange={e => {
            setRegisterForm({...registerForm, email: e.nativeEvent.text});
          }}
        />
        <TextInput
          secureTextEntry={true}
          style={styles.textInput}
          placeholder="password"
          value={registerForm.password}
          onChange={e => {
            setRegisterForm({...registerForm, password: e.nativeEvent.text});
          }}
        />
        <GoogleSigninButton
          style={{width: 192, height: 48}}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={() => authContext.login('google', '', '')}
        />
        <TouchableOpacity
          style={styles.buttonProps}
          onPress={() => {
            authContext.register(
              'credentials',
              registerForm.username,
              registerForm.email,
              registerForm.password,
            );
          }}>
          <Text style={{color: 'white'}}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonProps}
          onPress={() => {
            props.navigation.navigate('LoginScreen');
          }}>
          <Text style={{color: 'white'}}>Go to login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export {RegisterScreen};
