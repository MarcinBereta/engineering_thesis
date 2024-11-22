import { heightPixel, widthPixel } from '@/utils/Normalize';
import { Button, ButtonProps } from '@rneui/themed';
import React from 'react';
type extendedProps = ButtonProps & {
    backgroundColor?: string;
};
export const CustomButton = (props: extendedProps) => {
    return (
        <Button
            {...props}
            iconContainerStyle={{ marginRight: 10 }}
            titleStyle={{ fontWeight: '700' }}
            buttonStyle={{
                backgroundColor: props.backgroundColor
                    ? props.backgroundColor
                    : 'rgba(90, 154, 230, 1)',
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 30,
                paddingHorizontal: widthPixel(20),
                paddingVertical: heightPixel(10),
            }}
        />
    );
};
