import {useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {AuthContext} from '../contexts/AuthContext';
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';
import {fontPixel} from '../utils/Normalize';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {LoginSchema} from '../schemas/loginSchema';
import {useForm} from 'react-hook-form';
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

const LoginScreen = (props: any) => {
  const authContext = useContext(AuthContext);

  const {control, handleSubmit} = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    authContext.login('credentials', data.username, data.password);
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
          Welcome back!
        </Text>
        <FormTextInput
          control={control}
          name="username"
          placeholder="Username"
          style={styles.textInput}
        />
        <FormTextInput
          control={control}
          name="password"
          placeholder="Password"
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
