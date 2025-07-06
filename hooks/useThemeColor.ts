import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function useTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  return Colors[colorScheme];
}