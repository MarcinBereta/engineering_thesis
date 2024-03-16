import { io } from 'socket.io-client';
import constants from './constants';
import { Navigator } from './src/screens/Navigator';
import { AuthProvider } from './src/contexts/AuthContext'

export default function App() {
  const socket = io(constants.url, { autoConnect: false })

  return (
    <AuthProvider>
      <Navigator socket={socket} />      
    </AuthProvider>
  );
}
