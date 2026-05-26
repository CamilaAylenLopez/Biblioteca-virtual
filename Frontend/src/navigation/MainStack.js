import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import CrearUsuario from '../screens/CrearUsuario';
import Home from '../screens/Home';
import InfoLibro from '../screens/InfoLibro';
import TabNavigator from './TabNavigator';
import { HeaderTitle } from '@react-navigation/elements';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity, Text } from 'react-native';
import NuevoPersonaje from '../screens/NuevoPersonaje';
import InfoPersonaje from '../screens/InfoPersonaje';
import EditarInfoLibro from '../screens/EditarInfoLibro';
import EditarInfoPersonaje from '../screens/EditarInfoPersonaje';
import Perfil from '../screens/Perfil';
import EditarPerfil from '../screens/EditarPerfil';

const Stack = createNativeStackNavigator();

export default function MainStack({ setUsuarioLogueado }) {
  return (
    <Stack.Navigator initialRouteName="Tab">

      <Stack.Screen name="Tab" options={{ headerShown: false }}>
        {(props) => <TabNavigator {...props} setUsuarioLogueado={setUsuarioLogueado} />}
      </Stack.Screen>

      
      <Stack.Screen name="EditarInfoLibro" options={({ navigation }) => ({
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
            <FontAwesome name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerRight: null,
        headerStyle: {
          backgroundColor: '#282828',
        },
        headerTintColor: 'white',
        })}>
          {(props) => <EditarInfoLibro {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>
      
      <Stack.Screen name="EditarInfoPersonaje" options={({ navigation }) => ({
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
            <FontAwesome name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerRight: null,
        headerStyle: {
          backgroundColor: '#282828',
        },
        headerTintColor: 'white',
        })}>
          {(props) => <EditarInfoPersonaje {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>

      <Stack.Screen name="InfoLibro" options={({ navigation, route }) => ({
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
            <FontAwesome name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('EditarInfoLibro', { libroId: route.params?.libroId })} style={{ marginRight: 15 }}>
            <FontAwesome name="pencil" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: '#282828',
        },
        headerTintColor: 'white',
        })}>
          {(props) => <InfoLibro {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>

      <Stack.Screen name="InfoPersonaje" options={({ navigation, route }) => ({
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
            <FontAwesome name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('EditarInfoPersonaje', { personajeId: route.params?.personajeId })} style={{ marginRight: 15 }}>
            <FontAwesome name="pencil" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: '#282828',
        },
        headerTintColor: 'white',
        })}>
          {(props) => <InfoPersonaje {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>

      <Stack.Screen name="NuevoPersonaje" options={({ navigation }) => ({
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
          backgroundColor: '#282828',
        },
        headerTintColor: 'white',
        })}>
          {(props) => <NuevoPersonaje {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>
        
        <Stack.Screen name="EditarPerfil" options={({ navigation }) => ({
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
            <MaterialIcons name="cancel" size={28} color="white" />
          </TouchableOpacity>
        ),
        headerRight: null,
        headerStyle: {
          backgroundColor: '#282828',
        },
        headerTintColor: 'white',
        })}>
          {(props) => <EditarPerfil {...props} setUsuarioLogueado={setUsuarioLogueado} />}
        </Stack.Screen>
      
    </Stack.Navigator>
  );
}