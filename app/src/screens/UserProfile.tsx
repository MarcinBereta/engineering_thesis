import { Layout } from '@/components/Layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { AuthenticatedRootStackParamList } from './Navigator';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { userStatsGQL } from '@/services/courses/courses';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { Card, Icon } from '@rneui/base';
import { widthPixel } from '@/utils/Normalize';
import { CustomButton } from '@/components/CustomButton';
import constants from '../../constants';
type UserProfile = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'UserProfile'
>;
export const UserProfile = (props: UserProfile) => {
    const { userInfo } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState<string>('MATH');
    const { data, isLoading, refetch, isError, error } = useQuery({
        queryKey: ['stats'],
        queryFn: async () =>
            request(
                graphqlURL,
                userStatsGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });
    if (!userInfo || !data) {
        return null;
    }

    return (
        <Layout icon="dashboard" navigation={props.navigation}>
            <ScrollView contentContainerStyle={styleForProfile.container}>
                <View style={styleForProfile.header}>
                    <Image
                        style={styleForProfile.profileImage}
                        source={{
                            uri:
                                userInfo.image != null ? constants.url + '/files/avatars/' + userInfo.image :
                                    'https://randomuser.me/api/portraits/men/36.jpg',
                        }}
                    />
                    <Text style={styleForProfile.username}>
                        {userInfo?.username}
                    </Text>
                    <Text style={styleForProfile.email}>{userInfo?.email}</Text>
                </View>
                <View style={styleForProfile.button}>
                    <CustomButton
                        title={t('my_courses')}
                        onPress={() => {
                            props.navigation.navigate('MyCourses');
                        }}
                    />
                </View>
                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>
                            <Text style={styleForProfile.boldText}>
                                {t('role')}:
                            </Text>{' '}
                            {userInfo?.role}
                        </Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>
                            <Text style={styleForProfile.boldText}>
                                {t('maxed_courses')}:
                            </Text>{' '}
                            {data.getMaxedQuizesCount}
                        </Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>
                            <Text style={styleForProfile.boldText}>
                                {t('all_games')}:
                            </Text>{' '}
                            {data.getAllUserGamesCount}
                        </Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>
                            <Text style={styleForProfile.boldText}>
                                {t('friends')}:
                            </Text>{' '}
                            {data.getFriendsCount}
                        </Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>
                            <Text style={styleForProfile.boldText}>
                                {t('created_courses')}:
                            </Text>{' '}
                            {data.getCreatedCourses}
                        </Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>
                            <Text style={styleForProfile.boldText}>
                                {t('verified')}:
                            </Text>{' '}
                            {userInfo?.verified ? t('Yes') : t('No')}
                        </Text>
                    </View>
                </Card>
                <View style={styleForProfile.sectionContainer}>
                    <Text style={styleForProfile.sectionTitle}>
                        {t('unique_quizzes_played_by_category')}
                    </Text>
                    <Text style={styleForProfile.smallerTitle}>
                        {t('pick_category')}:
                    </Text>
                    <View style={styleForProfile.pickerContainer}>
                        <RNPickerSelect
                            onValueChange={(value) =>
                                setSelectedCategory(value)
                            }
                            items={[
                                { label: t('MATH'), value: 'MATH' },
                                { label: t('HISTORY'), value: 'HISTORY' },
                                { label: t('GEOGRAPHY'), value: 'GEOGRAPHY' },
                                { label: t('ENGLISH'), value: 'ENGLISH' },
                                { label: t('ART'), value: 'ART' },
                                { label: t('SPORTS'), value: 'SPORTS' },
                                { label: t('SCIENCE'), value: 'SCIENCE' },
                                { label: t('MUSIC'), value: 'MUSIC' },
                                { label: t('OTHER'), value: 'OTHER' },
                            ]}
                            value={selectedCategory}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            placeholder={{
                                label: t('select_category'),
                                value: null,
                            }}
                        />
                    </View>
                    <Card containerStyle={styleForProfile.card}>
                        <View style={styleForProfile.cardContent}>
                            <Text style={styleForProfile.cardText}>
                                {t('played_games')}:{' '}
                                {
                                    data.numberOfUniqueQuizzesPlayedByCategory[
                                    selectedCategory as keyof typeof data.numberOfUniqueQuizzesPlayedByCategory
                                    ]
                                }
                            </Text>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </Layout>
    );
};

const styleForProfile = StyleSheet.create({
    container: {
        padding: 10,
        alignItems: 'center',
    },
    pickerContainer: {
        marginVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 60,
        marginBottom: 10,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    email: {
        fontSize: 18,
        color: 'gray',
        marginBottom: 10,
    },
    card: {
        width: '100%',
    },
    boldText: {
        fontWeight: 'bold',
    },
    cardContent: {
        alignItems: 'center',
    },
    cardText: {
        fontSize: 15,
    },
    sectionContainer: {
        marginVertical: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        shadowColor: '#000',
        borderColor: '#f0f0f0',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    smallerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        marginVertical: 10,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        backgroundColor: '#f2f',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderRadius: 10,
        color: 'black',
    },
    inputAndroid: {
        fontSize: 20,
        backgroundColor: 'rgba(90, 154, 230, 1)',
        color: 'white',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 30,
        minWidth: widthPixel(150),
        textAlign: 'center',
    },
});
