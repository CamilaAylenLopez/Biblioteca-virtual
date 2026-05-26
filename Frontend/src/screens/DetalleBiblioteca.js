import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eliminarBiblioteca, eliminarLibroBiblioteca, getBibliotecaById } from '../api/api.js';
import { useIsFocused } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as SecureStore from 'expo-secure-store';

export default function DetalleBiblioteca({ navigation, route, setUsuarioLogueado }) {
    const { bibliotecaId, nombreBiblioteca } = route.params;
    const [libros, setLibros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const isFocused = useIsFocused();

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
            const obtenerDatos = async () => {
                try {
                    const data = await getBibliotecaById(bibliotecaId);
                    setLibros(data);
                    setCargando(false);
                } catch (error) {
                    console.error(error);
                    if (error.message === 'TOKEN_EXPIRADO') {
                        await procesarCierreDeSesion();
                        setUsuarioLogueado(false);
                    } else {
                        alerta("Error", "Hubo un problema de conexión.");
                    }
                }
            };
            obtenerDatos();
        }
    }, [isFocused, bibliotecaId]);

    const deleteBiblioteca = async () => {
        const ejecutarBaja = async () => {
            try {
                const respuesta = await eliminarBiblioteca(bibliotecaId);
                if (respuesta.ok) {
                    alerta("Exito", "Biblioteca elimiando con exito");
                    navigation.goBack();
                } else {
                    alerta("Error", "No se ha podido eliminar la biblioteca");
                }
            } catch (error) {
                console.error(error);
                if (error.message === 'TOKEN_EXPIRADO') {
                    await procesarCierreDeSesion();
                    setUsuarioLogueado(false);
                } else {
                    alerta("Error", "Hubo un problema de conexión.");
                }
            }
        };
        if (Platform.OS === 'web') {
            if (confirm("¿Estas seguro de borrar toda la biblioteca?")) ejecutarBaja();
        } else {
            Alert.alert("Eliminar", "¿Seguro que quieres borrar toda la biblioteca?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: ejecutarBaja }
            ]);
        }
    };

    const deleteLibroDeBiblioteca = async (idlibro) => {
        try {
            const respuesta = await eliminarLibroBiblioteca(bibliotecaId, idlibro);
            if (respuesta.ok) {
                alerta("Exito", "Libro elimiando de biblioteca con exito");
                setLibros(prev => prev.filter(libro => libro.libro_id !== idlibro));
            } else {
                alerta("Error", "No se ha podido eliminar libro de biblioteca");
            }
        } catch (error) {
            console.error(error);
            if (error.message === 'TOKEN_EXPIRADO') {
                await procesarCierreDeSesion();
                setUsuarioLogueado(false);
            } else {
                alerta("Error", "Hubo un problema de conexión.");
            }
        }
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center' }} />;

    return (
        <View style={styles.container}>

            <FlatList
                data={libros}
                keyExtractor={(item) => item.libro_id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.filaGrid}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.horizontal}>
                        <Text style={styles.subtitulo} numberOfLines={1}>{nombreBiblioteca}</Text>
                        <TouchableOpacity onPress={deleteBiblioteca} style={styles.btnEliminarHeader}>
                            <FontAwesome name="trash" size={26} color="#bebebe" />
                        </TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={<Text style={styles.vacio}>Esta biblioteca no tiene libros aun.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card} >
                        <TouchableOpacity onPress={() => navigation.navigate('InfoLibro', { libroId: item.libro_id })}>
                            <Image source={item.imagen_url ? { uri: item.imagen_url } : require('../img/Imagenotfound.png')} style={styles.portada} />
                        </TouchableOpacity>

                        <View style={styles.horizontal}>
                            <Text style={styles.tituloLibro} numberOfLines={2}>{item.titulo}</Text>
                            <TouchableOpacity style={styles.btnEliminar} onPress={() => deleteLibroDeBiblioteca(item.libro_id)}>
                                <FontAwesome name="trash" size={20} color="#bebebe" />
                            </TouchableOpacity>
                        </View>

                    </View>

                )}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 50,
        marginTop: 50,
        paddingVertical: 40,
        paddingHorizontal: 15,
        backgroundColor: '#121212',
    },
    subtitulo: {
        fontSize: 25,
        fontFamily: 'Roboto-Bold',
        color: 'white',
        marginLeft: 15,
        marginBottom: 10,
        marginTop: 20,
    },
    horizontal: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingTop: 5,
    },
    nombreBiblioteca: {
        fontSize: 18,
        color: 'white',
        marginLeft: 15,
        marginBottom: 10,
        fontFamily: 'Roboto-Bold'
    },
    card: {
        width: 165,
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingTop: 12,
        backgroundColor: '#282828',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'Roboto-Regular',
        marginBottom: 20,
    },
    portada: {
        width: 130,
        height: 190,
        borderRadius: 8,
        backgroundColor: '#333333',
        alignSelf: 'center',
        fontFamily: 'Roboto-Regular'
    },
    tituloLibro: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Roboto-Regular',
        paddingHorizontal: 5,
    },
    vacio: {
        color: '#bebebe',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    btnEliminar: {
        paddingBottom: 10,
        paddingHorizontal: 5,
        display: 'flex',
        justifyContent: 'flex-end'
    },
    btnEliminarHeader: {
        padding: 12,
        alignSelf: 'flex-end'
    },
    filaGrid: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
});