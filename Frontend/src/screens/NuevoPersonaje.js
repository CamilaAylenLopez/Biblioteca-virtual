import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { nuevoPersonaje } from '../api/api';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function NuevoPersonaje({ navigation, route, setUsuarioLogueado }) {
    const isFocused = useIsFocused();
    const { libroId } = route.params;
    const [form, setForm] = useState({
        nombre: '', imagen_url: '', descripcion: ''
    });

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
        if (isFocused && (form.nombre !== '' || form.descripcion !== '' || form.imagen_url !== '')) {
            setForm({ nombre: '', imagen_url: '', descripcion: '' });
        }
    }, [isFocused]);

    const selectImagen = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                alerta("Error", "Permiso no concedido");
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.2,
                base64: true,
            });

            if (!result.canceled) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setForm({ ...form, imagen_url: base64Image });
            }
        } catch (error) {
            console.error("Error al seleccioanr imagen: ", error);
        }
    };

    const agregarPersonaje = async () => {
        if (!form.nombre) {
            alerta("Error", "El nombre es un campo obligatorio");
            return;
        }

        try {
            const data = {
                idLibro: libroId,
                nombre: form.nombre,
                descripcion: form.descripcion || null,
                imagen_url: form.imagen_url || null
            }
            const respuesta = await nuevoPersonaje(data);
            if (respuesta.ok) {
                alerta("¡Éxito!", "Personaje agregado correctamente");
                navigation.goBack();
            } else {
                alerta("Error", "No se pudo guardar el personaje");
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
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.subContainer}>
                <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                    <Image source={form.imagen_url ? { uri: form.imagen_url } : require('../img/addimage.jpg')} style={styles.imagen} />
                </TouchableOpacity>

                <TextInput autoCorrect={false} style={styles.input} value={form.nombre} placeholder="*Nombre..." onChangeText={(txt) => setForm({ ...form, nombre: txt })} />
                <TextInput style={styles.inputLargo} multiline numberOfLines={4} value={form.descripcion} placeholder="Descripcion..." onChangeText={(txt) => setForm({ ...form, descripcion: txt })} />

                <TouchableOpacity style={styles.button} onPress={agregarPersonaje}>
                    <Text style={styles.buttonText}>Hecho</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 70,
        ...Platform.select({ ios: { paddingTop: 120 } }),
        backgroundColor: '#121212',
    },
    subContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagenConteiner: {
        margin: 20,
        borderRadius: 50,
        overflow: 'hidden',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#282828',
        borderRadius: 50,
        paddingHorizontal: 15,
        marginVertical: 15,
        color: 'white',
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        fontFamily: 'Roboto-Regular'
    },
    inputLargo: {
        width: '100%',
        backgroundColor: '#282828',
        borderRadius: 30,
        paddingHorizontal: 15,
        marginTop: 20,
        color: 'white',
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    button: {
        width: '50%',
        height: 50,
        backgroundColor: '#6868AC',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        marginTop: 30,
        textAlign: 'center',
        fontFamily: 'Roboto-Regular'
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        alignSelf: 'center',
        margin: 5,
        fontWeight: '500',
        fontFamily: 'Roboto-Regular'
    },
    icon: {
        padding: 5,
        paddingTop: 12,
    },
    imagen: {
        alignSelf: 'center',
        width: 200,
        height: 200,
    },
});