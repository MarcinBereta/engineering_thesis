import { View, Text, Modal, TextInput, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useState } from 'react';
import { fontPixel, heightPixel, widthPixel } from '../utils/Normalize';
import { FlatList } from 'react-native-gesture-handler';
import { graphqlURL } from '@/services/settings';
import { useMutation, useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import {
    FriendUserFragmentGQL,
    addFriendRequestGQL,
    getFriendDataGQL,
} from '@/services/friends/friends';
import { readFragment } from '@/graphql';
import { FriendItem } from '@/components/friends/FriendItem';
import { FriendRequestItem } from '@/components/friends/FriendRequestItem';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
import { CustomButton } from '@/components/CustomButton';
import { Layout } from '@/components/Layout';

type Friends = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'Friends'
>;

const Friends = (props: Friends) => {
    const { t } = useTranslation();

    const { userInfo } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['friendsList'],
        queryFn: async () =>
            request(
                graphqlURL,
                getFriendDataGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    const addFriend = useMutation({
        mutationFn: async (name: string) =>
            request(
                graphqlURL,
                addFriendRequestGQL,
                {
                    friendName: name,
                },
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
        onSuccess: () => {
            setIsModalOpen(false);
            refetch();
        },
    });

    if (data == undefined || isLoading) {
        return <Text>{t('loading')}...</Text>;
    }

    const friendRequests = readFragment(
        FriendUserFragmentGQL,
        data.getUserFriendRequests
    );
    const friends = readFragment(FriendUserFragmentGQL, data.getUserFriends);
    return (
        <Layout navigation={props.navigation} icon="friends">
            <View style={styles.container}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalOpen}
                    onRequestClose={() => {
                        setIsModalOpen(false);
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{t('add_friend')}</Text>
                            <TextInput
                                placeholder={t('enter_username')}
                                onChangeText={(text) => {
                                    setUsername(text);
                                }}
                                style={styles.textInput}
                            />
                            <View style={styles.modalButtons}>
                                <CustomButton
                                    title={t('add')}
                                    onPress={() => {
                                        addFriend.mutate(username);
                                    }}
                                    buttonStyle={styles.modalButton}
                                />
                                <CustomButton
                                    title={t('cancel')}
                                    onPress={() => {
                                        setIsModalOpen(false);
                                    }}
                                    buttonStyle={styles.modalButton}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
                {friends?.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>
                            {t('friend_list')}
                        </Text>
                        <FlatList
                            data={friends || []}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <FriendItem
                                        friend={item}
                                        navigation={props.navigation}
                                    />
                                </View>
                            )}
                        />
                    </>
                )}

                {friendRequests?.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>
                            {t('friend_request')}
                        </Text>
                        <FlatList
                            data={friendRequests || []}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <FriendRequestItem friend={item} />
                                </View>
                            )}
                        />
                    </>
                )}
                {friendRequests?.length === 0 && friends?.length === 0 ? (
                    <View style={styles.emptyState}>
                        <CustomButton
                            title={t('add_friend')}
                            onPress={() => {
                                setIsModalOpen(true);
                            }}
                            iconContainerStyle={{ marginRight: 10 }}
                            titleStyle={{ fontWeight: '700' }}
                            buttonStyle={styles.addButton}
                        />
                    </View>
                ) : (
                    <View style={styles.addButtonContainer}>
                        <CustomButton
                            title={t('add_friend')}
                            onPress={() => {
                                setIsModalOpen(true);
                            }}
                            buttonStyle={styles.addButton}
                        />
                    </View>
                )}
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        padding: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    modalTitle: {
        fontSize: fontPixel(20),
        fontWeight: 'bold',
        marginBottom: 20,
    },
    textInput: {
        width: '90%',
        height: heightPixel(50),
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        margin: 10,
        padding: 10,
        fontSize: fontPixel(20),
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    modalButton: {
        width: '45%',
        backgroundColor: '#4A90E2',
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: fontPixel(20),
        padding: 10,
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        height: '100%',
        left: '10%',
    },
    addButton: {
        backgroundColor: 'rgba(90, 154, 230, 1)',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 30,
        width: widthPixel(200),
        height: heightPixel(50),
    },
    addButtonContainer: {
        width: '80%',
        left: '10%',
        marginTop: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#ddd',
    },
});

export { Friends };