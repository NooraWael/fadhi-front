import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useThemeColor';

export default function AuthLayout() {
  const theme = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right', // Smooth transition between auth screens
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          headerShown: false,
          title: 'Sign In',
          gestureEnabled: true, 
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{
          headerShown: false,
          title: 'Sign Up',
          gestureEnabled: true, 
        }} 
      />
   
    </Stack>
  );
}