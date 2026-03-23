import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function Login({ navigation }) {
    const [nombreUsuario, setnombreUsuario] = useState('');
    const [password, setpassword] = useState('');


    const logIn = async () => {
        if(!nombreUsuario || !password){
            Alert.alert("Error", "Completa todos los campos");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreUsuario: nombreUsuario,
                    password: password
                }),
            });

            const resultado = await response.json();

            if(response.ok){
                console.log("Bienvenido: ", resultado.usuario.nombreUsuario)
                navigation.navigate('Home');
            }
            else{
                alert(resultado.mensaje || "Datos incorrectos")
            }
        } catch(error){
            console.error("Error de conexión: ", error);
            alert("No se pudo conectar con el servidor");
        }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la biblioteca virtual</Text>
      <TextInput style={styles.input} value={nombreUsuario} onChangeText={nombreUsuario => setnombreUsuario(nombreUsuario)} placeholder="Usuario" />
      <TextInput style={styles.input} value={password} onChangeText={password => setpassword(password)} placeholder="Contraseña" secureTextEntry />
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
  }
});