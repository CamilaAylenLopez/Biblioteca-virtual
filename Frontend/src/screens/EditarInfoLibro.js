import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { actualizarLibro, getLibrosById } from '../../api';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import DropdownSelect from 'react-native-input-select';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditarInfoLibro({ navigation, route }) {
    const { libroId } = route.params;
    const isFocused = useIsFocused();
    const [cargando, setCargando] = useState(true);
    const [libro, setLibro] = useState({
        titulo: '', autor: '', sinopsis: '', imagen_url: '', calificacion: '', lanzamiento: '', genero: ''
    });
    const [image, setImage] = useState('')
    const [error, setError] = useState(false);
    const [fecha, setFecha] = useState(new Date());
    const [mostrarCalendario, setMostrarCalendario] = useState(false);

    useEffect(() => {
        if (isFocused) {
            const cargarDatos = async () => {
                try {
                    const dataLibro = await getLibrosById(libroId);
                    setLibro(dataLibro)
                    setImage(dataLibro.imagen_url);
                } catch (error) {
                    console.error(error);
                } finally {
                    setCargando(false);
                }
            };
            cargarDatos();
        }
    }, [isFocused]);

    const onChangeFecha = (event, selectedDate) => {
        setMostrarCalendario(Platform.OS === 'ios');

        if(selectedDate){
            setFecha(selectedDate);

            const fechaFormateada = selectedDate.toIOSString().split('T')[0];
            setForm({...libro, lanzamiento: fechaFormateada});
        }
    };

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
                setLibro({ ...libro, imagen_url: base64Image });
            }
        } catch (error) {
            console.error("Error al seleccioanr imagen: ", error);
        }
    };

    const actualizar = async () => {
        setError(false);

        try {
            const respuesta = await actualizarLibro(libroId, { ...libro });
            if (respuesta.ok) {
                Alert.alert("¡Éxito!", "Libro actualizado correctamente");
                navigation.goBack();
            } else {
                setError(true);
                Alert.alert("Error", "No se pudo actualizar el libro");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!libro) return <Text style={{ color: 'white' }}>Cargando...</Text>;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                <Image source={{ uri: image }} style={styles.imagen} />
            </TouchableOpacity>

            <TextInput style={styles.input} value={libro.titulo} placeholder={libro.titulo} onChangeText={(txt) => setLibro({ ...libro, titulo: txt })} />
            <TextInput style={styles.input} value={libro.autor} placeholder={libro.autor} onChangeText={(txt) => setLibro({ ...libro, autor: txt })} />
            <TextInput style={styles.input} value={libro.sinopsis} placeholder={libro.sinopsis} onChangeText={(txt) => setLibro({ ...libro, sinopsis: txt })} />
            
            <TouchableOpacity style={styles.inputD} onPress={() => setMostrarCalendario(true)}>
                <Text style={styles.textoFecha}>
                    Elegir fecha de lanzamiento...
                </Text>
            </TouchableOpacity>
            {mostrarCalendario && (
                <DateTimePicker
                    value={fecha}
                    mode="date"
                    display="default"
                    onChange={onChangeFecha}
                    maximumDate={new Date()}
                />
            )}

            <DropdownSelect
                style={styles.drop}
                label=" "
                options={[
                    {
                        title: 'Generos...',
                        data: [
                            { label: 'Terror', value: 'Terror' },
                            { label: 'Romance', value: 'Romance' },
                            { label: 'Misterio', value: 'Misterio' },
                            { label: 'Parodia', value: 'Parodia' },
                            { label: 'Ficción', value: 'Ficción' },
                            { label: 'Contranovela', value: 'Contranovela' },
                            { label: 'Policial', value: 'Policial' },
                        ],
                    },
                ]}
                value={libro.genero}
                selectedValue={libro.genero}
                onValueChange={(value) => setLibro({ ...libro, genero: value })}
                isSearchable
                primaryColor={'#7D6461'}
                dropdownStyle={{
                    backgroundColor: '#7D6461',
                    borderColor: '#7D6461',
                    borderRadius: 50,
                }}
                dropdownIconStyle={{ color: 'white' }}
                dropdownPlaceholderStyle={{ color: 'white', }}
                placeholderStyle={{ color: 'white', fontSize: 16 }}
                selectedItemStyle={{ color: 'white' }}
            />

            <TouchableOpacity style={styles.button} onPress={actualizar}>
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
        backgroundColor: '#121212',
        marginTop: 50,
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
    drop: {
        backgroundColor: '#7D6461',
        fontSize: 16,
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
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#7D6461',
        borderRadius: 30,
        paddingHorizontal: 15,
        marginTop: 25,
        color: 'white',
        outlineStyle: 'none',
        fontSize: 16,
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
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        alignSelf: 'center',
        margin: 5,
        fontSize: 16,
    },
    link: {
        color: '#6868AC',
        marginTop: 50
    },
    error: {
        color: '#b91e1e',
        padding: 10,
        fontSize: 18,
        justifyContent: 'center',
    },
    inputD: {
        width: '100%',
        height: 50,
        backgroundColor: '#7D6461',
        borderRadius: 30,
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginTop: 25,
    },
    textoFecha:{
        color: 'white',
        fontSize: 16,
    },
    textoInput: {
        color: 'white',
        flex: 1,
        outlineStyle: 'none',
        fontSize: 16
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