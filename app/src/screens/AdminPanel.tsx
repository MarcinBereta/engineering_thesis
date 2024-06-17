import { View, Text, Button } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import { fontPixel } from '../utils/Normalize';

const AdminPanel = (props: any) => {
    const { userInfo } = useContext(AuthContext);

    return (
        <View style={{ flexDirection: 'column', flex: 1 }}>
            <Text
                style={{
                    fontSize: fontPixel(20),
                    padding: 10,
                    color: 'black',
                }}
            >
                Hello {userInfo?.username}!
            </Text>
            <Button
                title="User list"
                onPress={() => {
                    props.navigation.push('UserList');
                }}
            />
        </View>
    );
};

export { AdminPanel };
