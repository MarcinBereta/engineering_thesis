import {View } from 'react-native';
import { Navbar, NavigationType } from './Navbar';

export const Layout = (props:{
    children:React.ReactNode[] | React.ReactNode,
    navigation:NavigationType,
    icon:string 
})=>{
    return (
        <View style={{display:'flex', flexDirection: 'column'}}>
            <View style={{height:'90%'}}>
                {props.children}
            </View>
            <Navbar icon={props.icon} navigation={props.navigation}/>
        </View>
    )
}