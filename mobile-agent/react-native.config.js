// react-native.config.js
// 禁用与 RN 0.76 不兼容的包

module.exports = {
  dependencies: {
    // 禁用所有有自动链接问题的包
    '@react-native-async-storage/async-storage': {
      platforms: { android: null },
    },
    '@react-native-camera-roll/camera-roll': {
      platforms: { android: null },
    },
    '@react-native-community/netinfo': {
      platforms: { android: null },
    },
    'react-native-audio-recorder-player': {
      platforms: { android: null },
    },
    'react-native-background-fetch': {
      platforms: { android: null },
    },
    'react-native-contacts': {
      platforms: { android: null },
    },
    'react-native-device-info': {
      platforms: { android: null },
    },
    'react-native-fs': {
      platforms: { android: null },
    },
    'react-native-geolocation-service': {
      platforms: { android: null },
    },
    'react-native-permissions': {
      platforms: { android: null },
    },
    'react-native-send-intent': {
      platforms: { android: null },
    },
    'react-native-share': {
      platforms: { android: null },
    },
    'react-native-sms': {
      platforms: { android: null },
    },
    'react-native-system-setting': {
      platforms: { android: null },
    },
    'react-native-track-player': {
      platforms: { android: null },
    },
    'react-native-vision-camera': {
      platforms: { android: null },
    },
  },
};
