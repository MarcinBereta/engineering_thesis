import {graphql} from '@/graphql';

export const FriendUserFragmentGQL = graphql(`
  fragment FriendUserFragment on User {
    id
    username
    email
    password
    createdAt
    updatedAt
    role
    verified
    image
  }
`);

export const getFriendDataGQL = graphql(
  `
    query GetUserFriends {
      getUserFriends {
        ...FriendUserFragment
      }
      getUserFriendRequests {
        ...FriendUserFragment
      }
    }
  `,
  [FriendUserFragmentGQL],
);

export const addFriendRequestGQL = graphql(`
  mutation Mutation($friendName: String!) {
    addFriendRequest(friendName: $friendName) {
      message
    }
  }
`);

export const acceptFriendRequestGQL = graphql(`
  mutation Mutation($friendId: String!) {
    acceptFriendRequest(friendId: $friendId) {
      message
    }
  }
`);

export const declineFriendRequestGQL = graphql(`
  mutation Mutation($friendId: String!) {
    declineFriendRequest(friendId: $friendId) {
      message
    }
  }
`);

export const removeFriendGQL = graphql(`
  mutation Mutation($friendId: String!) {
    removeFriend(friendId: $friendId) {
      message
    }
  }
`);
