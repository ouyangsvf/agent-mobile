/**
 * LogViewer - 日志显示组件
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const LogViewer = ({ logs }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>暂无日志</Text>
        ) : (
          logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f0f1e',
    borderRadius: 8,
    maxHeight: 300,
  },
  scrollView: {
    padding: 10,
  },
  logText: {
    color: '#0f0',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});
