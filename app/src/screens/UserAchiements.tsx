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

type UserAchievements = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'UserAchievements'
>;

const allAchievements = [
    { name: 'numberOfGames1000', title: 'Number of games 1 - 1000' },
    { name: 'numberOfGames10000', title: 'Number of games 2 - 10000' },
    { name: 'numberOfFriends10', title: 'Number of friends 1 - 10' },
    { name: 'numberOfFriends100', title: 'Number of friends 2 - 100' },
    { name: 'numberOfCreatedCourses10', title: 'Number of created courses 1 - 10' },
    { name: 'numberOfCreatedCourses100', title: 'Number of created courses 2 - 100' },
    { name: 'getVerification', title: 'Get verification' },
    { name: 'getFirstFriend', title: 'Get first friend' },
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

    if (!userInfo || !data) {
        return null;
    }

    const userAchievements = data.getUserAchievements.map((achievement) => achievement.name);

    const renderAchievement = ({ item }: { item: { name: string; title: string } }) => (
        <Animated.View style={styles.animatedContainer}>
            <Card containerStyle={styles.card}>
                <View style={styles.achievementContainer}>
                    <Text style={styles.achievementTitle}>{item.title}</Text>
                    {userAchievements.includes(item.name) && (
                        <Icon name="trophy" type="font-awesome" color="#f50" style={styles.trophyIcon} />
                    )}
                </View>
            </Card>
        </Animated.View>
    );

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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    trophyIcon: {
        marginLeft: 10,
    },
    description: {
        marginTop: 10,
        fontSize: 16,
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
    },
});
