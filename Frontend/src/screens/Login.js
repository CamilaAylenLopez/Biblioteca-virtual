import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loginUsuario } from '../../api.js';


export default function Login({ navigation }) {
    const [nombreUsuario, setnombreUsuario] = useState('');
    const [password, setpassword] = useState('');
    const [error, setError] = useState(false);

    const logIn = async () => {
      setError(false);

      if(!nombreUsuario || !password){
        Alert.alert("Error", "Completa todos los campos");
        return;
      }

      const { ok, data } = await loginUsuario(nombreUsuario, password);

      if(ok){
        console.log("Bienvenido: ", data.usuario.nombreUsuario);
        navigation.navigate('Tab');
      } else {
        setError(true);
        Alert.alert("Error", data.mensaje || "Datos incorrectos");
      }   
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la biblioteca virtual</Text>
      
      <TextInput style={styles.input} value={nombreUsuario} onChangeText={nombreUsuario => setnombreUsuario(nombreUsuario)} placeholder="Usuario" />
      <TextInput style={styles.input} value={password} onChangeText={password => setpassword(password)} placeholder="Contraseña" secureTextEntry />
      
      {!error ? <Text style={styles.error}>Los datos son incorrectos</Text> : null}

      <TouchableOpacity style={styles.button} onPress={logIn}>
        <Text style={{color: 'white'}}>Iniciar sesion</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('CrearRegistro')}>
        <Text style={{color: 'blue', marginTop: 20}}>¿Todavía no tienes una cuenta? Crear usuario.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#F5F5F5' 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333'
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  link: {
    color: '#007AFF',
    marginTop: 20
  },
  error:{
    color: '#f00',
    padding: 10,
    fontSize: 18,
    justifyContent: 'center',
  }
});