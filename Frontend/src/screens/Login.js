import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { loginUsuario } from '../../api.js';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
    const [nombreUsuario, setnombreUsuario] = useState('');
    const [password, setpassword] = useState('');
    const [mostrarPassword, setmostrarPassword] = useState(false);
    const [error, setError] = useState(false);

    const logIn = async () => {
      setError(false);

      if(!nombreUsuario || !password){
        Alert.alert("Error", "Completa todos los campos");
        return;
      }

      const { ok, data } = await loginUsuario(nombreUsuario, password);

      if(ok){
        await AsyncStorage.setItem('@usuario_sesion', JSON.stringify(data.usuario));

        console.log("Bienvenido: ", data.usuario.nombreUsuario);
        navigation.replace('Tab');
      } else {
        setError(true);
        Alert.alert("Error", data.error || "Datos incorrectos");
      }   
    };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.titulo}>Bienvenido de nuevo a tu biblioteca virtual</Text>
        <Text style={styles.subtitulo}>Inicio sesión</Text>
        
        <TextInput style={styles.input} value={nombreUsuario} onChangeText={nombreUsuario => setnombreUsuario(nombreUsuario)} placeholder="Usuario..." />
        <View style={styles.inputD}>
          <TextInput style={styles.contrasenaInput} value={password} onChangeText={password => setpassword(password)} placeholder="Contraseña..." secureTextEntry={!mostrarPassword} />
            <TouchableOpacity style={styles.icon} onPress={() => setmostrarPassword(!mostrarPassword)} >
              <Entypo name={mostrarPassword ? 'eye-with-line' : 'eye'} size={24} color="white" />
            </TouchableOpacity>
        </View>

        <Text style={styles.textoContrasena}>¿Has olvidado tu contraseña?</Text>
        
        {error ? <Text style={styles.error}>Los datos son incorrectos</Text> : null}

        <TouchableOpacity style={styles.button} onPress={logIn}>
          <Text style={styles.buttonText}>Iniciar sesion</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('CrearUsuario')}>
          <Text style={styles.link}>¿Todavía no tienes una cuenta? Crear usuario.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20, 
    backgroundColor: '#8E7960',
  },
  subContainer:{
    backgroundColor: '#DBD3CF',
    margin: 10,
    paddingTop: 70,
    paddingHorizontal: 30,
    width: 350,
    height: 800,
    borderRadius: 50,
  },
  inputD:{
    flexDirection: 'row',
    width: '100%',
    height: 50,
    backgroundColor: '#7D6461',
    borderRadius: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: 'white',
  },
  titulo: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  textoContrasena:{
    paddingTop: 0,
    marginTop: 0,
    fontSize: 13,
    marginBottom: 20,
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
  },
  contrasenaInput:{
    color: 'white',
    flex: 1,
    outlineStyle: 'none',
    fontSize: 16
  },
  button: {
    width: '50%',
    height: 50,
    backgroundColor: '#7D6461',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 50,
    marginTop: 10,
    textAlign: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    alignSelf: 'center',
    margin: 5,
  },
  link: {
    color: '#6868AC',
    marginTop: 50,
    display: 'flex',
    alignSelf: 'center',
  },
  error:{
    color: '#b91e1e',
    padding: 10,
    fontSize: 18,
    justifyContent: 'center',
  },
  icon: {
    padding: 5,
    paddingTop: 12,
  },
});