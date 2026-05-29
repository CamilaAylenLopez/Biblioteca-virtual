import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { getPersonajeById, eliminarPersonaje } from '../api/api';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function InfoPersonaje({ navigation, route, setUsuarioLogueado }) {
    const { personajeId } = route.params;
    const [cargando, setCargando] = useState(true);
    const [personaje, setPersonaje] = useState(null);
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
            const cargarDatos = async () => {
                try {
                    const dataPersonaje = await getPersonajeById(personajeId);
                    setPersonaje(dataPersonaje);
                } catch (error) {
                    console.error(error);
                    if (error.message === "RATE_LIMIT_BLOQUEO") {
                        alerta("Demasiadas peticiones", "Has realizado muchas consultas seguidas. Por favor, espera unos minutos.");
                        return;
                    }
                    if (error.message === 'TOKEN_EXPIRADO') {
                        await procesarCierreDeSesion();
                    } else {
                        alerta("Error", "Hubo un problema de conexión.");
                    }
                } finally {
                    setCargando(false);
                }
            };
            cargarDatos();
        }
    }, [personajeId, isFocused]);

    const deletePersonaje = async () => {
        const ejecutarBaja = async () => {
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
                if (error.message === "RATE_LIMIT_BLOQUEO") {
                    alerta("Demasiadas peticiones", "Has realizado muchas consultas seguidas. Por favor, espera unos minutos.");
                    return;
                }
                if (error.message === 'TOKEN_EXPIRADO') {
                    await procesarCierreDeSesion();
                } else {
                    alerta("Error", "Hubo un problema de conexión.");
                }
            }
        }
        if (Platform.OS === 'web') {
            if (confirm("¿Estas seguro de borrar este personaje?")) ejecutarBaja();
        } else {
            Alert.alert("Eliminar", "¿Seguro que quieres borrar este personaje?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: ejecutarBaja }
            ]);
        }
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!personaje) return <Text style={{ color: 'white' }}>Cargando...</Text>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.icon} onPress={deletePersonaje}>
                <FontAwesome name="trash" size={35} color="#bebebe" />
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                <Image source={personaje.imagen_url ? { uri: personaje.imagen_url } : require('../img/Imagenotfound.png')} style={styles.imagen} />

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
        paddingTop: 60,
        marginTop: 50,
        backgroundColor: '#121212',
    },
    icon: {
        display: 'flex',
        alignItems: 'flex-end',
        marginTop: 40,
    },
    imagen: {
        width: '60%',
        height: 400,
        resizeMode: 'cover',
        alignSelf: 'center',
        margin: 20,
        marginTop: 5,
        borderRadius: 10,
    },
    titulo: {
        textAlign: 'center',
        fontSize: 20,
        color: 'white',
        padding: 5,
        fontFamily: 'Roboto-Bold'
    },
    descripcion: {
        color: 'white',
        margin: 20,
        marginBottom: 40,
        fontFamily: 'Roboto-Regular'
    },
    subContainer: {
        margin: 20,
        paddingLeft: 10,
    },
});