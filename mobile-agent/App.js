/**
 * Mobile Agent v2.0 - 简化版
 * 移除了不兼容的原生模块
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// 模拟设备ID（使用随机数）
const generateDeviceId = () => {
  return `设备-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// 简化版 App
export default function App() {
  const [deviceId, setDeviceId] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState(['📱 Mobile Agent 已启动']);

  useEffect(() => {
    setDeviceId(generateDeviceId());
    addLog('✅ 应用初始化完成');
  }, []);

  const addLog = (message) => {
    setLogs(prev => [message, ...prev].slice(0, 50));
  };

  const connectToServer = () => {
    if (!serverUrl) {
      addLog('❌ 请输入服务器地址');
      return;
    }
    setIsConnected(true);
    addLog(`🔗 已连接到: ${serverUrl}`);
  };

  const disconnect = () => {
    setIsConnected(false);
    addLog('🔌 已断开连接');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>Mobile Agent</Text>
        <Text style={styles.subtitle}>设备ID: {deviceId}</Text>
      </View>

      {/* 连接状态 */}
      <View style={[styles.statusCard, isConnected ? styles.connected : styles.disconnected]}>
        <Text style={styles.statusText}>
          {isConnected ? '🟢 已连接' : '🔴 未连接'}
        </Text>
      </View>

      {/* 服务器配置 */}
      <View style={styles.section}>
        <Text style={styles.label}>服务器地址</Text>
        <TextInput
          style={styles.input}
          placeholder="wss://your-server.com"
          placeholderTextColor="#888"
          value={serverUrl}
          onChangeText={setServerUrl}
        />
        <TouchableOpacity
          style={[styles.button, isConnected ? styles.disconnectBtn : styles.connectBtn]}
          onPress={isConnected ? disconnect : connectToServer}
        >
          <Text style={styles.buttonText}>
            {isConnected ? '断开连接' : '连接服务器'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 日志 */}
      <View style={styles.logSection}>
        <Text style={styles.label}>运行日志</Text>
        <ScrollView style={styles.logContainer}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logItem}>{log}</Text>
          ))}
        </ScrollView>
      </View>

      {/* 版本信息 */}
      <Text style={styles.version}>v2.0.0 (Release Build)</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statusCard: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  connected: {
    backgroundColor: '#2d5a2d',
  },
  disconnected: {
    backgroundColor: '#5a2d2d',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectBtn: {
    backgroundColor: '#4a4aff',
  },
  disconnectBtn: {
    backgroundColor: '#ff4a4a',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logSection: {
    flex: 1,
  },
  logContainer: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  logItem: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  version: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
