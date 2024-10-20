import { Layout } from '@/components/Layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TextInput, View, Button, Image, StyleSheet } from 'react-native';
import { AuthenticatedRootStackParamList } from './Navigator';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { useTranslation } from 'react-i18next';
import DocumentPicker from 'react-native-document-picker';
import {
    addAvatar,
    addCourseGQL,
    changeDataGQL,
} from '@/services/courses/courses';
import { CustomButton } from '@/components/CustomButton';
import constants from '../../constants';
import request from 'graphql-request';
import { useMutation } from '@tanstack/react-query';
import { graphqlURL } from '@/services/settings';
import { VariablesOf } from 'gql.tada';

type UserSettings = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'UserSettings'
>;

export type changeDataDto = VariablesOf<typeof changeDataGQL>;
export const UserSettings = (props: UserSettings) => {
    const { userInfo, updateUserImage, updateUserData } =
        useContext(AuthContext);
    const { t, i18n } = useTranslation();

    const [userName, setUserName] = useState(userInfo?.username);
    const [image, setImage] = useState(userInfo?.image);
    const [email, setEmail] = useState(userInfo?.email);
    const [language, setLanguage] = useState<string>('');

    const addUserMutation = useMutation({
        mutationFn: async (data: changeDataDto) => {
            console.log('Sending request with data:', data);
            try {
                const response = await request(graphqlURL, changeDataGQL, data, {
                    Authorization: 'Bearer ' + userInfo?.token,
                });
                console.log('Response:', response);
                return response;
            } catch (error) {
                console.error('Error in request:', error);
                throw error;
            }
        },
        onSuccess: () => {
            console.log(email, userName)
            updateUserData(email || '', userName || '');
            clearCache();
            console.log('Updated')
        },
    });
    useEffect(() => {
        getLanguage().then((lang) => setLanguage(lang));
    }, []);

    const getLanguage = async () => {
        const language = await AsyncStorage.getItem('language');
        if (language) {
            return language;
        }
        return 'en';
    };

    const changeLanguage = async (lang: string) => {
        await AsyncStorage.setItem('language', lang);
        await i18n.changeLanguage(lang);
        setLanguage(lang);
    };

    const uploadFile = async () => {
        const res: any = await DocumentPicker.pick({
            type: [DocumentPicker.types.images],
        });
        const id = generateRandomId();
        const file = res[0];
        const ending = file.type.split('/')[1];
        file.name = `${id}.${ending}`;
        await addAvatar(res[0], userInfo?.id || '');
        setImage(file.name);
        updateUserImage(file.name)
        await clearCache();
    };

    const updateData = async () => {
        if (userName == null || email == null) return;
        if (userName.length < 3 || email.length == 3) return;
        addUserMutation.mutate({
            changeData: {
                userName: userName || '',
                email: email || '',
            },
        });
    };
    const clearCache = async () => {
        try {
            await AsyncStorage.removeItem('userInfo');
            console.log('Specific item removed from cache');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    };

    return (
        <Layout icon="dashboard" navigation={props.navigation}>
            <Image
                style={{
                    width: 100,
                    height: 100,
                    borderRadius: 60,
                    marginBottom: 10,
                }}
                source={{
                    uri:
                        image != null
                            ? constants.url + '/files/avatars/' + image
                            : 'https://randomuser.me/api/portraits/men/36.jpg',
                }}
            />
            <Text>{t('userSettings')}</Text>
            <Text>{t('Username')}:</Text>
            <TextInput
                value={userName}
                onChangeText={(text) => setUserName(text)}
            />
            <Text>{t('Email')}:</Text>
            <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
            />
            <CustomButton title={t('Change photo')} onPress={uploadFile} />
            <CustomButton title={t('update_data')} onPress={updateData} />

            <RNPickerSelect
                onValueChange={(value) => {
                    changeLanguage(value);
                }}
                items={[
                    { label: t('English'), value: 'en' },
                    { label: t('Polish'), value: 'pl' },
                    { label: t('Spanish'), value: 'es' },
                    { label: t('France'), value: 'fr' },
                    { label: t('German'), value: 'de' },
                ]}
                value={language}
            />
        </Layout>
    );
};
function generateRandomId() {
    const size = 16;
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < size) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}
