import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getLibros } from '../../api.js';
import { useIsFocused } from '@react-navigation/native';

export default function Home({ navigation }) {
  const isFocused = useIsFocused();
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    if (isFocused) {
      const cargarLibros = async () => {
        const data = await getLibros();
        setLibros(data);
      };
      cargarLibros();
    }
  }, [isFocused]);

  const renderSeccionGenero = (genero) => {
    const librosFiltrados = libros.filter(l => l.genero === genero);

    return (
      <View style={styles.contenedorGenero}>
        <Text style={styles.tituloGenero}>{genero}</Text>
        <FlatList
          horizontal
          data={librosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity onPress={() => navigation.navigate('InfoLibro', { libroId: item.id })}>
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Mi Biblioteca Virtual</Text>
      {renderSeccionGenero('Fantasía')}
      {renderSeccionGenero('Terror')}
      {renderSeccionGenero('Romance')}
      {renderSeccionGenero('Misterio')}
      {renderSeccionGenero('Parodia')}
      {renderSeccionGenero('Ficción')}
      {renderSeccionGenero('Contranovela')}
      {renderSeccionGenero('Policial')}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 70,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
    marginBottom: 20,
  },
  contenedorGenero: {
    marginBottom: 25,
  },
  tituloGenero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
    marginBottom: 10,
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
  },
});