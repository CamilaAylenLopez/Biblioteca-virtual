import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import CrearRegistro from '../screens/CrearRegistro';
import Home from '../screens/Home';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="CrearRegistro" component={CrearRegistro} />
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}