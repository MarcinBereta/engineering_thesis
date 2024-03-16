import { useContext, useState } from "react"
import { View, Text, TextInput, StyleSheet, Button } from "react-native"
import { AuthContext } from "../contexts/AuthContext"
import { GoogleSigninButton} from '@react-native-google-signin/google-signin'
const styles=  StyleSheet.create({
    textInput:{
        backgroundColor:'white',
        width:'80%',
        padding:10,
        borderRadius:15,
        marginBottom:10
    }
})

const LoginScreen = (props:any)=>{
    const authContext= useContext(AuthContext)
    const [loginForm, setLoginForm] = useState({
        username:'',
        password:'',
    
    })

    return <View
        style={{flex:1,justifyContent:'center',alignItems:'center', backgroundColor:'blue'}}
    >
        <View style={{backgroundColor:'yellow', flex:1, flexDirection:'column', width:'100%', alignItems:'center'}}>
            <Text>Login form</Text>
            <TextInput style={styles.textInput} placeholder="Username" value={loginForm.username} onChange={
                (e)=>{
                    setLoginForm({...loginForm, username:e.nativeEvent.text})
                }
            
            } />
            <TextInput style={styles.textInput} placeholder="password"
            value={loginForm.password} onChange={
                (e)=>{
                    setLoginForm({...loginForm, password:e.nativeEvent.text})
                }
            }
            />

            <Button title="Login" onPress={()=>{
                authContext.login("credentials", loginForm.username, loginForm.password)
            }} />
            <GoogleSigninButton
                style={{ width: 192, height: 48 }}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => authContext.login("google", "", "")}
            />
            <Button title="Register" onPress={()=>{
                props.navigation.navigate('RegisterScreen')
            }} />
        </View>
    </View>
}

export {LoginScreen}