import { useContext, useState } from "react"
import { View, Text, Button, TextInput, StyleSheet } from "react-native"
import { AuthContext } from "../contexts/AuthContext"
import { GoogleSigninButton } from "@react-native-google-signin/google-signin"

const styles=  StyleSheet.create({
    textInput:{
        backgroundColor:'white',
        width:'80%',
        padding:10,
        borderRadius:15,
        marginBottom:10
    }
})

const RegisterScreen = (props:any)=>{
    const authContext= useContext(AuthContext)
    const [registerForm, setRegisterForm] = useState({
        username:'',
        password:'',
        email:''
    })

    return <View
        style={{flex:1,justifyContent:'center',alignItems:'center', backgroundColor:'blue'}}
    >
        <View style={{backgroundColor:'yellow', flex:1, flexDirection:'column', width:'100%', alignItems:'center'}}>
            <Text>Login form</Text>
            <TextInput style={styles.textInput} placeholder="Username" value={registerForm.username} onChange={
                (e)=>{
                    setRegisterForm({...registerForm, username:e.nativeEvent.text})
                }
            
            } />
            <TextInput style={styles.textInput} placeholder="password"
            value={registerForm.password} onChange={
                (e)=>{
                    setRegisterForm({...registerForm, password:e.nativeEvent.text})
                }
            }
            />
            <TextInput style={styles.textInput} placeholder="email"
                        value={registerForm.email} onChange={
                            (e)=>{
                                setRegisterForm({...registerForm, email:e.nativeEvent.text})
                            }
                        }
            />
            <Button title="Register" onPress={async ()=>{
                await authContext.register("credentials", registerForm.username, registerForm.email, registerForm.password)
                }} />

            <GoogleSigninButton
                style={{ width: 192, height: 48 }}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => authContext.login("google", "", "")}
            />
            <Button title="Login" onPress={()=>{
                props.navigation.navigate('LoginScreen')
            }} />
            
        </View>
    </View>
}

export {RegisterScreen}