import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

// WebSocket 服务
class AgentService {
  constructor(config) {
    this.serverUrl = config.serverUrl;
    this.deviceId = config.deviceId;
    this.onConnect = config.onConnect || (() => {});
    this.onDisconnect = config.onDisconnect || (() => {});
    this.onMessage = config.onMessage || (() => {});
    this.ws = null;
  }

  connect() {
    try {
      const url = `${this.serverUrl}?deviceId=${this.deviceId}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('Connected');
        this.onConnect();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      };

      this.ws.onclose = () => {
        this.onDisconnect();
        setTimeout(() => this.connect(), 5000);
      };
    } catch (error) {
      console.error('Connection error:', error);
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default function App() {
  const [serverUrl, setServerUrl] = useState('ws://localhost:8080');
  const [deviceId, setDeviceId] = useState('');
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const agentRef = useRef(null);

  useEffect(() => {
    // 生成设备ID
    const id = `mobile-${Date.now()}`;
    setDeviceId(id);
    addLog(`Device ID: ${id}`);
  }, []);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  const connect = () => {
    if (!serverUrl) {
      Alert.alert('Error', 'Please enter server URL');
      return;
    }

    addLog('Connecting...');

    const agent = new AgentService({
      serverUrl,
      deviceId,
      onConnect: () => {
        setConnected(true);
        addLog('Connected to server');
      },
      onDisconnect: () => {
        setConnected(false);
        addLog('Disconnected');
      },
      onMessage: handleCommand,
    });

    agent.connect();
    agentRef.current = agent;
  };

  const disconnect = () => {
    if (agentRef.current) {
      agentRef.current.disconnect();
      agentRef.current = null;
    }
    setConnected(false);
    addLog('Disconnected manually');
  };

  const handleCommand = async (command) => {
    addLog(`Received: ${command.type}`);
    
    try {
      let result;
      
      switch (command.type) {
        case 'PING':
          result = { pong: true, time: Date.now() };
          break;
        case 'SYSTEM_INFO':
          result = {
            platform: 'android',
            deviceId,
            time: Date.now(),
          };
          break;
        default:
          result = { error: 'Unknown command: ' + command.type };
      }

      agentRef.current?.send({
        type: 'RESPONSE',
        id: command.id,
        result,
      });
      
      addLog('Executed successfully');
    } catch (error) {
      addLog(`Error: ${error.message}`);
      agentRef.current?.send({
        type: 'RESPONSE',
        id: command.id,
        error: error.message,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Mobile Agent</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, connected ? styles.online : styles.offline]} />
          <Text style={styles.statusText}>
            {connected ? '🟢 Online' : '🔴 Offline'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Server URL (ws:// or wss://)</Text>
          <TextInput
            style={styles.input}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="ws://localhost:8080"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Device ID</Text>
          <TextInput
            style={[styles.input, styles.disabled]}
            value={deviceId}
            editable={false}
          />

          <TouchableOpacity
            style={[styles.button, connected ? styles.disconnectBtn : styles.connectBtn]}
            onPress={connected ? disconnect : connect}
          >
            <Text style={styles.buttonText}>
              {connected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>📋 Logs</Text>
          <ScrollView style={styles.logBox}>
            {logs.map((log, i) => (
              <Text key={i} style={styles.logText}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    backgroundColor: '#16213e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: '#fff',
  },
  content: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  disabled: {
    opacity: 0.6,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectBtn: {
    backgroundColor: '#4CAF50',
  },
  disconnectBtn: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logBox: {
    backgroundColor: '#0f0f1e',
    padding: 10,
    borderRadius: 6,
    maxHeight: 300,
  },
  logText: {
    color: '#0f0',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});
