import { useContext, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { DragItem } from './CourseDragItem';
import { TextInput } from 'react-native-gesture-handler';
import {
    addPhotos,
    addCourseGQL,
    courseFragment,
} from '../../../services/courses/courses';
import { AuthContext } from '../../../contexts/AuthContext';
import DocumentPicker from 'react-native-document-picker';
import { fontPixel } from '../../../utils/Normalize';
import RNPickerSelect from 'react-native-picker-select';
import { graphqlURL } from '@/services/settings';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import { ResultOf, VariablesOf, readFragment } from '@/graphql';
import { Dialog } from '@rneui/themed';
import { Layout } from '@/components/Layout';
import { CustomButton } from '@/components/CustomButton';
import { useTranslation } from 'react-i18next';
import { AuthenticatedRootStackParamList } from '@/screens/Navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
const { height } = Dimensions.get('window');
export type CourseItem = {
    type: 'text' | 'photo';
    value: string;
    id: string;
    imageType?: string;
};

const generateRandomId = () => {
    return Math.random().toString(36).substring(7);
};
export type addCourseDto = VariablesOf<typeof addCourseGQL>;
export type AppFile = File & {
    uri: string;
};
type CourseForm = NativeStackScreenProps<
    AuthenticatedRootStackParamList,
    'createCourse'
>;

export const CourseForm = (props: CourseForm) => {
    const { t } = useTranslation();
    const { userInfo } = useContext(AuthContext);
    const [dragData, setData] = useState<CourseItem[]>([]);
    const [courseName, setCourseName] = useState<string>('');
    const [items, setItems] = useState<AppFile[]>([]);
    const [category, setCategory] = useState('');
    const [isCreateButtonDisabled, setIsCreateButtonDisabled] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTextFormOpen, setIsTextFormOpen] = useState(false);
    const [textForm, setTextForm] = useState('');
    const [language, setLanguage] = useState('en');
    const addCourseMutation = useMutation({
        mutationFn: async (data: addCourseDto) =>
            request(graphqlURL, addCourseGQL, data, {
                Authorization: 'Bearer ' + userInfo?.token,
            }),
        onSuccess: (data, variables, context) => {
            const course = readFragment(courseFragment, data.addCourse);

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
            console.log(items);
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
        setIsDialogOpen(false);
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
                    value: item.imageType || '',
                };
            }
        });
        return {
            name: courseName,
            text: data,
            category: category,
            language: language,
        };
    };
    const handleCategoryChange = (value: string) => {
        setCategory(value);
        setIsCreateButtonDisabled(value === 'Choose category');
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
        if (photosToUpload.length > 0) {
            const newPhotos = [];
            for (let i in dragData) {
                const photo = dragData[i];
                for (let it of items) {
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
                props.navigation.push('CoursesList');
            }
        } else {
            props.navigation.push('CoursesList');
        }
    };

    const uploadCourse = async () => {
        addCourseMutation.mutate({
            CourseInput: parseData(),
        });
    };

    return (
        <Layout navigation={props.navigation} icon="course">
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <Text
                    style={{
                        fontSize: fontPixel(30),
                        textAlign: 'center',
                    }}
                >
                    {t('create_new_course')}
                </Text>
                <Text style={{ textAlign: 'center', color: 'gray' }}>
                    {t('course_create_description')}
                </Text>
                <TextInput
                    style={{ fontSize: fontPixel(30), textAlign: 'center' }}
                    placeholder={t('course_name')}
                    value={courseName}
                    onChangeText={(text) => setCourseName(text)}
                />
                <Text>{t('category')}</Text>
                <RNPickerSelect
                    onValueChange={handleCategoryChange}
                    items={[
                        { label: t('MATH'), value: 'MATH' },
                        { label: t('SCIENCE'), value: 'SCIENCE' },
                        { label: t('HISTORY'), value: 'HISTORY' },
                        { label: t('GEOGRAPHY'), value: 'GEOGRAPHY' },
                        { label: t('ENGLISH'), value: 'ENGLISH' },
                        { label: t('ART'), value: 'ART' },
                        { label: t('MUSIC'), value: 'MUSIC' },
                        { label: t('SPORTS'), value: 'SPORTS' },
                        { label: t('OTHER'), value: 'OTHER' },
                        { label: t('Choose category'), value: '' },
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
                    keyExtractor={(item, index) =>
                        `item-${item.type} - ${index}`
                    }
                    onDragEnd={({ data }) => setData(data)}
                    scrollEnabled={true}
                    style={{ flexDirection: 'column', maxHeight: height * 0.6 }}
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

                <View
                    style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        flexDirection: 'row',
                        padding: 5,
                        marginVertical: 5,
                    }}
                >
                    <CustomButton
                        onPress={() => {
                            setIsDialogOpen(!isDialogOpen);
                        }}
                        title={t('add_new_field')}
                    />

                    <CustomButton
                        onPress={() => {
                            if (!isCreateButtonDisabled) {
                                uploadCourse();
                            }
                        }}
                        title="Create"
                        disabled={isCreateButtonDisabled}
                    />
                </View>
            </View>
        </Layout>
    );
};
