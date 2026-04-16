const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter les extensions audio/video aux assets
config.resolver.assetExts.push('mp4', 'mp3', 'wav', 'm4a');

module.exports = config;
