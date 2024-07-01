import { View, Text, Button, Modal, TouchableOpacity } from 'react-native';
import { AuthContext, UserInfo } from '../contexts/AuthContext';
import { useContext, useState } from 'react';
import { fontPixel } from '../utils/Normalize';
import { updateUserDataGQL } from '../services/admin/admin';
import RNPickerSelect from 'react-native-picker-select';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlURL } from '@/services/settings';
import { VariablesOf } from '@/graphql';
import { CustomButton } from '@/components/CustomButton';
import { Layout } from '@/components/Layout';

export type verifyUserDataDto = VariablesOf<typeof updateUserDataGQL>;

const User = ({ route, navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const { user } = route.params;
    const [tempCategories, setTempCategories] = useState<
        { value: string; label: string; checked: boolean }[]
    >(() => {
        let dbCategories = [
            'MATH',
            'SCIENCE',
            'HISTORY',
            'GEOGRAPHY',
            'ENGLISH',
            'ART',
            'MUSIC',
            'SPORTS',
            'OTHER',
        ];
        const cats = [];
        if (user.role == 'USER') return [];
        const userCategories: string[] = user.Moderator[0].categories;
        for (let dbCat of dbCategories) {
            if (userCategories.includes(dbCat))
                cats.push({
                    label: dbCat,
                    value: dbCat,
                    checked: userCategories.includes(dbCat),
                });
        }
        return cats;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState<
        { value: string; label: string; checked: boolean }[]
    >(() => {
        let dbCategories = [
            'MATH',
            'SCIENCE',
            'HISTORY',
            'GEOGRAPHY',
            'ENGLISH',
            'ART',
            'MUSIC',
            'SPORTS',
            'OTHER',
        ];
        const cats = [];
        if (user.role == 'USER') return [];
        const userCategories: string[] = user.Moderator[0].categories;
        for (let dbCat of dbCategories) {
            cats.push({
                label: dbCat,
                value: dbCat,
                checked: userCategories.includes(dbCat),
            });
        }
        return cats;
    });
    const [userData, setUserData] = useState<UserInfo>(user);
    const [userRole, setUserRole] = useState(user.role);

    const updateUserDataMutation = useMutation({
        mutationFn: async (data: verifyUserDataDto) =>
            request(graphqlURL, updateUserDataGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: (data, variables, context) => {
            setUserData({ ...data.updateUser, token: userData.token });
            setUserRole(data.updateUser.role);
        },
    });
    const handleSave = async () => {
        updateUserDataMutation.mutate({
            UserEdit: {
                id: userData.id,
                role: userData.role,
                verified: userData.verified,
                categories: categories
                    .filter((c) => c.checked)
                    .map((c) => c.value),
            },
        });
    };

    return (
        <Layout navigation={navigation} icon="admin">
            <Text
                style={{
                    fontSize: fontPixel(30),
                    padding: 10,
                    color: 'black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                }}
            >
                {userData.username}
            </Text>
            <Text
                style={{
                    fontSize: fontPixel(20),
                    padding: 10,
                    color: 'black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                }}
            >
                Email: {userData.email}
            </Text>
            {userInfo?.role == 'ADMIN' ? (
                <RNPickerSelect
                    onValueChange={(value) => {
                        setUserData((dt) => {
                            return {
                                ...dt,
                                role: value,
                            };
                        });
                    }}
                    items={[
                        { label: 'ADMIN', value: 'ADMIN' },
                        { label: 'MODERATOR', value: 'MODERATOR' },

                        { label: 'USER', value: 'USER' },
                    ]}
                    value={userData.role}
                />
            ) : null}

            <RNPickerSelect
                onValueChange={(value) => {
                    setUserData((dt) => {
                        return {
                            ...dt,
                            verified: value === 'VERIFIED' ? true : false,
                        };
                    });
                }}
                items={[
                    { label: 'VERIFIED', value: 'VERIFIED' },
                    { label: 'NOT VERIFIED', value: 'NOT_VERIFIED' },
                ]}
                value={userData.verified ? 'VERIFIED' : 'NOT_VERIFIED'}
            />

            {userRole == 'MODERATOR' || userRole == 'ADMIN' ? (
                <View style={{ padding: 5 }}>
                    <Text
                        style={{
                            fontSize: fontPixel(20),
                            padding: 10,
                            color: 'black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                        }}
                    >
                        Moderator Categories
                    </Text>
                    {categories
                        .filter((c) => c.checked)
                        .map((c) => {
                            return (
                                <TouchableOpacity
                                    key={c.value}
                                    onPress={() => {}}
                                >
                                    <Text>{c.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    <CustomButton
                        title="Add categories"
                        onPress={() => {
                            setIsModalOpen(true);
                        }}
                    />
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalOpen}
                        onRequestClose={() => {
                            setIsModalOpen(false);
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: 'white',
                                    padding: 20,
                                    margin: 20,
                                    borderRadius: 10,
                                }}
                            >
                                <Text>Selected categories to add</Text>
                                {tempCategories.map((c) => {
                                    return (
                                        <TouchableOpacity
                                            key={c.value}
                                            onPress={() => {
                                                setTempCategories((dt) => {
                                                    return dt.filter(
                                                        (t) =>
                                                            t.value != c.value
                                                    );
                                                });
                                            }}
                                        >
                                            <Text>{c.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                                <Text>Remaining Categories</Text>
                                {categories
                                    .filter((c) => !c.checked)
                                    .filter(
                                        (c) =>
                                            tempCategories.filter(
                                                (t) =>
                                                    t.value == c.value &&
                                                    t.checked
                                            ).length == 0
                                    )
                                    .map((c) => {
                                        return (
                                            <TouchableOpacity
                                                key={c.value}
                                                style={{
                                                    padding: 5,
                                                    backgroundColor:
                                                        'lightgray',
                                                    margin: 2,
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                }}
                                                onPress={() => {
                                                    setTempCategories((dt) => {
                                                        return [
                                                            ...dt,
                                                            {
                                                                ...c,
                                                                checked: true,
                                                            },
                                                        ];
                                                    });
                                                }}
                                            >
                                                <Text>{c.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}

                                <CustomButton
                                    title="Save"
                                    onPress={() => {
                                        setCategories((dt) => {
                                            return dt.map((cat) => {
                                                return {
                                                    ...cat,
                                                    checked:
                                                        tempCategories.find(
                                                            (c) =>
                                                                c.value ==
                                                                cat.value
                                                        )?.checked || false,
                                                };
                                            });
                                        });
                                        setIsModalOpen(false);
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                </View>
            ) : null}
            <CustomButton
                containerStyle={{ width: '50%', marginLeft: '25%' }}
                title="Save profile"
                onPress={handleSave}
            />
        </Layout>
    );
};

export { User };
