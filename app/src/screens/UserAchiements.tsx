import { Layout } from '@/components/Layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    FlatList,
    Animated,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { AuthenticatedRootStackParamList } from './Navigator';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { Card, Icon } from '@rneui/base';
import { widthPixel } from '@/utils/Normalize';
import { CustomButton } from '@/components/CustomButton';
import constants from '../../constants';
import { getUserAchievementsGQl } from '@/services/achievement/achievement';
import { userStatsGQL } from '@/services/courses/courses';

type UserAchievements = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'UserAchievements'
>;

const allAchievements = [
    { name: 'numberOfGames1000', title: 'Number of games 1 - 1000', target: 1000 },
    { name: 'numberOfGames10000', title: 'Number of games 2 - 10000', target: 10000 },
    { name: 'numberOfFriends10', title: 'Number of friends 1 - 10', target: 10 },
    { name: 'numberOfFriends100', title: 'Number of friends 2 - 100', target: 100 },
    { name: 'numberOfCreatedCourses10', title: 'Number of created courses 1 - 10', target: 10 },
    { name: 'numberOfCreatedCourses100', title: 'Number of created courses 2 - 100', target: 100 },
    { name: 'getVerification', title: 'Get verification', target: 1 },
    { name: 'getFirstFriend', title: 'Get first friend', target: 1 },
];

export const UserAchievements = (props: UserAchievements) => {
    const { userInfo } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const { data, isLoading, refetch, isError, error } = useQuery({
        queryKey: ['achievements'],
        queryFn: async () =>
            request(
                graphqlURL,
                getUserAchievementsGQl,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    const { data: statsData } = useQuery({
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

    if (!userInfo || !data || !statsData) {
        return null;
    }

    const userAchievements = data.getUserAchievements.map((achievement) => achievement.name);

    const getProgress = (achievementName: string) => {
        switch (achievementName) {
            case 'numberOfGames1000':
                return statsData.getAllUserGamesCount / 1000;
            case 'numberOfGames10000':
                return statsData.getAllUserGamesCount / 10000;
            case 'numberOfFriends10':
                return statsData.getFriendsCount / 10;
            case 'numberOfFriends100':
                return statsData.getFriendsCount / 100;
            case 'numberOfCreatedCourses10':
                return statsData.getCreatedCourses / 10;
            case 'numberOfCreatedCourses100':
                return statsData.getCreatedCourses / 100;
            case 'getVerification':
                return userInfo.verified ? 1 : 0;
            case 'getFirstFriend':
                return statsData.getFriendsCount > 0 ? 1 : 0;
            default:
                return 0;
        }
    };

    const renderAchievement = ({ item }: { item: { name: string; title: string, target: number } }) => {
        const progress = getProgress(item.name);
        const isAchieved = userAchievements.includes(item.name);
        return (
            <Animated.View style={styles.animatedContainer}>
                <Card containerStyle={styles.card}>
                    <View style={styles.achievementContainer}>
                        <Text style={styles.achievementTitle}>{item.title}</Text>
                        {isAchieved && (
                            <Icon name="trophy" type="font-awesome" color="#f50" style={styles.trophyIcon} />
                        )}
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: isAchieved ? '#FFD700' : '#4A90E2' }]} />
                    </View>
                    <Text style={styles.progressText}>{`${Math.round(progress * 100)}%`}</Text>
                </Card>
            </Animated.View>
        );
    };

    return (
        <Layout navigation={props.navigation} icon="achievement">
            <Text
                style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 24,
                    marginVertical: 20,
                }}
            >
                {t('user_achievements')}
            </Text>
            <FlatList
                data={allAchievements}
                renderItem={renderAchievement}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContainer}
            />
        </Layout>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    achievementContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    achievementTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    trophyIcon: {
        marginLeft: 10,
    },
    description: {
        marginTop: 10,
        fontSize: 14,
        textAlign: 'center',
    },
    animatedContainer: {
        transform: [{ scale: 1 }],
        opacity: 1,
    },
    card: {
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        padding: 10,
        marginVertical: 10,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 5,
    },
    progressBar: {
        height: '100%',
    },
    progressText: {
        textAlign: 'center',
        marginTop: 5,
        fontSize: 12,
        color: '#333',
    },
});