import { useContext, useState } from 'react';
import { Alert, Button, Dimensions, FlatList, Text, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { DragItem } from './CourseDragItem';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import {
    addPhotos,
    courseFragment,
    editCourseGQL,
} from '../../../services/courses/courses';
import { AuthContext } from '../../../contexts/AuthContext';
import DocumentPicker from 'react-native-document-picker';
import { fontPixel } from '../../../utils/Normalize';
import RNPickerSelect from 'react-native-picker-select';
import { graphqlURL } from '@/services/settings';
import { useMutation } from '@tanstack/react-query';
import { ResultOf, VariablesOf, readFragment } from '@/graphql';
import request from 'graphql-request';
import { AppFile } from './CourseForm';
import { Dialog } from '@rneui/themed';
import { CustomButton } from '@/components/CustomButton';
import { useTranslation } from 'react-i18next';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
const { height } = Dimensions.get('window');

export type CourseItem = {
    type: string;
    value: string;
    id: string;
    imageType?: string;
};

const isCoursePossible = (data: CourseItem[]) => {
    let length = 0;
    for (let item of data) {
        if (item.type === 'text') {
            length += item.value.length;
        } else {
            length += 1;
        }
    }
    return length < 3000;
}

const generateRandomId = () => {
    return Math.random().toString(36).substring(7);
};
export type editCourseDto = VariablesOf<typeof editCourseGQL>;
type EditCourse = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'EditCourse'
>;
export const CourseEditForm = ({ route, navigation }: EditCourse) => {
    const { t } = useTranslation();
    const { course } = route.params;

    const { userInfo } = useContext(AuthContext);
    const [dragData, setData] = useState<CourseItem[]>(course.text);
    const [courseName, setCourseName] = useState<string>(course.name);
    const [category, setCategory] = useState(course.category);
    const [items, setItems] = useState<AppFile[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTextFormOpen, setIsTextFormOpen] = useState(false);
    const [textForm, setTextForm] = useState('');
    const [language, setLanguage] = useState(course.language);

    const editCourseMutation = useMutation({
        mutationFn: async (data: editCourseDto) =>
            request(graphqlURL, editCourseGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: (data, variables, context) => {
            const course = readFragment(courseFragment, data.editCourse);
            uploadPhotos(course);
        },
    });

    const updateItemValue = (index: string, value: string) => {
        const newData = dragData.map((item) => {
            if (item.id === index) {
                return {
                    ...item,
                    value: value,
                };
            }
            return item;
        });
        setData(newData);
    };

    const deleteItem = (index: string) => {
        const item = dragData.find((item) => item.id === index);
        if (item?.type === 'photo') {
            //@ts-ignore
            const newItems = items.filter(
                (itemik) => itemik.uri !== item.value
            );
            setItems(newItems);
        }
        const newData = dragData.filter((item) => item.id !== index);
        setData(newData);
    };

    const uploadFile = async () => {
        const res: any = await DocumentPicker.pick({
            type: [DocumentPicker.types.images],
        });
        const id = generateRandomId();
        setData([
            ...dragData,
            {
                id: id,
                type: 'photo',
                value: res[0].uri as string,
                imageType: res[0].name.split('.')[1],
            },
        ]);
        setItems([...items, res[0]]);
    };

    const parseData = () => {
        const data = dragData.map((item) => {
            if (item.type === 'text') {
                return {
                    id: item.id,
                    type: item.type,
                    value: item.value,
                };
            } else {
                return {
                    id: item.id,
                    type: item.type,
                    value: (item.value as string).includes('files/courses/')
                        ? item.value
                        : item.imageType || '',
                };
            }
        });
        return {
            name: courseName,
            text: data,
            id: course.id,
            category: category,
            language: language,
        };
    };

    const uploadPhotos = async (course: ResultOf<typeof courseFragment>) => {
        const photosToUpload: File[] = [];
        for (let item of dragData) {
            if (item.type === 'photo') {
                //@ts-ignore
                const photo: File = items.filter(
                    (itemik) => itemik.uri == item.value
                );
                photosToUpload.push(photo);
            }
        }
        const newPhotos = [];
        for (let i in dragData) {
            const photo = dragData[i];
            for (let it of items) {
                //@ts-ignore
                if (photo.value == it.uri) {
                    //@ts-ignore
                    const ending = it.type.split('/')[1];
                    it.name = `${course.text[i].id}.${ending}`;
                    newPhotos.push(it);
                }
            }
        }
        const res: any = await addPhotos(newPhotos, course.id);
        if (res.status == 201) {
            navigation.push('CoursesList');
        }
    };

    const uploadCourse = async () => {
        if (!isCoursePossible(dragData)) {
            Alert.alert(t('error'), t('course_is_too_long'));
            return
        }
        editCourseMutation.mutate({
            EditCourseInput: parseData(),
        });
    };

    return (
        <ScrollView style={{ flex: 1, flexDirection: 'column' }}>
            <Text
                style={{
                    fontSize: fontPixel(30),
                    textAlign: 'center',
                }}
            >
                {t('edit_course')}
            </Text>
            <Text style={{ textAlign: 'center', color: 'gray' }}>
                {t('course_create_description')}
            </Text>
            <TextInput
                style={{ fontSize: fontPixel(30), textAlign: 'center' }}
                placeholder="Course Name"
                value={courseName}
                onChangeText={(text) => setCourseName(text)}
            />
            <Text>{t('category')}</Text>
            <RNPickerSelect
                onValueChange={(value) => {
                    setCategory(value);
                }}
                items={[
                    { label: t('MATH'), value: 'MATH' },
                    { label: t('SCIENCE'), value: 'SCIENCE' },
                    { label: t('HISTORY'), value: 'HISTORY' },
                    { label: t('GEOGRAPHY'), value: 'GEOGRAPHY' },
                    { label: t('ENGLISH'), value: 'ENGLISH' },
                    { label: t('ART'), value: 'ART' },
                    { label: t('MUSIC'), value: 'MUSIC' },
                    { label: t('SPORTS'), value: 'SPORTS' },
                    { label: t('OTHER'), value: '' },
                ]}
                value={category}
            />
            <Text>{t('language')}</Text>
            <RNPickerSelect
                onValueChange={(value) => {
                    setLanguage(value);
                }}
                items={[
                    { label: t('English'), value: 'en' },
                    { label: t('Polish'), value: 'pl' },
                    { label: t('Spanish'), value: 'es' },
                    { label: t('France'), value: 'fr' },
                    { label: t('German'), value: 'de' },
                ]}
                value={language}
            />
            <DraggableFlatList
                data={dragData}
                keyExtractor={(item, index) => `item-${item.type} - ${index}`}
                onDragEnd={({ data }) => setData(data)}
                scrollEnabled={true}
                style={{ flexDirection: 'column', maxHeight: height * 0.5 }}
                renderItem={(params: {
                    item: any;
                    getIndex: () => number | undefined;
                    drag: () => void;
                    isActive: boolean;
                }) => {
                    return (
                        <DragItem
                            {...params}
                            handleChange={updateItemValue}
                            handleDelete={deleteItem}
                        />
                    );
                }}
            />
            <CustomButton
                onPress={() => {
                    setIsDialogOpen(!isDialogOpen);
                }}
                title="Add new field"
            />
            <Dialog
                isVisible={isDialogOpen}
                onDismiss={() => setIsDialogOpen(false)}
                overlayStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                }}
                onPressOut={() => {
                    setIsDialogOpen(false);
                }}
            >
                <Dialog.Title
                    title={t('add_new_field')}
                    titleStyle={{ textAlign: 'center' }}
                />
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                    }}
                >
                    <CustomButton
                        onPress={() => {
                            uploadFile();
                        }}
                        title={t('add_photo')}
                    />
                    <CustomButton
                        onPress={() => {
                            setIsDialogOpen(false);
                            setIsTextFormOpen(true);
                            setTextForm('');
                        }}
                        title={t('add_text')}
                    />
                </View>
            </Dialog>

            <Dialog
                isVisible={isTextFormOpen}
                onDismiss={() => setIsTextFormOpen(false)}
                onPressOut={() => {
                    setIsTextFormOpen(false);
                }}
            >
                <TextInput
                    value={textForm}
                    onChangeText={(text) => setTextForm(text)}
                    style={{
                        fontSize: fontPixel(30),
                        textAlign: 'center',
                        maxHeight: height * 0.6,
                    }}
                    placeholder={t('add_your_text_here')}
                    multiline={true}
                />
                <CustomButton
                    onPress={() => {
                        if (textForm.length > 0)
                            setData([
                                ...dragData,
                                {
                                    id: generateRandomId(),
                                    type: 'text',
                                    value: textForm,
                                },
                            ]);
                        setIsTextFormOpen(false);
                    }}
                    title={t('add')}
                />
            </Dialog>
            <View style={{ height: 10 }} />
            <CustomButton
                onPress={() => {
                    uploadCourse();
                }}
                title={t('edit_course')}
            />
        </ScrollView>
    );
};
