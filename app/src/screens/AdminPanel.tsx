import { View, Text, Button } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import { fontPixel } from '../utils/Normalize';
import { Layout } from '@/components/Layout';
import { ListItem } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
type AdminPanel = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'AdminPanel'
>;
const AdminPanel = (props: AdminPanel) => {
    const { t } = useTranslation();
    const { userInfo } = useContext(AuthContext);
    const items = [];
    if (userInfo?.role == 'ADMIN' || userInfo?.role == 'MODERATOR') {
        items.push({
            title: t('verify_courses'),
            onPress: () => {
                props.navigation.push('UnVerifiedCourses');
            },
        });

        items.push({
            title: t('verify_users'),
            onPress: () => {
                props.navigation.push('VerifyUsers');
            },
        });
    }
    if (userInfo?.role == 'ADMIN') {
        items.push({
            title: t('users_list'),
            onPress: () => {
                props.navigation.push('UserList');
            },
        });
    }
    return (
        <Layout navigation={props.navigation} icon="admin">
            <Text
                style={{
                    fontSize: fontPixel(30),
                    textAlign: 'center',
                    marginBottom: 20,
                }}
            >
                {t('admin_panel')}
            </Text>

            {items.map((item, index) => (
                <ListItem
                    style={{
                        width: '90%',
                        marginLeft: '5%',
                        marginBottom: 20,
                    }}
                    key={index}
                    onPress={item.onPress}
                    bottomDivider
                >
                    <ListItem.Content>
                        <ListItem.Title>{item.title}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                </ListItem>
            ))}
        </Layout>
    );
};

export { AdminPanel };
