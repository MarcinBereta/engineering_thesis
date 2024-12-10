import { Layout } from '@/components/Layout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Animated,
} from 'react-native';
import { AuthenticatedRootStackParamList } from './Navigator';
import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { Card, Icon } from '@rneui/base';
import { widthPixel } from '@/utils/Normalize';
import constants from '../../constants';
import { getFriendAchievementsGQl, getUserAchievementsGQl } from '@/services/achievement/achievement';

type FriendsAchievements = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'FriendsAchievements'
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

export const FriendsAchievements = (props: FriendsAchievements) => {
    const { userInfo } = useContext(AuthContext);
    const { t } = useTranslation();
    const { friendId } = props.route.params;

    const { data: userData, isLoading: isUserLoading, isError: isUserError, error: userError } = useQuery({
        queryKey: ['userAchievements'],
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

    const { data: friendData, isLoading: isFriendLoading, isError: isFriendError, error: friendError } = useQuery({
        queryKey: ['friendAchievements'],
        queryFn: async () =>
            request(
                graphqlURL,
                getFriendAchievementsGQl,
                { friendId },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    if (isUserLoading || isFriendLoading) {
        return <Text>Loading...</Text>;
    }

    if (isUserError || isFriendError) {
        return <Text>Error: {userError?.message || friendError?.message}</Text>;
    }

    const userAchievements = userData?.getUserAchievements?.map((achievement) => achievement.name) || [];
    const friendAchievements = Array.isArray(friendData?.getFriendAchievements) ? friendData?.getFriendAchievements.map((achievement: { name: string }) => achievement.name) : [];

    const renderAchievement = ({ item }: { item: { name: string; title: string, target: number } }) => {
        const isUserAchieved = userAchievements.includes(item.name);
        const isFriendAchieved = (friendAchievements || []).includes(item.name);

        return (
            <Animated.View style={styles.animatedContainer}>
                <Card containerStyle={styles.card}>
                    <View style={styles.achievementContainer}>
                        <View style={styles.iconContainer}>
                            {isFriendAchieved ? (
                                <Icon name="trophy" type="font-awesome" color="#b80" style={styles.trophyIcon} />
                            ) : (
                                <Icon name="times-circle" type="font-awesome" color="#ccc" style={styles.trophyIcon} />
                            )}
                        </View>
                        <Text style={styles.achievementTitle}>{item.title}</Text>
                        <View style={styles.iconContainer}>
                            {isUserAchieved ? (
                                <Icon name="trophy" type="font-awesome" color="#f50" style={styles.trophyIcon} />
                            ) : (
                                <Icon name="times-circle" type="font-awesome" color="#ccc" style={styles.trophyIcon} />
                            )}
                        </View>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    return (
        <Layout navigation={props.navigation} icon="achievement">
            <Text style={styles.header}>
                {t('compare_achievements_screen')}
            </Text>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{t('friend')}</Text>
                <Text style={styles.headerText}>{t('achievement')}</Text>
                <Text style={styles.headerText}>{t('you')}</Text>
            </View>
            <FlatList
                data={allAchievements}
                renderItem={renderAchievement}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContainer}
            />
            <View style={styles.footerContainer}>
                <View style={styles.footerItem}>
                    <Text style={styles.footerText}>
                        {t('friend_achievements')}
                    </Text>
                    <Text style={styles.footerNumber}>
                        {(friendAchievements || []).length}
                    </Text>
                </View>
                <View style={styles.footerItem}>
                    <Text style={styles.footerText}>
                        {t('your_achievements')}
                    </Text>
                    <Text style={styles.footerNumber}>
                        {userAchievements.length}
                    </Text>
                </View>
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 10,
        backgroundColor: '#f8f9fa',
        paddingVertical: 10,
        borderRadius: 10,
    },
    headerText: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    achievementContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        height: '100%',
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 24,
        height: 24,
    },
    achievementTitle: {
        flex: 2,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    iconsContainer: {
        flexDirection: 'row',
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
        padding: 8,
        marginVertical: 5,
        backgroundColor: '#fff',
        height: 62,
    },
    header: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 24,
        marginVertical: 20,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    footerItem: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
});

export default FriendsAchievements;