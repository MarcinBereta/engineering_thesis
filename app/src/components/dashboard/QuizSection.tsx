import { normalizeText } from "@rneui/base"
import { Icon } from "@rneui/themed"
import { Text, View } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"

export const DashboardQuizSection = ({navigation}:{navigation:any})=>{
    return <View style={{display: 'flex', flexDirection: 'column'}}>
        <TouchableOpacity 
            onPress={()=>{
                navigation.push('QuizzesList')
            }}
        style={{
            display: 'flex',
            flexDirection: 'row',
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: 'black'
            
        }}>
            <Text style={{fontSize:normalizeText(20), paddingRight:20}}>Featured quizes</Text>
            <Icon type="font-awesome" name="arrow-right" size={30} />
        </TouchableOpacity>
    </View>
}