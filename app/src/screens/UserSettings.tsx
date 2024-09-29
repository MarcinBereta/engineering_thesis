import { Layout } from '@/components/Layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TextInput, View, Button, Image, StyleSheet } from 'react-native';
import { AuthenticatedRootStackParamList } from './Navigator';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { useTranslation } from 'react-i18next';
type UserSettings = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'UserSettings'
>;
export const UserSettings = (props: UserSettings) => {
    const { userInfo } = useContext(AuthContext);
    const { t, i18n } = useTranslation();

    const [userName, setUserName] = useState(userInfo?.username);
    const [notifications, setNotifications] = useState(async () => {
        const notification = await AsyncStorage.getItem('notifications');
        if (notification) {
            const parsedNotification: boolean = JSON.parse(notification);
            return parsedNotification;
        }
        return false;
    });

    const [language, setLanguage] = useState<string>('');

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

    return (
        <Layout icon="dashboard" navigation={props.navigation}>
            <Text>{t('userSettings')}</Text>
            <Text>
                {t('Username')}: {userName}
            </Text>

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
