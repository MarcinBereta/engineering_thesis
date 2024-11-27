import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
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

const VerifyAccount = ({ route, navigation }: VerifyAccount) => {
    const { userInfo } = useContext(AuthContext);
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [isError, setIsError] = useState(false);

    const verifyAccountMutation = useMutation({
        mutationFn: async (data: addVerificationRequestDto) =>
            request(graphqlURL, addVerificationRequestGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: () => {
            navigation.push('DashboardScreen');
        },
        onError: () => {
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
        <View style={styles.container}>
            <Text style={styles.title}>
                {t('enter_reason_for_verification')}
            </Text>
            <Text style={styles.instruction}>
                {t('please_provide_reason')}
            </Text>
            <TextInput
                style={[styles.textInput, { borderColor: isError ? 'red' : '#5a9ae6' }]}
                multiline={true}
                value={text}
                placeholder={t('enter_reason_placeholder')}
                onChange={(e) => setText(e.nativeEvent.text)}
            />
            {isError && (
                <Text style={styles.errorText}>{t('form_already_sent')}</Text>
            )}
            <CustomButton title={t('submit')} onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: fontPixel(24),
        marginBottom: 10,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    instruction: {
        fontSize: fontPixel(16),
        marginBottom: 20,
        color: 'gray',
        textAlign: 'center',
    },
    textInput: {
        width: '100%',
        maxHeight: heightPixel(200),
        textAlign: 'left',
        color: 'black',
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderRadius: fontPixel(10),
        backgroundColor: 'white',
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export { VerifyAccount };