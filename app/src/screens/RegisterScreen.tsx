import {useContext, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';
import {fontPixel} from '../utils/Normalize';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {RegisterSchema} from '../schemas/registerSchema';
import {FormTextInput} from '../components/inputs/FormTextInput';

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

  const {control, handleSubmit} = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = (data: z.infer<typeof RegisterSchema>) => {
    authContext.register(
      'credentials',
      data.username,
      data.email,
      data.password,
    );
  };

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
        <FormTextInput
          control={control}
          name="username"
          placeholder="username"
          style={styles.textInput}
        />
        <FormTextInput
          control={control}
          name="email"
          placeholder="email"
          style={styles.textInput}
        />
        <FormTextInput
          control={control}
          name="password"
          placeholder="Password"
          secureTextEntry={true}
          style={styles.textInput}
        />

        <GoogleSigninButton
          style={{width: 192, height: 48}}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={() => authContext.login('google', '', '')}
        />
        <TouchableOpacity
          style={styles.buttonProps}
          onPress={handleSubmit(onSubmit)}>
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
