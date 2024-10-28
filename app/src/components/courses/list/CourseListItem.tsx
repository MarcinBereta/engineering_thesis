import { NavigationType } from '@/components/Navbar';
import { Course } from '@/screens/CoursesList';
import { getUserScoreGQL } from '@/services/quiz/quiz';
import { Card, Icon, Text } from '@rneui/themed';
import { ResultOf } from 'gql.tada';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

export const CourseListItem = ({
    course,
    navigation,
    children,
    userScore,
}: {
    course: Course;
    navigation: NavigationType;
    children?: React.ReactNode | React.ReactNode[]
    userScore: ResultOf<typeof getUserScoreGQL>['getUserScore'];
}) => {
    // const hasCompletedQuiz = (courseName: string) => {
    //     if (userScore === undefined) {
    //         return false;
    //     }
    //     return userScore.some((score) => score.quizName === courseName) || false;
    // };
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
                <Card.Title>{course.name}
                    {/* {hasCompletedQuiz(course.name) && 
                    (
                        <Icon
                            type="font-awesome"
                            name="check"
                            size={15}
                            color="green"
                        />
                    )} */}
                </Card.Title>
                <Card.Divider width={2} />
                <Text style={{ marginVertical: 10 }}>{course.summary}</Text>
                {children}
            </Card>
        </TouchableOpacity>
    );
};
