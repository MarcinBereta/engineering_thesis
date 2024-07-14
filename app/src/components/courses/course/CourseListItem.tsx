import { Image, Text, View } from 'react-native';
import constants from '../../../../constants';
import { Card } from '@rneui/themed';
export type courseItem = {
    id: string;
    type: string;
    value: string;
};
export const CourseListItem = ({ course: item }: { course: courseItem }) => {
    return (
        <>
            <Card
                containerStyle={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {item.type == 'text' ? (
                    <Text>{item.value}</Text>
                ) : (
                    <Image
                        style={{ width: '100%', height: 300 }}
                        resizeMethod="resize"
                        source={{ uri: constants.url + '/' + item.value }}
                    />
                )}
            </Card>
            <Card.Divider />
        </>
    );
};
