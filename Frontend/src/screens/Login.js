import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { loginUsuario } from '../api/api.js';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation, setUsuarioLogueado }) {
  const [nombreUsuario, setnombreUsuario] = useState('');
  const [password, setpassword] = useState('');
  const [mostrarPassword, setmostrarPassword] = useState(false);

  const alerta = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      alert(mensaje)
    } else {
      Alert.alert(titulo, mensaje)
    }
  };

  const logIn = async () => {

    if (!nombreUsuario || !password) {
      alerta("Error", "Completa todos los campos");
      return;
    }

    try {
      const { ok, data } = await loginUsuario(nombreUsuario, password);

      if (ok) {
        await AsyncStorage.setItem('@usuario_sesion', JSON.stringify(data.usuario));
        const horaActual = Date.now().toString();
        await AsyncStorage.setItem('@hora_login', horaActual);
        setUsuarioLogueado(true);
      } else {
        alerta("Error", "Datos incorrectos");
      }
    } catch (error) {
      console.log(error)
    }

  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.subContainer}>
          <Text style={styles.titulo}>Bienvenido de nuevo a tu biblioteca virtual</Text>
          <Text style={styles.subtitulo}>Inicio sesión</Text>

          <TextInput style={styles.input} value={nombreUsuario} onChangeText={nombreUsuario => setnombreUsuario(nombreUsuario)} placeholder="Usuario..." autoCapitalize="none" autoCorrect={false} />
          <View style={styles.inputD}>
            <TextInput style={styles.contrasenaInput} value={password} onChangeText={password => setpassword(password)} placeholder="Contraseña..." secureTextEntry={!mostrarPassword} autoCapitalize="none" autoCorrect={false} />
            <TouchableOpacity style={styles.icon} onPress={() => setmostrarPassword(!mostrarPassword)} >
              <Entypo name={mostrarPassword ? 'eye-with-line' : 'eye'} size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.textoContrasena}>¿Has olvidado tu contraseña?</Text>

          <TouchableOpacity style={styles.button} onPress={logIn}>
            <Text style={styles.buttonText}>Iniciar sesion</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('CrearUsuario')}>
            <Text style={styles.link}>¿Todavía no tienes una cuenta? Crear usuario.</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8E7960',
  },
  subContainer: {
    backgroundColor: '#DBD3CF',
    marginVertical: 40,
    marginHorizontal: 30,
    paddingTop: 70,
    paddingHorizontal: 30,
    minHeight: 340,
    Width: 600,
    height: 800,
    borderRadius: 50,
    alignSelf: 'center',
  },
  inputD: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    backgroundColor: '#7D6461',
    borderRadius: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: 'white',
    fontFamily: 'Roboto-Regular'
  },
  titulo: {
    fontSize: 35,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold'
  },
  subtitulo: {
    fontSize: 24,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold'
  },
  textoContrasena: {
    paddingTop: 0,
    marginTop: 0,
    fontSize: 13,
    marginBottom: 20,
    fontFamily: 'Roboto-Regular'
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#7D6461',
    borderRadius: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: 'white',
    outlineStyle: 'none',
    fontSize: 16,
    fontFamily: 'Roboto-Regular'
  },
  contrasenaInput: {
    color: 'white',
    flex: 1,
    outlineStyle: 'none',
    fontSize: 16,
    fontFamily: 'Roboto-Regular'
  },
  button: {
    width: '50%',
    height: 50,
    backgroundColor: '#7D6461',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 50,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 14,
    alignSelf: 'center',
    margin: 5,
    color: 'white',
    fontWeight: '400',
    fontFamily: 'Roboto-Regular'
  },
  link: {
    color: '#6868AC',
    marginTop: 50,
    display: 'flex',
    alignSelf: 'center',
    fontFamily: 'Roboto-Regular'
  },
  error: {
    color: '#d00000',
    fontSize: 16,
    margin: 10,
    fontFamily: 'Roboto-Regular'
  },
  icon: {
    padding: 5,
    paddingTop: 12,
  },
});