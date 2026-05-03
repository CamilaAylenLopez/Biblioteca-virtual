import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Perfil({ navigation }) {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const datos = await AsyncStorage.getItem('@usuario_sesion');
                if(datos != null){
                    setUsuario(JSON.parse(datos));
                }
            }catch(error){
                console.error(error);
            }
        };
        obtenerDatos();
    }, []);

    if(!usuario) return <Text>Cargando perfil...</Text>;

    const cerrarSesion = async () => {
        await AsyncStorage.removeItem('@usuario_sesion');
        navigation.replace('Login');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={{flexDirection: 'row',}}>
                <Image 
                    source={{uri: usuario.foto_perfil  || 'https://via.placeholder.com/150' }}
                    style={styles.foto}
                />
                <Text style={styles.nombre}>{usuario.nombreUsuario}</Text>
                <Text style={styles.biografia}>{usuario.descripcion || "Sin biografía"}</Text>
            </View>

            <Text style={styles.subtitulo}>Biblioteca</Text>
            

            <TouchableOpacity onPress={cerrarSesion} style={styles.button}>
                <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20, 
    backgroundColor: '#000000',
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: 'white'
  },
  subtitulo:{
    color: 'white'
  },
  biografia:{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: 'white',
    display: '',
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
  foto:{
    width: 100,
    height: 100,
    borderRadius: 100,
  }
});