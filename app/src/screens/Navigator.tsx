import { Socket } from "socket.io-client"
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { DashboardScreen } from "./DashboardScreen"
import { LoginScreen } from "./LoginScreen"
import { RegisterScreen } from "./RegisterScreen"
import { SplashScreen } from "./SplashScreen"
import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
// import {Stack}
const Stack = createNativeStackNavigator()

const Navigator = ({socket}:{
    socket:Socket
})=>{
  const { userInfo, splashLoading } = useContext(AuthContext)
    return <NavigationContainer>
    <Stack.Navigator>
    {splashLoading ? (
                  <Stack.Screen
                      component={SplashScreen}
                      name="SplashScreen"
                  />
              ) : userInfo != null  ? (
                  <Stack.Screen
                      component={DashboardScreen}
                      name="DashboardScreen"
                  />
              ) : (
                  <>
                      <Stack.Screen
                          component={LoginScreen}
                          name="LoginScreen"
                      />
                      <Stack.Screen
                          component={RegisterScreen}
                          name="RegisterScreen"
                      />
                  </>
              )}
    </Stack.Navigator>
  </NavigationContainer>
}

export {Navigator}