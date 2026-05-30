import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBiblioteca } from '../api/api.js';
import Entypo from '@expo/vector-icons/Entypo';
import { useIsFocused } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

export default function Perfil({ navigation, setUsuarioLogueado }) {
  const isFocused = useIsFocused();
  const [usuario, setUsuario] = useState(null);
  const [biblioteca, setBiblioteca] = useState([]);

  const alerta = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      alert(mensaje)
    } else {
      Alert.alert(titulo, mensaje)
    }
  };

  const procesarCierreDeSesion = async () => {
    try {
      await AsyncStorage.removeItem('@usuario_sesion');
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('@token_sesion');
      } else {
        await SecureStore.deleteItemAsync('token_sesion');
      }
      setUsuarioLogueado(false);
      alerta("Sesión expirada", "Tu sesión ha caducado. Por favor, inicia sesión nuevamente.");
    } catch (error) {
      console.log(error);
      alerta("Error", "Hubo un error al intentar cerrar sesión.");
    }
  };

  useEffect(() => {
    if (isFocused) {
      const obtenerDatos = async () => {
        try {
          const sesion = await AsyncStorage.getItem('@usuario_sesion');
          const usuarioParseado = JSON.parse(sesion);
          setUsuario(usuarioParseado);

          const data = await getBiblioteca(usuarioParseado.id);

          if (Array.isArray(data)) {
            setBiblioteca(data);
          } else {
            setBiblioteca([]);
          }
        } catch (error) {
          console.error(error);
          if (error.message === "RATE_LIMIT_BLOQUEO") {
            alerta("Demasiadas peticiones", "Has realizado muchas consultas seguidas. Por favor, espera unos minutos.");
            setBiblioteca([]);
            return;
          }

          if (error.message === 'TOKEN_EXPIRADO') {
            await procesarCierreDeSesion();
          } else {
            alerta("Error", "Hubo un problema de conexión.");
          }
        }
      };
      obtenerDatos();
    }
  }, [isFocused]);

  if (!usuario) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7D6461" />
      </View>
    )
  }

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('@usuario_sesion');
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('@token_sesion');
      } else {
        await SecureStore.deleteItemAsync('token_sesion');
      }
      setUsuarioLogueado(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const renderBiblioteca = (nombre) => {
    if (!Array.isArray(biblioteca)) return null;

    const bibliotecaFiltrada = biblioteca.filter(b => b.nombre === nombre);
    if (bibliotecaFiltrada.length === 0) return null;

    const bibliotecaId = bibliotecaFiltrada[0].biblioteca_id;

    const tieneLibros = bibliotecaFiltrada.length > 0 && bibliotecaFiltrada[0].libro_id !== null && bibliotecaFiltrada[0].libro_id !== undefined;

    return (
      <View style={styles.contenedorGenero}>
        <TouchableOpacity onPress={() => navigation.navigate('DetalleBiblioteca', { bibliotecaId: bibliotecaId, nombreBiblioteca: nombre })}>
          <View style={styles.horizontal}>
            <Text numberOfLines={1} style={styles.nombreBiblioteca}>{nombre}</Text>
            <Entypo name="chevron-right" size={24} color="white" />
          </View>
        </TouchableOpacity>
        {tieneLibros ? (
          <FlatList
            horizontal
            data={bibliotecaFiltrada}
            keyExtractor={(item, index) => item.libro_id.toString() || index.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <TouchableOpacity onPress={() => navigation.navigate('InfoLibro', { libroId: item.libro_id })}>
                  <Image
                    source={item.imagen_url ? { uri: item.imagen_url } : require('../img/Imagenotfound.png')}
                    style={styles.portada}
                  />
                  <Text style={styles.tituloLibro} numberOfLines={2}>{item.titulo}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <Text style={styles.vacio}>No hay libros guardados aun.</Text>
        )}
      </View>
    );
  };

  const nombresBibliotecas = Array.isArray(biblioteca)
    ? [...new Set(biblioteca.map(b => b.nombre).filter(nombre => nombre))]
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      <View style={styles.horizontal}>
        <Image
          source={usuario.foto_perfil ? { uri: usuario.foto_perfil } : require('../img/userIcon.webp')}
          style={styles.foto}
        />
        <View style={styles.vertical}>
          <View style={styles.horizontal}>
            <Text style={styles.nombre}>@{usuario.nombreUsuario}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditarPerfil', { id: usuario.id })}>
              <Entypo name="pencil" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nombre}>{usuario.nombre} {usuario.apellido}</Text>
        </View>
      </View>

      <Text style={styles.biografia}>{usuario.descripcion || "Sin biografía."}</Text>


      <Text style={styles.subtitulo}>Bibliotecas</Text>

      {nombresBibliotecas.length > 0 ? (
        nombresBibliotecas.map((nombre) => (
          <View key={nombre}>
            {renderBiblioteca(nombre)}
          </View>
        ))
      ) : (
        <Text style={styles.vacio}>No has guardado ningun libro aun.</Text>
      )}

      <TouchableOpacity onPress={cerrarSesion} style={styles.button}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 15,
    paddingTop: 70,
    backgroundColor: '#121212',
  },
  vacio: {
    color: '#bebebe',
    marginLeft: 15,
    marginTop: 5,
    fontSize: 16,
    fontFamily: 'Roboto-Regular'
  },
  nombre: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
    color: 'white',
    marginLeft: 20,
    marginRight: 10,
    fontFamily: 'Roboto-Bold'
  },
  subtitulo: {
    fontSize: 25,
    fontFamily: 'Roboto-Bold',
    color: 'white',
    marginLeft: 15,
    marginBottom: 10,
    marginTop: 20,
  },
  biografia: {
    fontSize: 20,
    color: 'white',
    padding: 20,
    fontFamily: 'Roboto-Regular'
  },
  button: {
    width: '50%',
    height: 50,
    backgroundColor: '#703b3b',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 50,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    alignSelf: 'center',
    margin: 5,
    fontWeight: '400',
    fontFamily: 'Roboto-Regular'
  },
  foto: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginLeft: 15,
  },
  horizontal: {
    flexDirection: 'row',
    alignContent: 'center',
    marginBottom: 10,
  },
  vertical: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  contenedorGenero: {
    marginBottom: 25,
  },
  nombreBiblioteca: {
    flex: 1,
    fontSize: 18,
    color: 'white',
    marginLeft: 15,
    marginBottom: 10,
    fontFamily: 'Roboto-Bold'
  },
  card: {
    width: 130,
    borderRadius: 10,
    marginLeft: 20,
    padding: 8,
    paddingTop: 12,
    backgroundColor: '#282828',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Roboto-Regular'
  },
  portada: {
    width: 110,
    height: 170,
    borderRadius: 8,
    backgroundColor: '#333333',
    alignSelf: 'center',
    fontFamily: 'Roboto-Regular'
  },
  tituloLibro: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
    justifyContent: 'center',
    width: 120,
    fontWeight: '500',
    fontFamily: 'Roboto-Regular'
  },
});