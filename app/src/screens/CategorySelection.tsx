import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';


export const CategorySelection = () => {
    const route = useRoute();
    const { selectedCategory, setSelectedCategory } = route.params as { selectedCategory: string, setSelectedCategory: (category: string) => void };
    const [localCategory, setLocalCategory] = useState(selectedCategory);
    const navigation = useNavigation();
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('select_category')}</Text>
            <Picker
                selectedValue={localCategory}
                style={styles.picker}
                onValueChange={(itemValue) => setLocalCategory(itemValue)}
            >
                <Picker.Item label={t("all")} value="" />
                <Picker.Item label={t("HISTORY")} value="HISTORY" />
                <Picker.Item label={t("MUSIC")} value="MUSIC" />
                <Picker.Item label={t("SCIENCE")} value="SCIENCE" />
                <Picker.Item label={t("MATH")} value="MATH" />
                <Picker.Item label={t("ART")} value="ART" />
                <Picker.Item label={t("ENGLISH")} value="ENGLISH" />
                <Picker.Item label={t("GEOGRAPHY")} value="GEOGRAPHY" />
                <Picker.Item label={t("SPORTS")} value="SPORTS" />
                <Picker.Item label={t("OTHER")} value="OTHER" />
            </Picker>
            <Button
                title={t("select")}
                onPress={() => {
                    setSelectedCategory(localCategory);
                    navigation.goBack();
                }}
            />
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