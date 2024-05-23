import {io} from 'socket.io-client';
import constants from './constants';
import {Navigator} from './src/screens/Navigator';
import {AuthProvider} from './src/contexts/AuthContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
const queryClient = new QueryClient();

export default function App() {
  const socket = io(constants.url, {autoConnect: false});

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Navigator socket={socket} />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
