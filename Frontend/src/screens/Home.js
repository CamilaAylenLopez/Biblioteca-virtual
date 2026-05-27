import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { getLibros } from '../api/api.js';
import { useIsFocused } from '@react-navigation/native';
import DropdownSelect from 'react-native-input-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function Home({ navigation, setUsuarioLogueado }) {
  const isFocused = useIsFocused();
  const [libros, setLibros] = useState([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState('Todos');
  const [cargando, setCargando] = useState(true);

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
      await SecureStore.deleteItemAsync('token_sesion');
      setUsuarioLogueado(false);
      alerta("Sesión expirada", "Tu sesión ha caducado. Por favor, inicia sesión nuevamente.");
    } catch (error) {
      console.log(error);
      alerta("Error", "Hubo un error al intentar cerrar sesión.");
    }
  };

  useEffect(() => {
    if (isFocused) {
      const cargarLibros = async () => {
        try {
          setCargando(true);

          const data = await getLibros();

          if (Array.isArray(data)) {
            setLibros(data);
          } else {
            setLibros([]);
            if (data && (data.error || data.mensaje)) {
              console.log("Respuesta inesperada del servidor:", data);
            }
          }
        } catch (error) {
          if (error.message === 'TOKEN_EXPIRADO') {
            await procesarCierreDeSesion();
            setUsuarioLogueado(false);
          } else {
            alerta("Error", "Hubo un problema de conexión.");
          }
        } finally {
          setCargando(false);
        }
      };
      cargarLibros();
    }
  }, [isFocused]);

  const generosDisponibles = Array.isArray(libros)
    ? [...new Set(libros.map(l => l.genero).filter(Boolean))]
    : [];

  const opcionesDropdown = [
    {
      title: 'Generos...',
      data: [
        { label: 'Todos', value: 'Todos' },
        ...generosDisponibles.map(g => ({ label: g, value: g }))
      ]
    }
  ];

  const renderTarjetaLibro = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('InfoLibro', { libroId: item.id })}>
      <Image source={item.imagen_url ? { uri: item.imagen_url } : require('../img/Imagenotfound.png')} style={styles.portada} />
      <Text style={styles.tituloLibro} numberOfLines={2}>{item.titulo}</Text>
    </TouchableOpacity>
  );

  const renderFilaGenero = ({ item: genero }) => {
    if (!genero || genero.trim() === '' || genero === 'Todos') return null;

    const librosFiltrados = Array.isArray(libros) ? libros.filter(l => l.genero === genero) : [];

    if (librosFiltrados.length === 0) return null;

    return (
      <View style={styles.contenedorGenero}>
        <Text style={styles.tituloGenero}>{genero}</Text>
        <FlatList
          horizontal
          data={librosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={renderTarjetaLibro}
        />
      </View>
    );
  };

  const RenderHeader = () => (
    <View>
      <Text style={styles.header}>Mi biblioteca Virtual</Text>
      <DropdownSelect
        placeholder="Elegir genero"
        options={opcionesDropdown}
        value={generoSeleccionado}
        selectedValue={generoSeleccionado}
        onValueChange={(value) => setGeneroSeleccionado(value || '')}
        isSearchable
        primaryColor={'#282828'}
        dropdownStyle={{
          backgroundColor: '#282828',
          borderRadius: 20,
          marginLeft: 20,
          maxWidth: 140,
          maxHeight: 50,
          marginVertical: 10,
        }}
        dropdownPlaceholderStyle={{ color: 'white', }}
        placeholderStyle={{ color: 'white', fontSize: 16 }}
        selectedItemStyle={{ color: 'white' }}
      />
    </View>
  );

  if (cargando) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color="#6868AC" />
      </View>
    );
  }

  const datosLista = generoSeleccionado && generoSeleccionado.trim() !== 'Todos'
    ? [generoSeleccionado]
    : generosDisponibles;

  return (
    <View style={styles.container}>
      <FlatList
        data={datosLista}
        keyExtractor={(item) => item}
        renderItem={renderFilaGenero}
        ListHeaderComponent={RenderHeader}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.textoVacio}>No hay libros disponibles</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 70,
  },
  headerContainer: {
    paddingTop: 60,
    marginBottom: 10,
  },
  header: {
    fontSize: 28,
    color: 'white',
    marginLeft: 15,
    marginBottom: 5,
    fontFamily: 'Roboto-Bold'
  },
  contenedorGenero: {
    marginBottom: 25,
  },
  tituloGenero: {
    fontSize: 24,
    color: 'white',
    marginLeft: 15,
    marginBottom: 10,
    fontFamily: 'Roboto-Bold'
  },
  card: {
    width: 150,
    borderRadius: 15,
    marginLeft: 20,
    padding: 8,
    paddingTop: 12,
    backgroundColor: '#282828',
    display: 'flex',
    alignItems: 'center'
  },
  portada: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#333333',
    alignSelf: 'center'
  },
  tituloLibro: {
    color: 'white',
    fontSize: 18,
    marginTop: 5,
    justifyContent: 'center',
    width: 120,
    fontWeight: '500',
    fontFamily: 'Roboto-Regular'
  },
  centrado: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoVacio: {
    color: 'gray',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Roboto-Regular'
  },
});