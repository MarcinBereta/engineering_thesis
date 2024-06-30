import { AuthContext } from "@/contexts/AuthContext"
import { useContext } from "react"
import { View } from "react-native"
import { Icon } from '@rneui/themed';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";

export type NavigationType = NativeStackScreenProps<ParamListBase>['navigation']
export const Navbar = ({icon, navigation}:{icon:string, navigation:NavigationType})=>{
    const {userInfo} = useContext(AuthContext)
    if(!userInfo) return null

    const handlePress = (destination:string)=>{
        navigation.navigate(destination)
    }

    return <View style={{
        height:'10%',
        flexDirection:'row',
        justifyContent:'space-around',
    }}>
        <Icon type="font-awesome" raised onPress={handlePress.bind('','DashboardScreen')} name="home" size={30} color={icon == "home" ? "#F00":"#000"} />
        <Icon type="font-awesome" raised onPress={handlePress.bind('','CoursesList')} name="book" size={30} color={icon == "course" ? "#F00":"#000"} />
        <Icon type="font-awesome" raised onPress={handlePress.bind('','QuizesLists')} name="gamepad" size={30} color={icon == "quiz" ? "#F00":"#000"} />
        {userInfo.role == "ADMIN" || userInfo.role == "MODERATOR" ?<Icon raised type="font-awesome" onPress={handlePress.bind('','AdminPanel')} name="fa-book" size={30} color={icon == "admin" ? "#F00":"#000"} />:null }

    </View>
}