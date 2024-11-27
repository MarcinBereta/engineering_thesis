import { Layout } from '@/components/Layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View, FlatList, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { AuthenticatedRootStackParamList } from './Navigator';
import React, { useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getFriendStatsGQL } from '@/services/courses/courses';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { Card } from '@rneui/base';
import { fontPixel, widthPixel } from '@/utils/Normalize';
import constants from '../../constants';

const { width } = Dimensions.get('window');

type FriendProfile = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'FriendProfile'
>;

const categories = [
    { label: 'MATH', value: 'MATH' },
    { label: 'HISTORY', value: 'HISTORY' },
    { label: 'GEOGRAPHY', value: 'GEOGRAPHY' },
    { label: 'ENGLISH', value: 'ENGLISH' },
    { label: 'ART', value: 'ART' },
    { label: 'SPORTS', value: 'SPORTS' },
    { label: 'SCIENCE', value: 'SCIENCE' },
    { label: 'MUSIC', value: 'MUSIC' },
    { label: 'OTHER', value: 'OTHER' },
];

export const FriendProfile = (props: FriendProfile) => {
    const { userInfo } = useContext(AuthContext);
    const { t } = useTranslation();
    const [showCategories, setShowCategories] = useState(false);
    const { data } = useQuery({
        queryKey: ['friendStats', props.route.params.friend.id],
        queryFn: async () =>
            request(
                graphqlURL,
                getFriendStatsGQL,
                {
                    userId: props.route.params.friend.id,
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    if (!userInfo || !data) {
        return null;
    }

    const createKeyEntry = (
        key: keyof typeof data.numberOfUniqueQuizzesPlayedByCategoryByUserId
    ) => {
        const values = data.numberOfUniqueQuizzesPlayedByCategoryByUserId;
        const val = values[key] || 0;
        return `${t(key)} (${val})`;
    };

    const { friend } = props.route.params;
    return (
        <Layout icon="dashboard" navigation={props.navigation}>
            <ScrollView contentContainerStyle={styleForProfile.container}>
                <View style={styleForProfile.header}>
                    <Image
                        style={styleForProfile.profileImage}
                        source={{
                            uri:
                                friend.image != null
                                    ? constants.url +
                                    '/files/avatars/' +
                                    friend.image
                                    : 'https://randomuser.me/api/portraits/men/36.jpg',
                        }}
                    />
                    <Text style={styleForProfile.username}>
                        {friend?.username}
                    </Text>
                    <Text style={styleForProfile.email}>{userInfo?.email}</Text>
                    <Card containerStyle={styleForProfile.card}>
                        <View style={styleForProfile.cardContent}>
                            <View style={styleForProfile.row}>
                                <Text style={styleForProfile.cardText}>
                                    <Text style={styleForProfile.boldText}>
                                        {t('unique_quizzes_played_by_category')}:
                                    </Text>
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowCategories(true)}
                                    style={styleForProfile.customButton}
                                >
                                    <Text style={styleForProfile.customButtonText}>
                                        {t('show_categories')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>
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
                            {data.getMaxedQuizesCountByUserId}
                        </Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>
                            <Text style={styleForProfile.boldText}>
                                {t('all_games')}:
                            </Text>{' '}
                            {data.getAllUserGamesCountByUserId}
                        </Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>
                            <Text style={styleForProfile.boldText}>
                                {t('friends')}:
                            </Text>{' '}
                            {data.getFriendsCountByUserId}
                        </Text>
                    </View>
                </Card>

                <Card containerStyle={styleForProfile.card}>
                    <View style={styleForProfile.cardContent}>
                        <Text style={styleForProfile.cardText}>
                            <Text style={styleForProfile.boldText}>
                                {t('created_courses')}:
                            </Text>{' '}
                            {data.getCreatedCoursesByUserId}
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
            </ScrollView>
            <Modal
                visible={showCategories}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategories(false)}
            >
                <View style={styleForProfile.modalOverlay}>
                    <View style={styleForProfile.modalContent}>
                        <Text style={styleForProfile.modalTitle}>
                            {t('unique_quizzes_played_by_category')}
                        </Text>
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <Card containerStyle={styleForProfile.modalCard}>
                                    <View style={styleForProfile.cardContent}>
                                        <Text style={styleForProfile.cardText}>
                                            {t(item.label)}:{' '}
                                            {
                                                data.numberOfUniqueQuizzesPlayedByCategoryByUserId[
                                                item.value as keyof typeof data.numberOfUniqueQuizzesPlayedByCategoryByUserId
                                                ]
                                            }
                                        </Text>
                                    </View>
                                </Card>
                            )}
                        />
                        <TouchableOpacity
                            onPress={() => setShowCategories(false)}
                            style={styleForProfile.customButton}
                        >
                            <Text style={styleForProfile.customButtonText}>
                                {t('close')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Layout>
    );
};

const styleForProfile = StyleSheet.create({
    container: {
        alignItems: 'center',
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
    },
    email: {
        fontSize: 18,
        color: 'gray',
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
    button: {
        marginVertical: 10,
        width: '40%',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    modalCard: {
        width: '100%',
        marginVertical: 5,
        alignSelf: 'center',
        marginBottom: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    customButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    customButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default FriendProfile;