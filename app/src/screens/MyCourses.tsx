import { View, Text, Button } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { getMyCoursesGQL } from '@/services/courses/courses';
import { graphqlURL } from '@/services/settings';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthenticatedRootStackParamList } from './Navigator';
import { Layout } from '@/components/Layout';
import { CustomButton } from '@/components/CustomButton';
import { Card } from '@rneui/themed';

type MyCourses = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'MyCourses'
>;
const MyCourses = (props: MyCourses) => {
    const { t } = useTranslation();

    const { userInfo } = useContext(AuthContext);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['userId'],
        queryFn: async () =>
            request(
                graphqlURL,
                getMyCoursesGQL,
                {},
                {
                    Authorization: 'Bearer ' + userInfo?.token,
                }
            ),
    });

    if (isLoading || data == undefined) {
        return <Text>{t('loading')}...</Text>;
    }

    return (
        <Layout navigation={props.navigation} icon="course">
            <View style={{ flexDirection: 'column', flex: 1 }}>
                <Text>{t('courses_list')}: </Text>
                <FlatList
                    data={data.MyCourses}
                    renderItem={({ item }) => (
                        <Card>
                            <Text style={{ flex: 6, textAlign: 'center' }}>
                                {item.name}
                            </Text>
                            <Card.Divider />
                            <View
                                style={{
                                    flex: 6,
                                    justifyContent: 'space-around',
                                    flexDirection: 'row',
                                }}
                            >
                                <CustomButton
                                    onPress={() => {
                                        props.navigation.push('course', {
                                            course: item,
                                        });
                                    }}
                                    title={t("view")}
                                />
                                <CustomButton
                                    onPress={() => {
                                        props.navigation.push('EditCourse', {
                                            course: item,
                                        });
                                    }}
                                    title={t("edit")}
                                />
                            </View>
                        </Card>
                    )}
                />

                {userInfo?.verified ? (
                    <Button
                        title={t('create_course')}
                        onPress={() => {
                            props.navigation.push('createCourse');
                        }}
                    />
                ) : null}
            </View>
        </Layout>
    );
};

export { MyCourses };
