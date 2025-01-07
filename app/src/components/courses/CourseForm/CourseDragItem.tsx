import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { CourseItem } from './CourseForm';
import { TextInput } from 'react-native-gesture-handler';
import constants from '../../../../constants';
import { useState } from 'react';
import { Button, Dialog } from '@rneui/themed';
import { fontPixel } from '@/utils/Normalize';
import { CustomButton } from '@/components/CustomButton';

const {height} = Dimensions.get('window')

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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [textForm, setTextForm] = useState(item.value);
    console.log(item.type)
    return (
        <ScaleDecorator>
            <TouchableOpacity
                onPress={() => {
                    setIsDialogOpen(true);
                }}
                onLongPress={drag}
                disabled={isActive}
                style={{
                    flexDirection: 'row',
                    padding: 2,
                    borderColor: 'black',
                    borderWidth: 1,
                    marginHorizontal:5
                }}
            >
                {item.type == 'text' ? (
                    <Text
                        style={{
                            width: '100%',
                            color: 'black',
                        }}
                    >
                        {item.value}
                    </Text>
                ) : (
                    <Image
                        style={{ width: '100%', height: 300 }}
                        // resizeMethod="resize"
                        resizeMode='contain'
                        source={{
                            uri: (item.value as string).includes(
                                'files/courses/'
                            )
                                ? constants.url + '/' + item.value
                                : item.value,
                        }}
                    />
                )}
            </TouchableOpacity>
            <Dialog
                isVisible={isDialogOpen}
                onBackdropPress={() => setIsDialogOpen(false)}
                onPressOut={() => setIsDialogOpen(false)}
            >
                <Dialog.Title title="Edit item" titleStyle={{textAlign:'center'}} />
                {item.type==="text"?<TextInput
                    value={textForm}
                    onChangeText={(text) => setTextForm(text)}
                    style={{ fontSize: fontPixel(30), textAlign: 'center', maxHeight:height*0.6 }}
                    placeholder="Text"
                    multiline={true}
                />:null}
                <View style={{display:'flex', flexDirection: 'row', justifyContent:'space-around'}}>
                    {item.type==="text"?<CustomButton
                        onPress={() => {
                            handleChange(item.id, textForm);
                            setIsDialogOpen(false);
                        }}
                        title="Save"
                    />:null}
                    <CustomButton
                        onPress={() => {
                            handleDelete(item.id);
                            setIsDialogOpen(false);
                        }}
                        title="Delete item"
                    />
                </View>
            </Dialog>
        </ScaleDecorator>
    );
};
