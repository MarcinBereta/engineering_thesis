import { Layout } from '@/components/Layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Modal,
} from 'react-native';
import { AuthenticatedRootStackParamList } from './Navigator';
import React, { useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { userStatsGQL } from '@/services/courses/courses';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { Card } from '@rneui/base';
import { fontPixel, widthPixel } from '@/utils/Normalize';
import { CustomButton } from '@/components/CustomButton';
import constants from '../../constants';

type UserProfile = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'UserProfile'
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

export const UserProfile = (props: UserProfile) => {
    const { userInfo } = useContext(AuthContext);
    const { t } = useTranslation();
    const [showCategories, setShowCategories] = useState(false);
    const { data } = useQuery({
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

    const renderHeader = () => (
        <View style={styleForProfile.header}>
            <Image
                style={styleForProfile.profileImage}
                source={{
                    uri:
                        userInfo.image != null
                            ? constants.url + '/files/avatars/' + userInfo.image
                            : 'https://randomuser.me/api/portraits/men/36.jpg',
                }}
            />
            <Text style={styleForProfile.username}>{userInfo?.username}</Text>

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
            <View
                style={[
                    {
                        margin: 15,
                        width: '85%',
                        flexDirection:'row',
                        justifyContent:'space-between'
                    },
                ]}
            >
                <CustomButton
                    title={t('my_achievements')}
                    onPress={() => {
                        props.navigation.navigate('UserAchievements');
                    }}
                    buttonStyle={styleForProfile.button}
                />
                <CustomButton
                    title={t('my_courses')}
                    onPress={() => {
                        props.navigation.navigate('MyCourses');
                    }}
                    buttonStyle={styleForProfile.button}
                />
            </View>
        </View>
    );

    return (
        <Layout icon="dashboard" navigation={props.navigation}>
            <FlatList
                data={[]}
                ListHeaderComponent={renderHeader}
                renderItem={() => null}
            />
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
                                <Card
                                    containerStyle={styleForProfile.modalCard}
                                >
                                    <View style={styleForProfile.cardContent}>
                                        <Text style={styleForProfile.cardText}>
                                            {t(item.label)}:{' '}
                                            {
                                                data
                                                    .numberOfUniqueQuizzesPlayedByCategory[
                                                    item.value as keyof typeof data.numberOfUniqueQuizzesPlayedByCategory
                                                ]
                                            }
                                        </Text>
                                    </View>
                                </Card>
                            )}
                        />
                        <CustomButton
                            title={t('close')}
                            onPress={() => setShowCategories(false)}
                            buttonStyle={styleForProfile.button}
                        />
                    </View>
                </View>
            </Modal>
        </Layout>
    );
};

const styleForProfile = StyleSheet.create({
    container: {
        padding: 10,
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        marginVertical: 10,
        width: '45%',
    },
    smallButton: {
        marginVertical: 10,
        width: 'auto',
        paddingHorizontal: 10,
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

export default UserProfile;
