import { View, Button, TextInput } from 'react-native';
import { useContext, useState } from 'react';
import { AuthContext, UserInfo } from '../../contexts/AuthContext';
import { addVerificationRequestGQL } from '../../services/admin/admin';
import { graphqlURL } from '@/services/settings';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import { VariablesOf } from 'gql.tada';
export type addVerificationRequestDto = VariablesOf<
    typeof addVerificationRequestGQL
>;
const VerifyAccount = ({ route, navigation }: any) => {
    const { userInfo } = useContext(AuthContext);

    const [text, setText] = useState('');

    const verifyAccountMutation = useMutation({
        mutationFn: async (data: addVerificationRequestDto) =>
            request(graphqlURL, addVerificationRequestGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: (data, variables, context) => {
            navigation.push('DashboardScreen');
        },
    });

    const handleSave = async () => {
        verifyAccountMutation.mutate({
            VerificationForm: {
                text: text,
            },
        });
    };

    return (
        <View
            style={{
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <TextInput
                style={{
                    width: '80%',
                    backgroundColor: 'gray',
                    color: 'white',
                    margin: 5,
                    padding: 5,
                }}
                multiline={true}
                value={text}
                placeholder="Enter why you should be verified"
                onChange={(e) => setText(e.nativeEvent.text)}
            />
            <Button title="Submit" onPress={handleSave} />
        </View>
    );
};

export { VerifyAccount };
