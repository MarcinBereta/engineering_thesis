import { Button, ButtonProps } from '@rneui/themed';
import React from 'react';

export const CustomButton = (props:ButtonProps) => {
    return (
        <Button
            {...props}
            iconContainerStyle={{ marginRight: 10 }}
            titleStyle={{ fontWeight: '700' }}
            buttonStyle={{
                backgroundColor: 'rgba(90, 154, 230, 1)',
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 30,
            }}
        />
    );
};
