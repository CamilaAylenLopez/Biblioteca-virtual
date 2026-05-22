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
        const sesion = await AsyncStorage.getItem('@usuario_sesion');
        const horaLoginStr = await AsyncStorage.getItem('@hora_login');
        
        if (sesion && horaLoginStr) {
          const horaLogin = parseInt(horaLoginStr, 10);
          const horaActual = Date.now();
          const TIEMPO_EXPIRACION = 60000 * 10; // sería un minuto por 10

          if(horaActual - horaLogin > TIEMPO_EXPIRACION){
            await AsyncStorage.removeItem('@usuario_sesion');
            await AsyncStorage.removeItem('@hora_login');
            setUsuarioLogueado(false);
            setCargando(false);
            Alert.alert("Sesión cerrada", "Tu sesión ha expirado por inactividad. Vuelve a iniciar sesión.");
          }else{
            setUsuarioLogueado(true);
          }
        } else {
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

  if (cargando || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#7D6461" />
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#7D6461" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {usuarioLogueado === true ? (
          <Stack.Screen name="Main">
            {(props) => <MainStack {...props} setUsuarioLogueado={setUsuarioLogueado} />}
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