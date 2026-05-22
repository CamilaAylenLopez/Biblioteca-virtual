import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBiblioteca } from '../../api.js';
import Entypo from '@expo/vector-icons/Entypo';
import { useIsFocused } from '@react-navigation/native';

export default function Perfil({ navigation, setUsuarioLogueado }) {
  const isFocused = useIsFocused();
  const [usuario, setUsuario] = useState(null);
  const [biblioteca, setBiblioteca] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const sesion = await AsyncStorage.getItem('@usuario_sesion');
        if (sesion != null) {
          const usuarioParseado = JSON.parse(sesion);
          setUsuario(usuarioParseado);
          const data = await getBiblioteca(usuarioParseado.id);
          setBiblioteca(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    obtenerDatos();
  }, [isFocused]);

  const renderBiblioteca = (nombre) => {
    const bibliotecaFiltrada = biblioteca.filter(b => b.nombre === nombre);

    if (bibliotecaFiltrada.length === 0) return null;

    return (
      <View style={styles.contenedorGenero}>
        <Text style={styles.nombreBiblioteca}>{nombre}</Text>
        <FlatList
          horizontal
          data={bibliotecaFiltrada}
          keyExtractor={(item, index) => item.libro_id.toString() || index.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity onPress={() => navigation.navigate('InfoLibro', { libroId: item.libro_id })}>
                <Image
                  source={item.imagen_url ? { uri: item.imagen_url} : require('../img/Imagenotfound.png')}
                  style={styles.portada}
                />
                <Text style={styles.tituloLibro} numberOfLines={2}>{item.titulo}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  };


  if (!usuario) return <Text>Cargando perfil...</Text>;

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('@usuario_sesion');
    setUsuarioLogueado(false);
  };

  const nombresBibliotecas = [...new Set(biblioteca.map(b => b.nombre))];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.horizontal}>
        <Image
          source={usuario.foto_perfil ? { uri: usuario.foto_perfil} : require('../img/userIcon.webp')}
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

      <Text style={styles.biografia}>{usuario.descripcion || "Sin biografía"}</Text>


      <Text style={styles.subtitulo}>Bibliotecas</Text>

      {nombresBibliotecas.length > 0 ? (
        nombresBibliotecas.map((nombre) => (
          <View key={nombre}>
            {renderBiblioteca(nombre)}
          </View>
        ))
      ) : (
        <Text style={{color: 'white'}}>No has guardado ningun libro aun.</Text>
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
    marginBottom: 20,
    color: 'white',
    padding: 20,
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
    fontFamily: 'Roboto-Regular'
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
    alignItems: 'center',
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