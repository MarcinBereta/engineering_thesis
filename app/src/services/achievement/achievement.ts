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
