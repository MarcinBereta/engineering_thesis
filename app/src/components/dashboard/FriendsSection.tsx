import { dashboardDataGQL } from '@/services/quiz/quiz';
import { normalizeText } from '@rneui/base';
import { Avatar, Card, Icon } from '@rneui/themed';
import { ResultOf, readFragment } from 'gql.tada';
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationType } from '../Navbar';
import { FriendUserFragmentGQL } from '@/services/friends/friends';
import { useTranslation } from 'react-i18next';

export const DashboardFriendsSection = ({
    navigation,
    friends,
}: {
    navigation: NavigationType;
    friends: ResultOf<typeof dashboardDataGQL>['getUserFriends'];
}) => {
    const { t } = useTranslation();
    const friendsList = readFragment(FriendUserFragmentGQL, friends);
    return (
        <View style={{ display: 'flex', flexDirection: 'column' }}>
            <TouchableOpacity
                onPress={() => {
                    navigation.push('Friends');
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: 'black',
                }}
            >
                <Text style={{ fontSize: normalizeText(20), paddingRight: 20 }}>
                    {t('friends')}
                </Text>
                <Icon type="font-awesome" name="arrow-right" size={30} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {friendsList.map((f) => (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.push('FriendProfile', {
                                friend: f,
                            });
                        }}
                    >
                        <Card
                            containerStyle={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 20,
                                display: 'flex',
                                flexDirection: 'column',
                                // backgroundColor: 'yellow',
                            }}
                        >
                            <View
                                style={{
                                    position: 'relative',
                                    alignItems: 'center',
                                }}
                            >
                                <Avatar
                                    source={{
                                        uri:
                                            f.image ||
                                            'https://cdn-icons-png.flaticon.com/512/6596/6596121.png',
                                    }}
                                />
                            </View>
                            <Card.Title>{f.username}</Card.Title>
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
