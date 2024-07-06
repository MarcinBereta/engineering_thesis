import { Text, TouchableOpacity, View } from 'react-native';
import { getQuizzesWithPaginationGQL } from '@/services/quiz/quiz';
import { Card } from '@rneui/themed';
import { NavigationType } from '../Navbar';
import { ResultOf } from 'gql.tada';

const QuizzesListItem = ({
    navigation,
    item,
}: {
    navigation: NavigationType;
    item: ResultOf<
        typeof getQuizzesWithPaginationGQL
    >['getQuizzesWithPagination'][0];
}) => {
    return (
        <Card
            containerStyle={{
                padding: 15,
                width: '90%',
                marginLeft: '5%',
                borderRadius: 20,
            }}
        >
            <TouchableOpacity
                onPress={() => {
                    navigation.push('quiz', { quiz: item });
                }}
            >
                <Card.Title>{item.name}</Card.Title>
                <Card.Divider />
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold' }}>Course:</Text>
                        <Text> {item.course?.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold' }}>Category:</Text>
                        <Text> {item.course?.category}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Card>
    );
};

export { QuizzesListItem };
