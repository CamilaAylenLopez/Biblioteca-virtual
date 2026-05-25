import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { getPersonajeById, eliminarPersonaje } from '../api/api';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useIsFocused } from '@react-navigation/native';
import { navigate } from 'expo-router/build/global-state/routing';

export default function InfoPersonaje({ navigation, route }) {
    const { personajeId } = route.params;
    const [cargando, setCargando] = useState(true);
    const [personaje, setPersonaje] = useState([]);
    const isFocused = useIsFocused();

    const procesarCierreDeSesion = async () => {
        try {
            await AsyncStorage.removeItem('@usuario_sesion');
            await AsyncStorage.removeItem('@token_sesion');
            setUsuarioLogueado(false);
            alerta("Sesión expirada", "Tu sesión ha caducado. Por favor, inicia sesión nuevamente.");
        } catch (error) {
            console.log(error);
            alerta("Error", "Hubo un error al intentar cerrar sesión.");
        }
    };

    useEffect(() => {
        if (isFocused) {
            const cargarDatos = async () => {
                try {
                    const dataPersonaje = await getPersonajeById(personajeId);
                    setPersonaje(dataPersonaje);
                } catch (error) {
                    console.error(error);
                } finally {
                    setCargando(false);
                }
            };
            cargarDatos();
        }
    }, [personajeId, isFocused]);

    const alerta = (titulo, mensaje) => {
        if (Platform.OS === 'web') {
            alert(mensaje)
        } else {
            Alert.alert(titulo, mensaje)
        }
    };

    const deletePersonaje = async () => {
        try {
            const respuesta = await eliminarPersonaje(personajeId);
            if (respuesta.ok) {
                alerta("Exito", "Personaje elimiando con exito");
                navigation.goBack();
            } else {
                alerta("Error", "No se ha podido eliminar el personaje");
            }
        } catch (error) {
            console.error(error);
            alerta("Error", "No se ha podido eliminar el personaje");
        }
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!personaje) return <Text style={{ color: 'white' }}>Cargando...</Text>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.icon} onPress={deletePersonaje}>
                <FontAwesome name="trash" size={35} color="white" />
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                <Image
                    source={personaje.imagen_url ? { uri: personaje.imagen_url } : require('../img/Imagenotfound.png')}
                    style={styles.imagen}
                />

                <Text style={styles.titulo} >{personaje.nombre} </Text>

                <Text style={styles.descripcion}>{personaje.descripcion || "Sin descripción disponible."}</Text>

            </View>

        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 40,
        marginTop: 50,
        backgroundColor: '#121212',
    },
    subContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Roboto-Regular'
    },
    icon: {
        display: 'flex',
        alignItems: 'flex-end',
        margin: 5,
        marginTop: 40,
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
    imagen: {
        width: '60%',
        height: 400,
        resizeMode: 'cover',
        alignSelf: 'center',
        margin: 20,
        marginTop: 10,
    },
    fotoUsuario: {
        width: 60,
        height: 60,
        borderRadius: 100,
        marginRight: 10,
        backgroundColor: '#333',
    },
    titulo: {
        textAlign: 'center',
        fontSize: 20,
        color: 'white',
        padding: 5,
        fontFamily: 'Roboto-Bold'
    },
    subtexto: {
        textAlign: 'center',
        color: '#cdcaca',
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    descripcion: {
        color: 'white',
        margin: 20,
        fontFamily: 'Roboto-Regular'
    },
    estrellas: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    estrellasD: {
        flexDirection: 'row',
        margin: 10,
    },
    subContainer: {
        margin: 20,
        paddingLeft: 10,
    },
    subtitulo: {
        color: 'white',
        fontSize: 20,
        marginBottom: 10,
        fontFamily: 'Roboto-Bold'
    },
    personajeCard: {
        alignItems: 'center',
        marginRight: 15,
    },
    fotoPersonaje: {
        width: 100,
        height: 150,
    },
    nombrePersonaje: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
        fontFamily: 'Roboto-Regular'
    },
});