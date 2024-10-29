import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CustomButton } from '@/components/CustomButton';
import { fontPixel, heightPixel } from '@/utils/Normalize';

export const CategorySelection = ({
    selectedCategory,
    setSelectedCategory,
}: {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
}) => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
            }}
        >
            <View
                style={{
                    width: '90%',
                    flexDirection: 'column',
                    left: '5%',
                    height: heightPixel(300),
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    borderRadius: fontPixel(20),
                }}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>{t('select_category')}</Text>
                    <Picker
                        selectedValue={selectedCategory}
                        style={styles.picker}
                        onValueChange={(itemValue) =>
                            setSelectedCategory(itemValue)
                        }
                    >
                        <Picker.Item label={t('all')} value="" />
                        <Picker.Item label={t('HISTORY')} value="HISTORY" />
                        <Picker.Item label={t('MUSIC')} value="MUSIC" />
                        <Picker.Item label={t('SCIENCE')} value="SCIENCE" />
                        <Picker.Item label={t('MATH')} value="MATH" />
                        <Picker.Item label={t('ART')} value="ART" />
                        <Picker.Item label={t('ENGLISH')} value="ENGLISH" />
                        <Picker.Item label={t('GEOGRAPHY')} value="GEOGRAPHY" />
                        <Picker.Item label={t('SPORTS')} value="SPORTS" />
                        <Picker.Item label={t('OTHER')} value="OTHER" />
                    </Picker>
                    <CustomButton
                        title={t('select')}
                        onPress={() => {
                            setSelectedCategory(selectedCategory);
                            navigation.goBack();
                        }}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    picker: {
        width: '100%',
        backgroundColor: 'white',
        color: 'black',
        padding: 10,
        margin: 10,
        borderRadius: 10,
    },
});
