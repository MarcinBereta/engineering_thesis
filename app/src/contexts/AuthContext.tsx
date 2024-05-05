import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import React, {useContext, useState} from 'react';
import {
  registerUser,
  loginUser,
  googleLogin,
  refreshUser,
} from '../services/auth/auth';
import { Socket, io } from "socket.io-client";
import constants from '../../constants';

interface AuthContext {
  isLoading: boolean;
  userInfo: any;
  splashLoading: boolean;
  error: string;
  socket: null | Socket;
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

export type UserInfo = {
  username: string;
  email: string;
  id: string;
  token: string;
  image: string | null;
  role: string;
  verified: boolean;
};
export type signInResponse = {
  access_token: string;
  user: UserInfo;
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
  const [socket, setSocket] = useState<null|Socket>(null);
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
          if (data != null) {
            const userInfo = {
              username: data.signup.user.username,
              email: data.signup.user.email,
              id: data.signup.user.id,
              token: data.signup.access_token,
              image: data.signup.user.image,
              role: data.signup.user.role,
              verified: data.signup.user.verified,
            };
            const socket = io(constants.url, {
              auth: {
                token: 'Bearer '+userInfo.token,
              },
            });
            setSocket(socket);
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
              role: data.signin.user.role,
              verified: data.signin.user.verified,
            };
            const socket = io(constants.url, {
              auth: {
                token: 'Bearer '+userInfo.token,
              },
            });
            setSocket(socket);
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
              role: data.providerLogin.user.role,
              verified: data.providerLogin.user.verified,
            };
            const socket = io(constants.url, {
              auth: {
                token: 'Bearer '+userInfo.token,
              },
            });
            setSocket(socket);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            setUserInfo(userInfo);
          }
        } catch (err) {
          console.log('1');
          console.error(err);
        }
        break;
      
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      AsyncStorage.removeItem('userInfo');
      setUserInfo(null);
      setIsLoading(false);
      setSocket(null);

    } catch (err) {
      setIsLoading(false);
      setSocket(null);
      console.error('logout error: ', err);
    }
  };

  const isLoggedIn = async () => {
    try {
      setSplashLoading(true);
      let userInfo = await AsyncStorage.getItem('userInfo');
      const parsedUserInfo = JSON.parse(userInfo as string) as UserInfo;

      if (userInfo != null && userInfo != undefined) {
        const refreshedData: any = await refreshUser(parsedUserInfo.token);
        const user = {
          ...refreshedData.data.refreshUserData,
          image:
            refreshedData.data.refreshUserData.image == ''
              ? null
              : refreshedData.data.refreshUserData.image,
          token: parsedUserInfo.token,
        };
        const socket = io(constants.url, {
          auth: {
            token: 'Bearer '+user.token,
          },
        });
        setSocket(socket);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        setUserInfo(user);
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
        socket,
        register,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
