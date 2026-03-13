/**
 * ActionExecutor - 执行设备操作
 * 处理所有来自 OpenClaw 的指令
 */

import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-sms';
import Contacts from 'react-native-contacts';
import Geolocation from 'react-native-geolocation-service';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

export class ActionExecutor {
  constructor() {
    this.permissionCache = new Map();
  }

  async execute(command) {
    const { type, payload } = command;

    switch (type) {
      case 'PING':
        return { pong: true, timestamp: Date.now() };

      case 'SMS_READ':
        return await this.readSMS(payload);

      case 'SMS_SEND':
        return await this.sendSMS(payload);

      case 'CONTACTS_READ':
        return await this.readContacts(payload);

      case 'LOCATION_GET':
        return await this.getLocation(payload);

      case 'CAMERA_CAPTURE':
        return await this.capturePhoto(payload);

      case 'SCREENSHOT':
        return await this.takeScreenshot(payload);

      case 'BROWSER_OPEN':
        return await this.openBrowser(payload);

      case 'NOTIFICATION_SHOW':
        return await this.showNotification(payload);

      case 'SYSTEM_INFO':
        return await this.getSystemInfo(payload);

      case 'FILE_LIST':
        return await this.listFiles(payload);

      case 'FILE_READ':
        return await this.readFile(payload);

      default:
        throw new Error(`未支持的指令类型: ${type}`);
    }
  }

  // 读取短信
  async readSMS(payload) {
    await this.requestSMSPermission();
    
    // Android 使用 ContentResolver 读取短信
    // 这里使用简化实现
    if (Platform.OS === 'android') {
      // 实际实现需要原生模块
      return {
        messages: [
          { id: '1', address: '10086', body: '您的余额为 50.00 元', date: Date.now() },
          { id: '2', address: '支付宝', body: '验证码 123456', date: Date.now() - 60000 },
        ],
        note: '这是模拟数据，实际需要从原生模块获取',
      };
    }
    
    return { messages: [], note: 'iOS 不支持读取短信' };
  }

  // 发送短信
  async sendSMS(payload) {
    const { number, message } = payload;
    
    return new Promise((resolve, reject) => {
      SmsAndroid.autoSend(
        number,
        message,
        (fail) => {
          reject(new Error(`发送失败: ${fail}`));
        },
        (success) => {
          resolve({ success: true, messageId: success });
        }
      );
    });
  }

  // 读取通讯录
  async readContacts(payload) {
    await this.requestContactPermission();
    
    const contacts = await Contacts.getAll();
    
    return {
      contacts: contacts.map(c => ({
        id: c.recordID,
        name: `${c.givenName} ${c.familyName}`.trim(),
        phoneNumbers: c.phoneNumbers.map(p => p.number),
        emailAddresses: c.emailAddresses.map(e => e.email),
      })),
    };
  }

  // 获取位置
  async getLocation(payload) {
    await this.requestLocationPermission();
    
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(new Error(`定位失败: ${error.message}`));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  // 拍照
  async capturePhoto(payload) {
    // 需要打开相机界面
    // 简化实现：返回提示
    return {
      success: false,
      note: '请在App界面手动拍照',
      // 实际实现需要使用 react-native-camera 并导航到相机页面
    };
  }

  // 截图
  async takeScreenshot(payload) {
    // 需要原生模块支持
    return {
      success: false,
      note: '需要安装 react-native-screenshot 模块',
    };
  }

  // 打开浏览器
  async openBrowser(payload) {
    const { url } = payload;
    
    if (Platform.OS === 'android') {
      const intent = await import('react-native-send-intent');
      await intent.default.openAppWithData(url, 'text/html');
    } else {
      await import('react-native-safari-view');
      // SafariView.show({ url });
    }
    
    return { success: true, url };
  }

  // 显示通知
  async showNotification(payload) {
    const { title, body } = payload;
    
    // 使用 react-native-notifications
    // 简化实现
    return {
      success: true,
      note: `通知: ${title} - ${body}`,
    };
  }

  // 获取系统信息
  async getSystemInfo(payload) {
    const DeviceInfo = require('react-native-device-info').default;
    
    return {
      brand: await DeviceInfo.getBrand(),
      model: await DeviceInfo.getModel(),
      systemVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      batteryLevel: await DeviceInfo.getBatteryLevel(),
      isBatteryCharging: await DeviceInfo.isBatteryCharging(),
      freeDiskStorage: await DeviceInfo.getFreeDiskStorage(),
      totalMemory: await DeviceInfo.getTotalMemory(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: Platform.OS,
    };
  }

  // 列出文件
  async listFiles(payload) {
    const { path } = payload;
    
    return {
      path,
      files: [],
      note: '文件系统访问需要额外配置',
    };
  }

  // 读取文件
  async readFile(payload) {
    const { path } = payload;
    
    return {
      path,
      content: null,
      note: '文件系统访问需要额外配置',
    };
  }

  // ============ 权限请求 ============

  async requestSMSPermission() {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: '短信权限',
          message: '需要读取短信权限',
          buttonPositive: '确定',
        }
      );
      
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: '发送短信权限',
          message: '需要发送短信权限',
          buttonPositive: '确定',
        }
      );
    }
  }

  async requestContactPermission() {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: '通讯录权限',
          message: '需要读取通讯录权限',
          buttonPositive: '确定',
        }
      );
    }
  }

  async requestLocationPermission() {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '位置权限',
          message: '需要获取位置信息',
          buttonPositive: '确定',
        }
      );
    }
  }
}
