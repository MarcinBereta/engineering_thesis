import React from 'react';
import { View, Button, Text } from 'react-native';

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
    const maxPages = Math.max(Math.ceil(count / pageSize),1);
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <Button
                title="Previous"
                onPress={() => {
                    changePage(currentPage - 1);
                }}
                disabled={currentPage === 1}
            />
            <Text>
                {currentPage} / {maxPages}
            </Text>
            <Button
                title="Next"
                onPress={() => {
                    changePage(currentPage + 1);
                }}
                disabled={currentPage === maxPages}
            />
        </View>
    );
};
