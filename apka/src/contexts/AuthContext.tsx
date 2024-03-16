import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import React, {useContext, useState} from 'react';
// import { AccessToken, LoginManager } from 'react-native-fbsdk-next'
import {registerUser, loginUser, googleLogin} from '../services/auth/auth';
interface AuthContext {
  isLoading: boolean;
  userInfo: any;
  splashLoading: boolean;
  error: string;
  register: (
    provider: 'credentials' | 'google' | 'facebook',
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  login: (
    provider: 'credentials' | 'google' | 'facebook',
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContext>({} as any);

interface UserInfo {
  username: string;
  email: string;
  id: string;
  token: string;
  image: string | null;
}
export type signInResponse = {
  access_token: string;
  user: {
    username: string;
    email: string;
    id: string;
    image: string | null;
  };
};

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [splashLoading, setSplashLoading] = useState(true);
  const [error, setError] = useState('');

  const register = async (
    provider: 'credentials' | 'google' | 'facebook' | 'apple',
    username: string,
    email: string,
    password: string,
  ) => {
    switch (provider) {
      case 'credentials':
        try {
          console.log('?');
          const {
            data,
          }: {
            data: {
              signup: signInResponse;
            };
          } = await registerUser({
            username: username,
            email: email,
            password: password,
          });
          console.log(data);
          if (data != null) {
            const userInfo = {
              username: data.signup.user.username,
              email: data.signup.user.email,
              id: data.signup.user.id,
              token: data.signup.access_token,
              image: data.signup.user.image,
            };
            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            setUserInfo(userInfo);
          }
        } catch (err) {
          console.error(err);
        }
        break;
      case 'google':
        break;
      case 'facebook':
        break;
      case 'apple':
        break;
    }
  };

  const login = async (
    provider: 'credentials' | 'google' | 'facebook' | 'apple',
    email: string,
    password: string,
  ) => {
    switch (provider) {
      case 'credentials':
        try {
          const {
            data,
          }: {
            data: {
              signin: signInResponse;
            };
          } = await loginUser({
            username: email,
            password: password,
          });

          if (data != null) {
            const userInfo = {
              username: data.signin.user.username,
              email: data.signin.user.email,
              id: data.signin.user.id,
              token: data.signin.access_token,
              image: data.signin.user.image,
            };
            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            setUserInfo(userInfo);
          }
        } catch (err) {
          console.error(err);
        }
        break;
      case 'google':
        try {
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          });

          const userInfo = await GoogleSignin.signIn();
          const {
            data,
          }: {
            data: {
              providerLogin: signInResponse;
            };
          } = await googleLogin({
            email: userInfo.user.email,
            username:
              userInfo.user.name ||
              userInfo.user.familyName + ' ' + userInfo.user.givenName ||
              '',
            image: userInfo.user.photo,
          });
          if (data != null) {
            const userInfo = {
              username: data.providerLogin.user.username,
              email: data.providerLogin.user.email,
              id: data.providerLogin.user.id,
              token: data.providerLogin.access_token,
              image: data.providerLogin.user.image,
            };
            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            setUserInfo(userInfo);
          }
        } catch (err) {
          console.log('1');
          console.error(err);
        }
        break;
      // case 'facebook':
      //     try {
      //         LoginManager.logInWithPermissions(['email']).then(
      //             (result: any) => {
      //                 if (!result.isCancelled) {
      //                     AccessToken.getCurrentAccessToken().then(
      //                         (data: any) => {
      //                             const { accessToken } = data
      //                             fetch(
      //                                 'https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' +
      //                                     accessToken
      //                             )
      //                                 .then((response) => response.json())
      //                                 .then(async (json) => {
      //                                     let result2: any =
      //                                         await facebookLogin({
      //                                             email: json.email,
      //                                         })
      //                                     if (result2.status == 'OK') {
      //                                         await AsyncStorage.setItem(
      //                                             '@facebookToken',
      //                                             accessToken
      //                                         )
      //                                         await AsyncStorage.setItem(
      //                                             '@token',
      //                                             result2.data.token
      //                                         )
      //                                         setUserInfo(result2.data)
      //                                     } else {
      //                                         if (
      //                                             result2.err ==
      //                                             'NOT_FOUND'
      //                                         ) {
      //                                             setError(
      //                                                 t('not_found_lg')
      //                                             )
      //                                         } else if (
      //                                             result2.err ==
      //                                             'INVALID_INPUT_TOO_LONG'
      //                                         ) {
      //                                             setError(
      //                                                 t('too_long_mail')
      //                                             )
      //                                         } else if (
      //                                             result2.err ==
      //                                             'MAIL_INVALID'
      //                                         ) {
      //                                             setError(
      //                                                 t('mail_invalid')
      //                                             )
      //                                         } else if (
      //                                             result2.err ==
      //                                             'INVALID_CREDENTIALS'
      //                                         ) {
      //                                             setError(
      //                                                 t(
      //                                                     'invalid_credentials'
      //                                                 )
      //                                             )
      //                                         } else {
      //                                             setError(
      //                                                 t('strange_error')
      //                                             )
      //                                         }
      //                                     }
      //                                 })
      //                         }
      //                     )
      //                 }
      //             },
      //             (error: string) => {
      //                 setError('Fb_error2' + JSON.stringify(error))
      //             }
      //         )
      //     } catch (err) {
      //         console.error(err)
      //     }
      //     break
      // case 'apple':
      //     break
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      AsyncStorage.removeItem('userInfo');
      setUserInfo(null);

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error('logout error: ', err);
    }
  };

  const isLoggedIn = async () => {
    try {
      setSplashLoading(true);

      let userInfo = await AsyncStorage.getItem('userInfo');
      const parsedUserInfo = JSON.parse(userInfo as string) as UserInfo;
      if (userInfo != null && userInfo != undefined) {
        setUserInfo(parsedUserInfo);
      }

      setSplashLoading(false);
    } catch (err) {
      setSplashLoading(false);
      console.error('is logged in error: ', err);
    }
  };

  React.useEffect(() => {
    isLoggedIn();

    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId:
        '192870519203-7pepuqsc1o9ahara4ulqu5s321536l33.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
      accountName: '',
      googleServicePlistPath: '',
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userInfo,
        splashLoading,
        error,
        register,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
