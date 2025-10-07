const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add CSS support for NativeWind
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  compress: {
    drop_console: false,
  },
};

// Deshabilitar package exports para evitar problemas con Firebase Auth en React Native
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

