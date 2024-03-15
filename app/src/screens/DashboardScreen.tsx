import { View, Text, Button } from "react-native"
import { AuthContext } from "../contexts/AuthContext"
import { useContext } from "react"

const DashboardScreen = (props:any)=>{
    const {logout, userInfo} = useContext(AuthContext)
    
    return <View>
        <Text>Dashboard Screen</Text>
        <Button title="Logout" onPress={()=>{
            logout()
        }} />
    </View>
}

export {DashboardScreen}