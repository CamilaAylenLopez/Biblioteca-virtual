import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { nuevoLibro } from '../../api';
import { TextInput } from 'react-native-web';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

export default function NuevoPersonaje({ navigation }) {
    const [form, setForm] = useState({
        titulo: '', autor: '', sinopsis: '', imagen_url: '', calificacion: '', lanzamiento: '', genero: ''
    });
    const [error, setError] = useState(false);
    const [image, setImage] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_9_Be_6mJ68U7QIl53UBCB1NCfLQuPWkviw&s');

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
                quality: 1,
            });

            if (!result.canceled) {
                const path = result.assets[0].uri;
                setImage(path);
            }
        }catch(error){
            console.error("Error al seleccioanr imagen: ", error);
        }
    };

    const agregarLibro = async () => {
        setError(false);
        if (!form.titulo || !form.autor || !form.genero) {
            Alert.alert("Error", "Completa todos los campos");
            return;
        }

        try {
            const respuesta = await nuevoLibro({ ...form, imagen_url: image });
            if (respuesta.ok) {
                Alert.alert("¡Éxito!", "Libro agregado correctamente");
                navigation.navigate('Home');
            } else {
                setError(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                <Image source={{ uri: image }} style={styles.imagen} />
            </TouchableOpacity>

            <TextInput style={styles.input} placeholder="Titulo" onChangeText={(txt) => setForm({ ...form, titulo: txt })} />
            <TextInput style={styles.input} placeholder="Autor" onChangeText={(txt) => setForm({ ...form, autor: txt })} />
            <TextInput style={styles.input} placeholder="Sinopsis" onChangeText={(txt) => setForm({ ...form, sinopsis: txt })} />
            <TextInput style={styles.input} placeholder="LanLanzamiento" onChangeText={(txt) => setForm({ ...form, lanzamiento: txt })} />
            <TextInput style={styles.input} placeholder="Genero" onChangeText={(txt) => setForm({ ...form, genero: txt })} />

            <TouchableOpacity style={styles.button} onPress={agregarLibro}>
                <Text style={styles.buttonText}>Hecho</Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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