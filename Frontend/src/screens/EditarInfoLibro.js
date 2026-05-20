import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
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
    const [image, setImage] = useState()
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


    const selectImagen = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                if (Platform.OS === 'web') {
                    alert("Permiso no concedido");
                } else {
                    Alert.alert("Error", "Permiso no concedido");
                }
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
                if (Platform.OS === 'web') {
                    alert("¡Éxito!", "Libro actualizado correctamente");
                } else {
                    Alert.alert("¡Éxito!", "Libro actualizado correctamente");
                }
                navigation.goBack();
            } else {
                setError(true);
                if (Platform.OS === 'web') {
                    alert("Error", "No se pudo actualizar el libro");
                } else {
                    Alert.alert("Error", "No se pudo actualizar el libro");
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onChangeFecha = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setMostrarCalendario(false);
            return;
        }

        if (selectedDate) {
            setFecha(selectedDate);

            const anio = selectedDate.getFullYear();
            const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dia = String(selectedDate.getDate()).padStart(2, '0');

            const fechaFormateada = `${anio}-${mes}-${dia}`;
            setLibro({ ...libro, lanzamiento: fechaFormateada });
        }

        if (Platform.OS === 'android') {
            setMostrarCalendario(false);
        }
    };

    const onChangeFechaWeb = (txt) => {
        setLibro({ ...libro, lanzamiento: txt });
        if (txt) {
            const [year, month, day] = txt.split('-');
            setFecha(new Date(year, month - 1, day));
        }
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!libro) return <Text style={{ color: 'white' }}>Cargando...</Text>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.subContainer}>
                {/*SELECCIONAR IMAGEN*/}
                <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                    <Image source={image ? { uri: image } : require('../img/addimage.jpg')} style={styles.imagen} />
                </TouchableOpacity>

                {/*INPUT NORMALES*/}
                <TextInput style={styles.input} value={libro.titulo} placeholder={libro.titulo} onChangeText={(txt) => setLibro({ ...libro, titulo: txt })} />
                <TextInput style={styles.input} value={libro.autor} placeholder={libro.autor} onChangeText={(txt) => setLibro({ ...libro, autor: txt })} />
                <TextInput style={styles.input} value={libro.sinopsis} placeholder={libro.sinopsis} onChangeText={(txt) => setLibro({ ...libro, sinopsis: txt })} />

                {/*INPUT FECHA*/}
                <View style={{ zIndex: 1, width: '100%', marginVertical: 5 }}>
                    {Platform.OS === 'web' ? (
                        <View style={styles.inputD}>
                            <TextInput type="date" value={libro.lanzamiento} placeholder='YYYY-MM-DD' onChange={(e) => onChangeFechaWeb(e.target.value)} max={new Date().toISOString().split('t')[0]} style={styles.inputWeb} />
                        </View>
                    ) : (
                        <View>
                            <TouchableOpacity style={styles.inputD} onPress={() => setMostrarCalendario(!mostrarCalendario)}>
                                <Text style={styles.textoFecha}>
                                    {libro.lanzamiento ? `${libro.lanzamiento}` : "Elegir fecha de lanzmaiento..."}
                                </Text>

                                {mostrarCalendario && (
                                    <View style={Platform.OS === 'ios' ? styles.contenedorCalendarioIOS : null}>
                                        <DateTimePicker
                                            value={fecha}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={onChangeFecha}
                                            maximumDate={new Date()}
                                            locale="es-ES"
                                        />


                                        {Platform.OS === 'ios' && (
                                            <TouchableOpacity style={styles.btnListoIOS} onPress={() => setMostrarCalendario(false)}>
                                                <Text style={styles.confirmarText}>Confirmar fecha</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/*INPUT GENERO*/}
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
                                { label: 'No Ficción', value: 'No Ficción' },
                                { label: 'Contranovela', value: 'Contranovela' },
                                { label: 'Aventura', value: 'Aventura' },
                                { label: 'Historia', value: 'Historia' },
                                { label: 'Policial', value: 'Policial' },
                                { label: 'Fantasía', value: 'Fantasía' },
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

                {/*BOTON ACEPTAR*/}
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
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500'
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
    textoFecha: {
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
        height: 200,
    },
    contenedorCalendarioIOS: {
        borderRadius: 25,
        padding: 10,
        marginVertical: 5,
        width: '100%',
        backgroundColor: '#63504e',
        paddingBottom: 20,
    },
    btnListoIOS: {
        marginTop: 5,
        backgroundColor: '#63504e',
        borderRadius: 25,
    },
    confirmarText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 5
    },
    inputWeb: {
        background: 'transparent',
        color: 'white',
        border: 'none',
        fontSize: '16px',
        width: '100%',
        outlineStyle: 'none',
        cursor: 'pointer'
    },
});