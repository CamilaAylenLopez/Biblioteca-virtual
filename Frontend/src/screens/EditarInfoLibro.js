import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, TextInput, Platform, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { actualizarLibro, getLibrosById } from '../api/api';
import * as ImagePicker from 'expo-image-picker';
import DropdownSelect from 'react-native-input-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function EditarInfoLibro({ navigation, route, setUsuarioLogueado }) {
    const { libroId } = route.params;
    const isFocused = useIsFocused();
    const [cargando, setCargando] = useState(true);
    const [libro, setLibro] = useState({
        titulo: '', autor: '', sinopsis: '', imagen_url: '', calificacion: '', lanzamiento: '', genero: ''
    });
    const [fecha, setFecha] = useState(new Date());
    const [mostrarCalendario, setMostrarCalendario] = useState(false);

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
            setMostrarCalendario(false);
            const cargarDatos = async () => {
                try {
                    const dataLibro = await getLibrosById(libroId);
                    setLibro(dataLibro)

                    if (dataLibro.lanzamiento && typeof dataLibro.lanzamiento === 'string') {
                        const partes = dataLibro.lanzamiento.split('-');
                        if (partes.length === 3) {
                            const [year, month, day] = partes;
                            setFecha(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
                        }
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
                alerta("Error", "Permiso no concedido");
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 3],
                quality: 0.2,
                base64: true,
            });

            if (!result.canceled) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setLibro({ ...libro, imagen_url: base64Image });
            }
        } catch (error) {
            console.error("Error al seleccionar imagen: ", error);
        }
    };

    const actualizar = async () => {
        try {
            const respuesta = await actualizarLibro(libroId, { ...libro });
            if (respuesta && respuesta.ok) {
                alerta("¡Éxito!", "Libro actualizado correctamente");
                navigation.goBack();
            } else {
                alerta("Error", "No se pudo actualizar el libro");
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
                alerta("Error", "Ocurrió un error inesperado.");
            }
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
            const partes = txt.split('-');
            if (partes.length === 3) {
                const [year, month, day] = partes;
                setFecha(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
            }
        }
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!libro) return <Text style={{ color: 'white' }}>Cargando...</Text>;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView style={{flexGrow: 1,}} showsVerticalScrollIndicator={false}>
                <TouchableWithoutFeedback onPress={() => {
                    setMostrarCalendario(false);
                    Keyboard.dismiss();
                }}>
                    <View style={styles.subContainer}>
                        {/*SELECCIONAR IMAGEN*/}
                        <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                            <Image source={libro.imagen_url ? { uri: libro.imagen_url } : require('../img/addimage.jpg')} style={styles.imagen} />
                        </TouchableOpacity>

                        {/*INPUT NORMALES*/}
                        <TextInput style={styles.input} value={libro.titulo} placeholder="Titulo..." onChangeText={(txt) => setLibro({ ...libro, titulo: txt })} />
                        <TextInput style={styles.input} value={libro.autor} placeholder="Autor..." onChangeText={(txt) => setLibro({ ...libro, autor: txt })} />
                        <TextInput style={styles.inputLargo} multiline numberOfLines={4} value={libro.sinopsis} placeholder="Sinopsis..." onChangeText={(txt) => setLibro({ ...libro, sinopsis: txt })} />

                        {/*INPUT FECHA*/}
                        <View style={{ zIndex: 1, width: '100%', marginVertical: 5 }}>
                            {Platform.OS === 'web' ? (
                                <View style={styles.inputD}>
                                    <TextInput type="date" value={libro.lanzamiento || ''} placeholder='YYYY-MM-DD' onChange={(e) => onChangeFechaWeb(e.target.value)} max={new Date().toISOString().split('T')[0]} style={styles.inputWeb} />
                                </View>
                            ) : (
                                <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                                    <View>
                                        <TouchableOpacity style={styles.inputD} onPress={() => setMostrarCalendario(!mostrarCalendario)}>
                                            <Text style={styles.textoFecha}>
                                                {libro.lanzamiento ? `${libro.lanzamiento}` : "Elegir fecha de lanzmaiento..."}
                                            </Text>
                                        </TouchableOpacity>

                                            {mostrarCalendario && (
                                                <View style={Platform.OS === 'ios' ? styles.contenedorCalendarioIOS : null}>
                                                    <DateTimePicker
                                                        value={fecha}
                                                        mode="date"
                                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                        onChange={onChangeFecha}
                                                        maximumDate={new Date()}
                                                        locale="es-ES"
                                                        style={{ height: 180, width: '100%' }}
                                                    />

                                                    {Platform.OS === 'ios' && (
                                                        <TouchableOpacity style={styles.btnListoIOS} onPress={() => setMostrarCalendario(false)}>
                                                            <Text style={styles.confirmarText}>Confirmar fecha</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            )}
                                    </View>
                                </TouchableWithoutFeedback>
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
                            primaryColor={'#282828'}
                            dropdownStyle={{
                                backgroundColor: '#282828',
                                borderColor: '#282828',
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
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
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
        marginTop: 20,
        height: 300,
        width: 460,
    },
    button: {
        width: '50%',
        height: 50,
        backgroundColor: '#6868AC',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        marginTop: 10,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500'
    },
    drop: {
        backgroundColor: '#282828',
        fontSize: 16,
    },
    titulo: {
        fontSize: 35,
        marginBottom: 40,
        textAlign: 'center',
        fontFamily: 'Roboto-bold'
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#282828',
        borderRadius: 30,
        paddingHorizontal: 15,
        marginTop: 25,
        color: 'white',
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    inputLargo: {
        width: '100%',
        backgroundColor: '#282828',
        borderRadius: 30,
        paddingHorizontal: 15,
        marginTop: 25,
        color: 'white',
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 15,
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
        width: '100%',
        height: 50,
        backgroundColor: '#282828',
        borderRadius: 30,
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginTop: 25,
        fontFamily: 'Roboto-Regular'
    },
    textoFecha: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    textoInput: {
        color: 'white',
        flex: 1,
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    icon: {
        padding: 5,
        paddingTop: 12,
    },
    imagen: {
        alignSelf: 'center',
        resizeMode: 'cover',
        width: '60%',
        height: 300,
    },
    contenedorCalendarioIOS: {
        borderRadius: 25,
        padding: 10,
        marginVertical: 5,
        width: '100%',
        backgroundColor: '#555555',
        paddingBottom: 20,
        fontFamily: 'Roboto-Regular'
    },
    btnListoIOS: {
        marginTop: 5,
        backgroundColor: '#555555',
        borderRadius: 25,
        fontFamily: 'Roboto-Regular'
    },
    confirmarText: {
        color: 'white',
        textAlign: 'center',
        padding: 5,
        fontFamily: 'Roboto-Bold'
    },
    inputWeb: {
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: 16,
        width: '100%',
        ...Platform.select({
            web: { outlineStyle: 'none' },
        }),
    },
});