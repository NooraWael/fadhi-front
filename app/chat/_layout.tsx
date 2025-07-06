import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useThemeColor';

export default function AuthLayout() {
  const theme = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',

      }}
    >
         <Stack.Screen 
        name="[id]" 
        options={{
          headerShown: false,
          title: 'Sign Up',
          gestureEnabled: true, 
        }} 
      />
  
   
    </Stack>
  );
}