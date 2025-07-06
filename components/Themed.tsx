/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';
import { useTheme } from '@/hooks/useThemeColor';

export type TextProps = DefaultText['props'] & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export type ViewProps = DefaultView['props'] & {
  lightColor?: string;
  darkColor?: string;
};

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, type = 'default', ...otherProps } = props;
  const theme = useTheme();
  
  const color = lightColor || darkColor ? (
    theme.text === '#FAF7F0' ? darkColor : lightColor
  ) : theme.text;

  return (
    <DefaultText
      style={[
        { color },
        type === 'default' ? { fontSize: 16 } : {},
        type === 'title' ? { fontSize: 32, fontWeight: 'bold' } : {},
        type === 'defaultSemiBold' ? { fontSize: 16, fontWeight: '600' } : {},
        type === 'subtitle' ? { fontSize: 20, fontWeight: '600' } : {},
        type === 'link' ? { fontSize: 16, color: theme.primary } : {},
        style,
      ]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const theme = useTheme();
  
  const backgroundColor = lightColor || darkColor ? (
    theme.background === '#2D0A0F' ? darkColor : lightColor
  ) : theme.background;

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}