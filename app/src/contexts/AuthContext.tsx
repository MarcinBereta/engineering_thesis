import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, {  useState } from 'react';
import { registerGQL, loginGQL, refreshUserGQL } from '../services/auth/auth';
import { Socket, io } from 'socket.io-client';
import constants from '../../constants';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { VariablesOf } from '@/graphql';
import { loginGoogleGQL } from '../services/auth/auth';

interface AuthContext {
    isLoading: boolean;
    userInfo: null | UserInfo;
    refreshLoading: boolean;
    error: string;
    socket: null | Socket;
    register: (
        provider: 'credentials' | 'google' | 'facebook',
        username: string,
        email: string,
        password: string
    ) => Promise<void>;
    login: (
        provider: 'credentials' | 'google' | 'facebook',
        email: string,
        password: string
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

export type RegisterDto = VariablesOf<typeof registerGQL>;
export type LoginDto = VariablesOf<typeof loginGQL>;
export type GoogleLoginDto = VariablesOf<typeof loginGoogleGQL>;

export const AuthProvider = ({
    children,
}: {
    children: React.ReactNode | React.ReactNode[];
}) => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [socket, setSocket] = useState<null | Socket>(null);

    const registerMutation = useMutation({
        mutationFn: async (data: RegisterDto) =>
            request(graphqlURL, registerGQL, data),
        onSuccess: async (data, variables, context) => {
            setError('');
            const dataObj = {
                ...data.signup.user,
                token: data.signup.access_token,
            };
            await AsyncStorage.setItem('userInfo', JSON.stringify(dataObj));
            setUserInfo(dataObj);
            const socket = io(constants.url, {
                auth: {
                    token: 'Bearer ' + data.signup.access_token,
                },
            });
            setSocket(socket);
        },
        onError: async (data, variables, context) => {},
    });

    const loginMutation = useMutation({
        mutationFn: async (data: LoginDto) =>
            request(graphqlURL, loginGQL, data),
        onSuccess: async (data, variables, context) => {
            setError('');

            const dataObj = {
                ...data.signin.user,
                token: data.signin.access_token,
            };
            await AsyncStorage.setItem('userInfo', JSON.stringify(dataObj));
            setUserInfo(dataObj);
            const socket = io(constants.url, {
                auth: {
                    token: 'Bearer ' + data.signin.access_token,
                },
            });
            setSocket(socket);
        },
        onError: async (data, variables, context) => {},
    });

    const refreshMutation = useMutation({
        mutationFn: async (token: string) =>
            request(
                graphqlURL,
                refreshUserGQL,
                {},
                {
                    Authorization: 'Bearer ' + token,
                }
            ),
        onSuccess: async (data, variables, context) => {
            let userInfo = await AsyncStorage.getItem('userInfo');
            const parsedUserInfo = JSON.parse(userInfo as string) as UserInfo;
            console.log(parsedUserInfo)
            setError('');

            const dataObj = {
                ...data.refreshUserData,
                token: parsedUserInfo.token as string,
            };
            await AsyncStorage.setItem('userInfo', JSON.stringify(dataObj));
            setUserInfo(dataObj);
            const socket = io(constants.url, {
                auth: {
                    token: 'Bearer ' + parsedUserInfo.token,
                },
            });
            setSocket(socket);
        },
        onError: async (data, variables, context) => {},
    });

    const refreshLoading = refreshMutation.isPending;

    const googleLoginMutation = useMutation({
        mutationFn: async (data: GoogleLoginDto) =>
            request(graphqlURL, loginGoogleGQL, data),
        onSuccess: async (data, variables, context) => {
            setError('');

            const dataObj = {
                ...data.providerLogin.user,
                token: data.providerLogin.access_token,
            };
            await AsyncStorage.setItem('userInfo', JSON.stringify(dataObj));
            setUserInfo(dataObj);
        },
        onError: async (data, variables, context) => {},
    });

    const register = async (
        provider: 'credentials' | 'google' | 'facebook' | 'apple',
        username: string,
        email: string,
        password: string
    ) => {
        switch (provider) {
            case 'credentials':
                registerMutation.mutate({
                    loginInput: {
                        email: email,
                        password: password,
                        username: username,
                    },
                });

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
        password: string
    ) => {
        switch (provider) {
            case 'credentials':
                try {
                    loginMutation.mutate({
                        loginInput: {
                            username: email,
                            password: password,
                        },
                    });
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

                    googleLoginMutation.mutate({
                        loginInput: {
                            email: userInfo.user.email,
                            username:
                                userInfo.user.name ||
                                userInfo.user.familyName +
                                    ' ' +
                                    userInfo.user.givenName ||
                                '',
                            image: userInfo.user.photo as string,
                        },
                    });
                } catch (err) {}
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
            let userInfo = await AsyncStorage.getItem('userInfo');
            const parsedUserInfo = JSON.parse(userInfo as string) as UserInfo;

            if (userInfo != null && userInfo != undefined) {
                refreshMutation.mutate(parsedUserInfo.token);
            }
        } catch (err) {
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
                refreshLoading,
                error,
                socket,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
