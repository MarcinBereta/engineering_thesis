import {useContext, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
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

const LoginScreen = (props: any) => {
  const authContext = useContext(AuthContext);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
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
          Welcome back!
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Username"
          value={loginForm.username}
          onChange={e => {
            setLoginForm({...loginForm, username: e.nativeEvent.text});
          }}
        />
        <TextInput
          secureTextEntry={true}
          style={styles.textInput}
          placeholder="password"
          value={loginForm.password}
          onChange={e => {
            setLoginForm({...loginForm, password: e.nativeEvent.text});
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
            authContext.login(
              'credentials',
              loginForm.username,
              loginForm.password,
            );
          }}>
          <Text style={{color: 'white'}}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonProps}
          onPress={() => {
            props.navigation.navigate('RegisterScreen');
          }}>
          <Text style={{color: 'white'}}>Go to register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export {LoginScreen};
