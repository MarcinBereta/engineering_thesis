import { View, Button, TextInput, Text } from 'react-native';
import { useContext, useState } from 'react';
import { AuthContext, UserInfo } from '../../contexts/AuthContext';
import { addVerificationRequestGQL } from '../../services/admin/admin';
import { graphqlURL } from '@/services/settings';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import { VariablesOf } from 'gql.tada';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../CustomButton';
import { fontPixel, heightPixel } from '@/utils/Normalize';
import { useTranslation } from 'react-i18next';
export type addVerificationRequestDto = VariablesOf<
    typeof addVerificationRequestGQL
>;
type VerifyAccount = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'VerifyAccount'
>;
const VerifyAccount = ({ route, navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [isError, setIsError] = useState(false);
    const verifyAccountMutation = useMutation({
        mutationFn: async (data: addVerificationRequestDto) =>
            request(graphqlURL, addVerificationRequestGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: (data, variables, context) => {
            navigation.push('DashboardScreen');
        },
        onError: (err, variables) => {
            console.log(err);
            setIsError(true);
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
            <Text
                style={{
                    fontSize: fontPixel(20),
                    margin: 10,
                    color: 'black',
                    fontWeight: 'bold',
                }}
            >
                {t('enter_reason_for_verification')}
            </Text>
            <TextInput
                style={{
                    width: '90%',
                    maxHeight: heightPixel(300),
                    textAlign: 'center',
                    color: 'black',
                    margin: 5,
                    padding: 5,
                    borderWidth: 1,
                    borderColor: isError ? 'red' : '#5a9ae6',
                    borderRadius: fontPixel(20),
                }}
                multiline={true}
                value={text}
                placeholder="Enter why you should be verified"
                onChange={(e) => setText(e.nativeEvent.text)}
            />
            {isError && (
                <Text style={{ color: 'red' }}>{t('form_already_sent')}</Text>
            )}
            <CustomButton title="Submit" onPress={handleSave} />
        </View>
    );
};

export { VerifyAccount };
