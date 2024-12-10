import { graphql } from '@/graphql';

export const getUserAchievementsGQl = graphql(`
    query getUserAchievements {
        getUserAchievements {
        userId
        name
        icon
        }
    }
    `);


export const getFriendAchievementsGQl = graphql(`
        query getFriendAchievements($friendId: String!) {
            getFriendAchievements(friendId: $friendId) {
                userId
                name
                icon
            }
        }
    `);
