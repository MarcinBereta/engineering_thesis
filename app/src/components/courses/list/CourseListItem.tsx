import { NavigationType } from '@/components/Navbar';
import { Course } from '@/screens/CoursesList';
import { Card, Text } from '@rneui/themed';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

export const CourseListItem = ({
    course,
    navigation,
    children
}: {
    course: Course;
    navigation: NavigationType;
    children?:React.ReactNode | React.ReactNode[]
}) => {
    return (
        <TouchableOpacity
            onPress={() => {
                navigation.push('course', {
                    course: course,
                });
            }}
        >
            <Card
                containerStyle={{
                    margin: 10,
                    padding: 10,
                    borderRadius: 10,
                }}
            >
                <Card.Title>{course.name}</Card.Title>
                <Card.Divider width={2} />
                <Text style={{marginVertical:10}}>{course.summary}</Text>
                {children}
            </Card>
        </TouchableOpacity>
    );
};
