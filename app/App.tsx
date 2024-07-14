import { Navigator } from './src/screens/Navigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketHandler } from '@/contexts/SocketHandler';
import '@/services/i18next';

const queryClient = new QueryClient();

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <SocketHandler />
                    <Navigator />
                </AuthProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
