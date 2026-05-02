import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import CrearUsuario from '../screens/CrearUsuario';
import Home from '../screens/Home';
import InfoLibro from '../screens/InfoLibro';
import TabNavigator from '../../TabNavigator';
import { HeaderTitle } from '@react-navigation/elements';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import NuevoPersonaje from '../screens/NuevoPersonaje';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
      <Stack.Screen name="CrearUsuario" component={CrearUsuario} options={{ headerShown: false }}/>
      
      <Stack.Screen name="Tab" component={TabNavigator} options={{ headerShown: false }}/>

      <Stack.Screen name="InfoLibro" component={InfoLibro} options={({ navigation }) => ({
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
            <FontAwesome name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerRight: () => null,
        headerStyle: {
          backgroundColor: '#7D6461',
        },
        headerTintColor: 'white',
        })}
        />

        <Stack.Screen name="NuevoPersonaje" component={NuevoPersonaje} options={({ navigation }) => ({
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
            <MaterialIcons name="cancel" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerRight: () => null,
        headerStyle: {
          backgroundColor: '#7D6461',
        },
        headerTintColor: 'white',
        })}
        />

    </Stack.Navigator>
  );
}

//https://www.youtube.com/watch?v=PmILHVEWZUY --> stack para ir para atras (ultimos minutos)