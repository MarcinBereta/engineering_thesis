import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Button, Text, StyleSheet, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
const { height, width } = Dimensions.get('window');
export const Pagination = ({
    currentPage,
    pageSize,
    count,
    changePage,
}: {
    currentPage: number;
    pageSize: number;
    count: number;
    changePage: (page: number) => void;
}) => {
    const { t } = useTranslation();
    const maxPages = Math.max(Math.ceil(count / pageSize), 1);
    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
            }}
        >
            <TouchableOpacity
                style={{
                    backgroundColor:
                        currentPage === 1 ? 'lightgray' : 'lightblue',
                    borderRadius: width * 0.15,
                    width: width * 0.3,
                    height: width * 0.15,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={() => {
                    if (currentPage !== 1) changePage(currentPage - 1);
                }}
            >
                <Text>{t('previous')}</Text>
            </TouchableOpacity>

            <Text>
                {currentPage} / {maxPages}
            </Text>
            <TouchableOpacity
                style={{
                    backgroundColor:
                        currentPage === maxPages ? 'lightgray' : 'lightblue',
                    borderRadius: width * 0.15,
                    width: width * 0.3,
                    height: width * 0.15,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={() => {
                    if (currentPage !== maxPages) changePage(currentPage + 1);
                }}
            >
                <Text>{t('next')}</Text>
            </TouchableOpacity>
        </View>
    );
};
