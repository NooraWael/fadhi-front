/**
 * Colors for the فاضي؟ app
 * Based on Persian carpet color palette
 */

export const Colors = {
  light: {
    // Persian carpet inspired - Light mode
    background: '#FAF7F0',      // Cream background
    text: '#8B1538',            // Deep burgundy text
    primary: '#C41E3A',         // Rich red primary
    accent: '#D4AF37',          // Gold accent
    secondary: '#F5F0E8',       // Soft beige secondary
    inputBg: '#FFFFFF',         // White input background
    inputBorder: '#E8B4A0',     // Rose gold border
    card: '#FFFFFF',            // Card background
    border: '#E8B4A0',          // Border color
    notification: '#C41E3A',    // Notification color
    // Additional UI colors
    success: '#228B22',
    warning: '#FF8C42',
    error: '#DC143C',
    disabled: '#A0A0A0',
    placeholder: '#8B153880',   // 50% opacity burgundy
  },
  dark: {
    // Persian carpet inspired - Dark mode
    background: '#2D0A0F',      // Deep burgundy background
    text: '#FAF7F0',            // Cream text
    primary: '#E63946',         // Bright red primary
    accent: '#FFD700',          // Warm gold accent
    secondary: '#4A1520',       // Dark red secondary
    inputBg: '#3D1520',         // Dark input background
    inputBorder: '#8B1538',     // Burgundy border
    card: '#3D1520',            // Card background
    border: '#8B1538',          // Border color
    notification: '#E63946',    // Notification color
    // Additional UI colors
    success: '#00FF7F',
    warning: '#FFA500',
    error: '#FF6B6B',
    disabled: '#666666',
    placeholder: '#FAF7F080',   // 50% opacity cream
  },
};

export type Theme = typeof Colors.light;