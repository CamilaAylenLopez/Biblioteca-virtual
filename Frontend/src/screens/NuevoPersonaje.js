import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { nuevoPersonaje } from '../../api';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';

export default function NuevoPersonaje({ navigation, route }) {
    const isFocused = useIsFocused();
    const { libroId } = route.params;
    const [form, setForm] = useState({
        nombre: '', imagen_url: '', descripcion: ''
    });
    const [error, setError] = useState(false);
    const [image, setImage] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_9_Be_6mJ68U7QIl53UBCB1NCfLQuPWkviw&s');

    useEffect(() => {
        if (isFocused) {
            setForm({ nombre: '', imagen_url: '', descripcion: '' });
            setImage('https://static.vecteezy.com/system/resources/thumbnails/056/202/171/small/add-image-or-photo-icon-vector.jpg');
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
                setForm({ ...form, imagen_url: base64Image });
            }
        } catch (error) {
            console.error("Error al seleccioanr imagen: ", error);
        }
    };

    const agregarPersonaje = async () => {
        setError(false);
        if (!form.nombre) {
            Alert.alert("Error", "El nombre es un campo obligatorio");
            return;
        }

        try {
            console.log("Tamaño del Base64:", image.length);
            const data = {
                idLibro: libroId,
                nombre: form.nombre,
                descripcion: form.descripcion,
                imagen_url: image
            }
            const respuesta = await nuevoPersonaje(data);
            if (respuesta.ok) {
                Alert.alert("¡Éxito!", "Personaje agregado correctamente");
                navigation.goBack();
            } else {
                setError(true);
                Alert.alert("Error", "No se pudo guardar el personaje");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.subContainer}>
                <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                    <Image source={{ uri: image }} style={styles.imagen} />
                </TouchableOpacity>

                <TextInput style={styles.input} value={form.nombre} placeholder="Nombre*" onChangeText={(txt) => setForm({ ...form, nombre: txt })} />
                <TextInput style={styles.input} value={form.descripcion} placeholder="Descripcion" onChangeText={(txt) => setForm({ ...form, descripcion: txt })} />

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
        paddingTop: 80,
        fontFamily: 'roboto',
        marginTop: 50,
        backgroundColor: '#121212',
    },
    subContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'roboto',
    },
    imagenConteiner: {
        margin: 20,
        borderRadius: 50,
    },
    button: {
        width: '50%',
        height: 50,
        backgroundColor: '#7D6461',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        marginTop: 10,
        textAlign: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        alignSelf: 'center',
        margin: 5,
    },
    titulo: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    subtitulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    textoContrasena: {
        paddingTop: 0,
        marginTop: 0,
        fontSize: 13,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#7D6461',
        borderRadius: 50,
        paddingHorizontal: 15,
        marginBottom: 15,
        color: 'white',
        outlineStyle: 'none',
    },
    button: {
        width: '50%',
        height: 50,
        backgroundColor: '#7D6461',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        marginTop: 10,
        textAlign: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        alignSelf: 'center',
        margin: 5,
        fontWeight: '500'
    },
    link: {
        color: '#6868AC',
        marginTop: 50
    },
    error: {
        color: '#f00',
        padding: 10,
        fontSize: 18,
        justifyContent: 'center',
    },
    inputD: {
        flexDirection: 'row',
        width: '100%',
        height: 50,
        backgroundColor: '#7D6461',
        borderRadius: 50,
        paddingHorizontal: 15,
        marginBottom: 15,
        color: 'white',
        outlineStyle: 'none',
    },
    textoInput: {
        color: 'white',
        flex: 1,
        outlineStyle: 'none',
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