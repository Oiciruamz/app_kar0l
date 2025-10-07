import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Función para escalar tamaños basado en el ancho de pantalla
export const scale = (size: number): number => {
  const scale = SCREEN_WIDTH / 375; // iPhone 14 como referencia
  return Math.ceil(PixelRatio.roundToNearestPixel(size * scale));
};

// Función para escalar tamaños basado en la altura de pantalla
export const verticalScale = (size: number): number => {
  const scale = SCREEN_HEIGHT / 812; // iPhone 14 como referencia
  return Math.ceil(PixelRatio.roundToNearestPixel(size * scale));
};

// Función para escalar moderadamente (combinación de width y height)
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Función para escalar fuentes
export const scaleFont = (size: number): number => {
  const scale = SCREEN_WIDTH / 375;
  const newSize = size * scale;
  return Math.ceil(PixelRatio.roundToNearestPixel(newSize));
};

// Dimensiones de referencia
export const REFERENCE_WIDTH = 375; // iPhone 14 width
export const REFERENCE_HEIGHT = 812; // iPhone 14 height

// Función para obtener porcentaje del ancho
export const widthPercentage = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

// Función para obtener porcentaje de la altura
export const heightPercentage = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Función para detectar si es un dispositivo pequeño
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375;
};

// Función para detectar si es un dispositivo grande
export const isLargeDevice = (): boolean => {
  return SCREEN_WIDTH > 414;
};

// Función para detectar si es un iPhone
export const isIPhone = (): boolean => {
  return SCREEN_WIDTH <= 428; // iPhone 14 Pro Max es el más grande
};

// Función para detectar si es un iPad
export const isIPad = (): boolean => {
  return SCREEN_WIDTH > 428;
};
