import { Layout } from '@/components/Layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TextInput, View, Image, StyleSheet } from 'react-native';
import { AuthenticatedRootStackParamList } from './Navigator';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { useTranslation } from 'react-i18next';
import DocumentPicker from 'react-native-document-picker';
import { addAvatar, changeDataGQL } from '@/services/courses/courses';
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
    const { userInfo, updateUserImage, updateUserData, logout } =
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
                const response = await request(
                    graphqlURL,
                    changeDataGQL,
                    data,
                    {
                        Authorization: 'Bearer ' + userInfo?.token,
                    }
                );
                console.log('Response:', response);
                return response;
            } catch (error) {
                console.error('Error in request:', error);
                throw error;
            }
        },
        onSuccess: () => {
            console.log(email, userName);
            updateUserData(email || '', userName || '');
            clearCache();
            console.log('Updated');
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
        updateUserImage(file.name);
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
            <View style={styles.container}>
                <Text style={styles.header}>{t('userSettings')}</Text>
                <Text style={styles.titleLabel}>{t('update_photo')}</Text>
                <View style={styles.imageContainer}>
                    <Image
                        style={{
                            width: 150,
                            height: 150,
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
                </View>
                <CustomButton title={t('update_photo')} onPress={uploadFile} />
                <Text style={styles.titleLabel}>{t('update_data')}</Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('Username')}:</Text>
                    <TextInput
                        style={styles.input}
                        value={userName}
                        onChangeText={(text) => setUserName(text)}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('Email')}:</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                    />
                </View>
                <CustomButton title={t('update_data')} onPress={updateData} />
                <View style={styles.pickerContainer}>
                    <Text style={styles.titleLabel}>{t('language')}</Text>
                    <RNPickerSelect
                        onValueChange={changeLanguage}
                        items={[
                            { label: t('English'), value: 'en' },
                            { label: t('Polish'), value: 'pl' },
                            { label: t('Spanish'), value: 'es' },
                            { label: t('France'), value: 'fr' },
                            { label: t('German'), value: 'de' },
                        ]}
                        value={language}
                        style={pickerSelectStyles}
                    />
                </View>
                <View>
                    <CustomButton
                        title={t('logout')}
                        onPress={() => {
                            logout();
                        }}
                    />
                </View>
            </View>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    titleLabel: {
        fontSize: 20,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    pickerContainer: {
        marginTop: 20,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 5,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
});
