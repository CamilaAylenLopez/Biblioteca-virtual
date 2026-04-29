import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import CrearRegistro from '../screens/CrearRegistro';
import Home from '../screens/Home';
import InfoLibro from '../screens/InfoLibro';
import TabNavigator from '../../TabNavigator';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
      <Stack.Screen name="CrearRegistro" component={CrearRegistro} />
      
      <Stack.Screen name="Tab" component={TabNavigator} options={{ headerShown: false }}/>

      <Stack.Screen name="InfoLibro" component={InfoLibro} options={{ headerShown: false }}/>

    </Stack.Navigator>
  );
}

//https://www.youtube.com/watch?v=PmILHVEWZUY --> stack para ir para atras (ultimos minutos)