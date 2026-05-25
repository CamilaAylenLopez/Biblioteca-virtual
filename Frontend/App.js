import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainStack from './src/navigation/MainStack';
import TabNavigator from './src/navigation/TabNavigator';
import Login from './src/screens/Login';
import CrearUsuario from './src/screens/CrearUsuario';
import InfoLibro from './src/screens/InfoLibro';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';

const Stack = createNativeStackNavigator();

export default function App() {
  const [cargando, setCargando] = useState(true);
  const [usuarioLogueado, setUsuarioLogueado] = useState(false);
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Bold': Roboto_700Bold,
  });

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = await AsyncStorage.getItem('@token_sesion');

        if(token){
          setUsuarioLogueado(true);
        }else{
          setUsuarioLogueado(false);
        }
      } catch (error) {
        console.error("Error verificando sesión: ", error);
      } finally {
        setCargando(false);
      }
    };
    verificarSesion();
  }, []);

  const forzarCierreSesion = async () => {
    try {
      await AsyncStorage.removeItem('@usuario_sesion');
      await AsyncStorage.removeItem('@token_sesion');
      setUsuarioLogueado(false);
      Alert.alert("Sesion finalizada", "Has alcanzado el limite de 7 días. Inicia sesión nuevamente.");
    } catch (error) {
      console.error("Error al cerrar sesión automaticmanete: ", error);
    }
  };

  if (cargando || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#7D6461" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {usuarioLogueado ? (
          <Stack.Screen name="Main">
            {(props) => <MainStack {...props} setUsuarioLogueado={setUsuarioLogueado} forzarCierreSesion={forzarCierreSesion}/>}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <Login {...props} setUsuarioLogueado={setUsuarioLogueado} />}
            </Stack.Screen>

            <Stack.Screen name="CrearUsuario">
              {(props) => <CrearUsuario {...props} setUsuarioLogueado={setUsuarioLogueado} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}