import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getLibros } from '../../api.js';
import { useIsFocused } from '@react-navigation/native';
import DropdownSelect from 'react-native-input-select';

export default function Home({ navigation }) {
  const isFocused = useIsFocused();
  const [libros, setLibros] = useState([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState(null);

  useEffect(() => {
    if (isFocused) {
      const cargarLibros = async () => {
        const data = await getLibros();
        setLibros(data);
      };
      cargarLibros();
    }
  }, [isFocused]);

  const generosDisponibles = [...new Set(libros.map(l => l.genero).filter(Boolean))];

  const renderSeccionGenero = (genero) => {
    const librosFiltrados = libros.filter(l => l.genero === genero);

    return (
      <View style={styles.contenedorGenero} key={genero}>
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
                  source={item.imagen_url ? { uri: item.imagen_url } : require('../img/Imagenotfound.png')}
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

      <DropdownSelect
        label=" "
        placeholder="Elegir genero"
        options={[
          {
            title: 'Generos...',
            data: [
              { label: 'Todos'},
              { label: 'Terror', value: 'Terror' },
              { label: 'Romance', value: 'Romance' },
              { label: 'Misterio', value: 'Misterio' },
              { label: 'Parodia', value: 'Parodia' },
              { label: 'Ficción', value: 'Ficción' },
              { label: 'No Ficción', value: 'No Ficción' },
              { label: 'Contranovela', value: 'Contranovela' },
              { label: 'Aventura', value: 'Aventura' },
              { label: 'Historia', value: 'Historia' },
              { label: 'Policial', value: 'Policial' },
              { label: 'Fantasía', value: 'Fantasía' },
            ],
          },
        ]}
        value={generoSeleccionado}
        selectedValue={generoSeleccionado}
        onValueChange={(value) => setGeneroSeleccionado(value)}
        isSearchable
        primaryColor={'#282828'}
        dropdownStyle={{
          backgroundColor: '#282828',
          borderColor: '#282828',
          borderRadius: 50,
          maxWidth: 160,
          marginLeft: 10,
        }}
        dropdownIconStyle={{ color: 'white' }}
        dropdownPlaceholderStyle={{ color: 'white', }}
        placeholderStyle={{ color: 'white', fontSize: 16 }}
        selectedItemStyle={{ color: 'white' }}
      />

      {libros.length === 0 ? (
        <Text style={{ color: 'gray', textAlign: 'center', marginTop: 20, fontFamily: 'Roboto-Regular' }}>No hay libros disponibles</Text>
      ) : generoSeleccionado ? (
        renderSeccionGenero(generoSeleccionado)
      ) : (
        generosDisponibles.map(genero => renderSeccionGenero(genero))
      )}
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
});