// react-native.config.js
// 临时禁用与 RN 0.76 不兼容的包

module.exports = {
  dependencies: {
    'react-native-sms': {
      platforms: {
        android: null, // 禁用 Android 自动链接
      },
    },
    'react-native-system-setting': {
      platforms: {
        android: null,
      },
    },
    'react-native-track-player': {
      platforms: {
        android: null,
      },
    },
    'react-native-vision-camera': {
      platforms: {
        android: null,
      },
    },
    'react-native-share': {
      platforms: {
        android: null,
      },
    },
  },
};
