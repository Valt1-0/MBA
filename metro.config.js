const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const withStorybook = require('@storybook/react-native/metro/withStorybook');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Combiner les deux configurations
const configWithStorybook = withStorybook(config);
const configWithAll = withNativeWind(configWithStorybook, { input: './global.css' });

module.exports = configWithAll;