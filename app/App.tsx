import {io} from 'socket.io-client';
import constants from './constants';
import {Navigator} from './src/screens/Navigator';
import {AuthProvider} from './src/contexts/AuthContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export default function App() {
  const socket = io(constants.url, {autoConnect: false});

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <Navigator socket={socket} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
