import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { actualizarPersonaje, getPersonajeById } from '../../api';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import DropdownSelect from 'react-native-input-select';

export default function EditarInfoPersonaje({ navigation, route }) {
    const { personajeId } = route.params;
    const isFocused = useIsFocused();
    const [cargando, setCargando] = useState(true);
    const [personaje, setPersonaje] = useState({
        nombre: '', imagen_url: '', descripcion: ''
    });
    const [image, setImage] = useState('')

    useEffect(() => {
        if (isFocused) {
            const cargarDatos = async () => {
                try {
                    const dataPersonaje = await getPersonajeById(personajeId);
                    setPersonaje(dataPersonaje)
                    setImage(dataPersonaje.imagen_url);
                } catch (error) {
                    console.error(error);
                } finally {
                    setCargando(false);
                }
            };
            cargarDatos();
        }
    }, [isFocused]);

    const selectImagen = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert("Permiso no concedido");
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [2, 3],
                quality: 0.2,
                base64: true,
            });

            if (!result.canceled) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setImage(base64Image);
                setPersonaje({ ...personaje, imagen_url: base64Image });
            }
        } catch (error) {
            console.error("Error al seleccioanr imagen: ", error);
        }
    };

    const actualizar = async () => {

        try {
            const respuesta = await actualizarPersonaje(personajeId, { ...personaje });
            if (respuesta.ok) {
                Alert.alert("¡Éxito!", "Personaje actualizado correctamente");
                navigation.goBack();
            } else {
                Alert.alert("Error", "No se pudo actualizar los datos del personaje");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!personaje) return <Text style={{ color: 'white' }}>Cargando...</Text>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.subContainer}>
                <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                    <Image source={{ uri: image }} style={styles.imagen} />
                </TouchableOpacity>

                <TextInput style={styles.input} value={personaje.nombre} placeholder={personaje.nombre} onChangeText={(txt) => setPersonaje({ ...personaje, nombre: txt })} />
                <TextInput style={styles.input} value={personaje.descripcion} placeholder={personaje.descripcion} onChangeText={(txt) => setPersonaje({ ...personaje, descripcion: txt })} />

                <TouchableOpacity style={styles.button} onPress={actualizar}>
                    <Text style={styles.buttonText}>Hecho</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 80,
        marginTop: 50,
        backgroundColor: '#121212',
    },
    subContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagenConteiner: {
        margin: 20,
        borderRadius: 50,
    },
    button: {
        width: '50%',
        height: 50,
        backgroundColor: '#282828',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        marginTop: 10,
        textAlign: 'center',
        fontWeight: '500'
    },
    drop: {
        backgroundColor: '#282828',
        fontSize: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        alignSelf: 'center',
        margin: 5,
        fontFamily: 'Roboto-Regular'
    },
    titulo: {
        fontSize: 35,
        marginBottom: 40,
        textAlign: 'center',
        fontFamily: 'Roboto-Bold'
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#282828',
        borderRadius: 30,
        paddingHorizontal: 15,
        marginTop: 25,
        color: 'white',
        outlineStyle: 'none',
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    button: {
        width: '50%',
        height: 50,
        backgroundColor: '#282828',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        marginTop: 10,
        textAlign: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        alignSelf: 'center',
        margin: 5,
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    link: {
        color: '#6868AC',
        marginTop: 50,
        fontFamily: 'Roboto-Regular'
    },
    error: {
        color: '#b91e1e',
        padding: 10,
        fontSize: 18,
        justifyContent: 'center',
        fontFamily: 'Roboto-Regular'
    },
    inputD: {
        flexDirection: 'row',
        width: '100%',
        height: 50,
        backgroundColor: '#282828',
        borderRadius: 50,
        paddingHorizontal: 15,
        marginBottom: 15,
        color: 'white',
        outlineStyle: 'none',
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    textoInput: {
        color: 'white',
        flex: 1,
        outlineStyle: 'none',
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    icon: {
        padding: 5,
        paddingTop: 12,
    },
    imagen: {
        alignSelf: 'center',
        width: 200,
        height: 300,
    },
});