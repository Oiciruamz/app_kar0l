import React from 'react';
import { TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TabIconProps {
  name: 'home' | 'calendar' | 'time' | 'person' | 'notes';
  size?: number;
  color?: string;
  onPress?: () => void;
}

export function TabIcon({ name, size = 24, color = '#000', onPress }: TabIconProps) {
  const iconPaths = {
    home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
    calendar: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z",
    time: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zM12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z",
    person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    notes: "M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
  };

  const icon = (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={iconPaths[name]} fill={color} />
    </Svg>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={{ padding: 8 }}>
        {icon}
      </TouchableOpacity>
    );
  }

  return icon;
}
