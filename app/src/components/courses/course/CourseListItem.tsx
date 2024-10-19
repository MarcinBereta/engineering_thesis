import { Dimensions, Image, Text, View } from 'react-native';
import constants from '../../../../constants';
import { Card } from '@rneui/themed';
import { fontPixel } from '@/utils/Normalize';
export type courseItem = {
    id: string;
    type: string;
    value: string;
};
const { width, } = Dimensions.get('window');
export const CourseListItem = ({ course: item }: { course: courseItem }) => {
    if (item.type != 'text') {
        console.log(constants.url + '/' + item.value);
    }
    return (
        <Card
            containerStyle={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: fontPixel(10),
                marginHorizontal: fontPixel(10),
            }}
        >
            {item.type == 'text' ? (
                <Text>{item.value}</Text>
            ) : (
                <Image
                    style={{ width: width * 0.9, height: 300 }}
                    resizeMode='stretch'
                    source={{ uri: constants.url + '/' + item.value }}
                />
            )}
        </Card>
    );
};
