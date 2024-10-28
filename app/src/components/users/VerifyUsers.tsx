import { useContext } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { fontPixel } from '../../utils/Normalize';
import {
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
export type verifyUserDataDto = VariablesOf<typeof verifyUserDataGQL>;
type VerifyUsers = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'VerifyUsers'
>;

const VerifyUsers = (props: VerifyUsers) => {
    const { userInfo } = useContext(AuthContext);
    const { data, isLoading, refetch } = useQuery({
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

    const verifyUserMutation = useMutation({
        mutationFn: async (data: verifyUserDataDto) =>
            request(graphqlURL, verifyUserDataGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: (data, variables, context) => {
            props.navigation.push('CoursesList');
        },
    });

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

    return (
        <View style={{ flexDirection: 'column', flex: 1 }}>
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
                    <View
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
                            <Text style={{ flex: 6 }}>{item.text}</Text>
                        </View>

                        <View
                            style={{
                                flex: 6,
                                justifyContent: 'space-around',
                                flexDirection: 'row',
                            }}
                        >
                            <CustomButton
                                onPress={() => {
                                    handleClick(item.id);
                                }}
                                title="Verify"
                            />
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

export { VerifyUsers };
