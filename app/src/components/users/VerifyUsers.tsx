import { useContext, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { fontPixel, heightPixel } from '../../utils/Normalize';
import {
    declineUserDataGQL,
    getVerifyRequestsGQL,
    verifyUserDataGQL,
} from '@/services/admin/admin';
import { graphqlURL } from '@/services/settings';
import { useMutation, useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { VariablesOf } from 'gql.tada';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../CustomButton';
import { Layout } from '../Layout';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native-gesture-handler';
export type verifyUserDataDto = VariablesOf<typeof verifyUserDataGQL>;
export type declineUserDataDto = VariablesOf<typeof declineUserDataGQL>;

type VerifyUsers = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'VerifyUsers'
>;

const VerifyUsers = (props: VerifyUsers) => {
    const { userInfo } = useContext(AuthContext);
    const { t } = useTranslation();
    const { data, isLoading, refetch, error } = useQuery({
        queryKey: ['userId'],
        queryFn: async () =>
            request(
                graphqlURL,
                getVerifyRequestsGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    console.log(error);

    const verifyUserMutation = useMutation({
        mutationFn: async (data: verifyUserDataDto) =>
            request(graphqlURL, verifyUserDataGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: (data, variables, context) => {
            props.navigation.push('CoursesList');
        },
    });

    const declineUserMutation = useMutation({
        mutationFn: async (data: declineUserDataDto) =>
            request(graphqlURL, declineUserDataGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: (data, variables, context) => {
            props.navigation.push('CoursesList');
        },
    });

    const [inReview, setInReview] = useState<null | number>(null);

    if (data == undefined || isLoading) {
        return <Text>Loading...</Text>;
    }

    const handleClick = async (requestId: string) => {
        verifyUserMutation.mutate({
            VerifyUser: {
                requestId: requestId,
            },
        });
    };

    const declineClick = async (requestId: string) => {
        declineUserMutation.mutate({
            verifyUser: {
                requestId,
            },
        });
    };

    if (inReview !== null) {
        return (
            <Layout navigation={props.navigation} icon="admin">
                <View
                    style={{
                        height: heightPixel(500),
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            color: 'black',
                            textAlign: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: fontPixel(20),
                        }}
                    >
                        {data.getVerifyRequests[inReview].text}
                    </Text>
                </View>
                <View
                    style={{
                        flex: 6,
                        justifyContent: 'space-around',
                        flexDirection: 'row',
                    }}
                >
                    <View>
                        <CustomButton
                            onPress={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleClick(data.getVerifyRequests[inReview].id);
                            }}
                            title="Verify"
                        />
                    </View>
                    <View>
                        <CustomButton
                            onPress={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                declineClick(data.getVerifyRequests[inReview].id);
                            }}
                            backgroundColor="red"
                            title="Decline"
                        />
                    </View>
                </View>
                <View
                    style={{
                        width: '100%',
                        height: heightPixel(50),
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CustomButton
                        title={t('go_back')}
                        onPress={() => {
                            setInReview(null);
                        }}
                    />
                </View>
            </Layout>
        );
    }

    return (
        <Layout navigation={props.navigation} icon="admin">
            <View
                style={{
                    flexDirection: 'column',
                    display: 'flex',
                    width: '100%',
                    height: 200,
                }}
            >
                <Text
                    style={{
                        fontSize: fontPixel(20),
                        padding: 10,
                        color: 'black',
                    }}
                >
                    Verify request!
                </Text>

                <FlatList
                    data={data.getVerifyRequests}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                const index = data.getVerifyRequests.findIndex(
                                    (ind) => ind.id === item.id
                                );
                                setInReview(index);
                            }}
                            style={{
                                padding: 5,
                                borderColor: 'black',
                                borderWidth: 1,
                                margin: 5,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <View
                                style={{
                                    flex: 6,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Text style={{ flex: 6 }}>
                                    {item.User.username}
                                </Text>
                                <Text style={{ flex: 6, color: 'black' }}>
                                    {item.text}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flex: 6,
                                    justifyContent: 'space-around',
                                    flexDirection: 'row',
                                }}
                            >
                                <View>
                                    <CustomButton
                                        onPress={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleClick(item.id);
                                        }}
                                        title="Verify"
                                    />
                                </View>
                                <View>
                                    <CustomButton
                                        onPress={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            declineClick(item.id);
                                        }}
                                        backgroundColor="red"
                                        title="Decline"
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Layout>
    );
};

export { VerifyUsers };
