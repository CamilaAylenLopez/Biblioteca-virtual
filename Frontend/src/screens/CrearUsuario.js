import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { registrarUsuario } from '../../api';

export default function CrearUsuario({ navigation }) {
    const [form, setForm] = useState({
        nombre: '', apellido: '', nombreUsuario: '', email: '', password: ''
    });

    const handleRegistro = async () => {
        if (!form.nombreUsuario || !form.password || !form.email) {
            Alert.alert("Error", "Faltan campos obligatorios");
            return;
        }

        const { ok, data } = await registrarUsuario(form);

        if (ok) {
            Alert.alert("¡Éxito!", "Usuario creado correctamente");
            navigation.navigate('Login');
        } else {
            Alert.alert("Error", data.mensaje);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>

                <Text style={styles.titulo}>Bienvenido a tu nueva biblioteca virtual</Text>
                <Text style={styles.subtitulo}>Craer usuario</Text>
        
                <TextInput style={styles.input} placeholder="Nombre" onChangeText={(txt) => setForm({...form, nombre: txt})} />
                <TextInput style={styles.input} placeholder="Nombre de Usuario" onChangeText={(txt) => setForm({...form, nombreUsuario: txt})} />
                <TextInput style={styles.input} placeholder="Email" onChangeText={(txt) => setForm({...form, email: txt})} />
                <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry onChangeText={(txt) => setForm({...form, password: txt})} />
                
                <TouchableOpacity onPress={handleRegistro} style={styles.button}>
                    <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>¿Ya tienes una cuenta creada? Iniciar sesión.</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#8E7960',
    fontFamily: 'roboto',
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
    marginTop: 50
  },
  error:{
    color: '#f00',
    padding: 10,
    fontSize: 18,
    justifyContent: 'center',
  }
});