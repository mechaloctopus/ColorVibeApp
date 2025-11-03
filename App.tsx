import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store/store';
import ColorVibeWorkstation from './src/components/ColorVibeWorkstation';

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.container}>
          <ColorVibeWorkstation />
          <StatusBar style="dark" />
        </View>
      </GestureHandlerRootView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
