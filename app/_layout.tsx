import { Stack } from 'expo-router';
import { AppProvider } from '@/contexts/AppContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="add-expense" 
          options={{ 
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="add-operation" 
          options={{ 
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="expense-detail" 
          options={{ 
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="subscription" 
          options={{ 
            presentation: 'modal',
          }} 
        />
      </Stack>
    </AppProvider>
  );
}
