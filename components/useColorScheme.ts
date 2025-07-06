import { useColorScheme as useNativeColorScheme } from 'react-native';

export function useColorScheme() {
  const nativeColorScheme = useNativeColorScheme();
  return nativeColorScheme ?? 'light';
}