import { Layout } from '@/components/Layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthenticatedRootStackParamList } from './Navigator';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { ResultOf } from 'gql.tada';
import { userStatsGQL } from '@/services/courses/courses';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { Card, Icon } from '@rneui/base';
type UserProfile = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'UserProfile'
>;
export const UserProfile = (props: UserProfile) => {
    const { userInfo } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
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
    if (userInfo === null || data === undefined) {
        return null;
    }
    console.log(data);
    return (
        <Layout icon="dashboard" navigation={props.navigation}>
            <ScrollView contentContainerStyle={styleForProfile.container}>
                <View style={styleForProfile.header}>
                    <Image
                        style={styleForProfile.profileImage}
                        source={{ uri: userInfo?.image ?? "https://randomuser.me/api/portraits/men/36.jpg" }}
                    />
                    <Text style={styleForProfile.username}>{userInfo?.username}</Text>
                    <Text style={styleForProfile.email}>{userInfo?.email}</Text>
                </View>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>{t('Role')}: {userInfo?.role}</Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>{t('Maxed Courses')}: {data.getMaxedQuizes}</Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>{t('All games')}: {data.getAllUserGames}</Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>{t('Friends')}: {data.getAllUserFriends}</Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>{t('Created Courses')}: {data.getCreatedCourses}</Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>{t('Verified')}: {userInfo?.verified ? t('Yes') : t('No')}</Text>
                    </View>
                </Card>
            </ScrollView>
        </Layout>
    );
};

const styleForProfile = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
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
        marginBottom: 15,
    },
    card: {
        width: '100%',
        marginBottom: 15,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 15,
    },
});
