import { Image, Text, TouchableOpacity } from 'react-native';
import {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { CourseItem } from './CourseForm';
import { TextInput } from 'react-native-gesture-handler';
import constants from '../../../../constants';

export type RenderItemType = RenderItemParams<CourseItem> & {
    handleChange: (index: string, value: string) => void;
    handleDelete: (index: string) => void;
};

export const DragItem = ({
    item,
    drag,
    isActive,
    handleChange,
    handleDelete,
}: RenderItemType) => {
    return (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                style={{ backgroundColor: 'red', flexDirection: 'row' }}
            >
                {item.type == 'text' ? (
                    <TextInput
                        style={{
                            width: '80%',
                            backgroundColor: 'blue',
                            color: 'white',
                        }}
                        multiline={true}
                        value={item.value}
                        onChange={(e) =>
                            handleChange(item.id, e.nativeEvent.text)
                        }
                    />
                ) : (
                    <Image
                        style={{ width: '80%', height: 300 }}
                        resizeMethod="resize"
                        source={{
                            uri: (item.value as string).includes(
                                'files/courses/'
                            )
                                ? constants.url + '/' + item.value
                                : item.value,
                        }}
                    />
                )}
                <TouchableOpacity
                    style={{
                        backgroundColor: 'white',
                        width: '20%',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                    onLongPress={drag}
                    onPress={() => {
                        handleDelete(item.id);
                    }}
                >
                    <Text>Delete</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </ScaleDecorator>
    );
};
