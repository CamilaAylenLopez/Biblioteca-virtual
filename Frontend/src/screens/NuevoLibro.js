import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { nuevoLibro } from '../api/api';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';
import DropdownSelect from 'react-native-input-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function NuevoLibro({ navigation, setUsuarioLogueado }) {
    const isFocused = useIsFocused();
    const [form, setForm] = useState({
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
            setForm({ titulo: '', autor: '', sinopsis: '', imagen_url: null, calificacion: '', lanzamiento: '', genero: '' });
            setMostrarCalendario(false);
        }
    }, [isFocused]);

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
            setForm({ ...form, lanzamiento: fechaFormateada });
        }

        if (Platform.OS === 'android') {
            setMostrarCalendario(false);
        }
    };

    const onChangeFechaWeb = (txt) => {
        setForm({ ...form, lanzamiento: txt });
        if (txt) {
            const [year, month, day] = txt.split('-');
            setFecha(new Date(year, month - 1, day));
        }
    };

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
                aspect: [2, 3],
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

    const agregarLibro = async () => {
        if (!form.titulo || !form.autor || !form.genero) {
            alerta("Error", "Completa todos los campos");
            return;
        }

        const datosParaEnviar = {
            ...form,
            lanzamiento: form.lanzamiento === '' ? null : form.lanzamiento
        };

        try {
            const respuesta = await nuevoLibro(datosParaEnviar);
            if (respuesta && respuesta.ok) {
                alerta("¡Éxito!", "Libro agregado correctamente");
                navigation.navigate('Home');
            } else {
                alerta("Error", "No se pudo guardar el libro");
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableWithoutFeedback onPress={() => {
                    setMostrarCalendario(false);
                    Keyboard.dismiss();
                }}>
                    <View style={styles.subContainer}>
                        {/*SELECCIOANR IMAGEN*/}
                        <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                            <Image source={form.imagen_url ? { uri: form.imagen_url } : require('../img/addimage.jpg')} style={styles.imagen} />
                        </TouchableOpacity>

                        {/*INPUTS NORMALES*/}
                        <TextInput autoCorrect={false} style={styles.input} value={form.titulo} placeholder="*Titulo..." onChangeText={(txt) => setForm({ ...form, titulo: txt })} />
                        <TextInput autoCorrect={false} style={styles.input} value={form.autor} placeholder="*Autor..." onChangeText={(txt) => setForm({ ...form, autor: txt })} />
                        <TextInput style={styles.inputLargo} multiline numberOfLines={4} value={form.sinopsis} placeholder="Sinopsis..." onChangeText={(txt) => setForm({ ...form, sinopsis: txt })} />

                        {/*INPUT FECHA*/}
                        <View style={{ zIndex: 1, width: '100%' }}>
                            {Platform.OS === 'web' ? (
                                <View style={styles.inputD}>
                                    <TextInput type="date" value={form.lanzamiento} placeholder='YYYY-MM-DD' onChange={(e) => onChangeFechaWeb(e.target.value)} max={new Date().toISOString().split('T')[0]} style={styles.inputWeb} />
                                </View>
                            ) : (
                                <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                                    <View>
                                        <TouchableOpacity style={styles.inputD} onPress={() => setMostrarCalendario(!mostrarCalendario)}>
                                            <Text style={styles.textoFecha}> {form.lanzamiento ? `${form.lanzamiento}` : "Elegir fecha de lanzamiento"}</Text>

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
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            )}
                        </View>

                        {/*INPUT GENERO*/}
                        <DropdownSelect
                            label=" "
                            placeholder="*Elegir genero..."
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
                            value={form.genero}
                            selectedValue={form.genero}
                            onValueChange={(value) => setForm({ ...form, genero: value })}
                            isSearchable
                            primaryColor={'#282828'}
                            dropdownStyle={{
                                backgroundColor: '#282828',
                                borderColor: '#282828',
                                borderRadius: 50,
                            }}
                            dropdownIconStyle={{ color: 'white' }}
                            dropdownPlaceholderStyle={{ color: 'white', }}
                            placeholderStyle={{ color: '#afafaf', fontSize: 16 }}
                            selectedItemStyle={{ color: 'white', fontSize: 16 }}
                        />

                        {/*BOTON DE ACEPTAR*/}
                        <TouchableOpacity style={styles.button} onPress={agregarLibro}>
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
        paddingTop: 60,
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
        paddingTop: 15,
    },
    button: {
        width: '50%',
        height: 50,
        backgroundColor: '#6868AC',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        textAlign: 'center',
        fontFamily: 'Roboto-Regular',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        alignSelf: 'center',
        margin: 5,
        fontSize: 16,
        fontWeight: '500',
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
        color: '#afafaf',
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
        height: 200,
        resizeMode: 'cover',
    },
    contenedorCalendarioIOS: {
        borderRadius: 25,
        padding: 10,
        marginVertical: 5,
        width: '100%',
        backgroundColor: '#555555',
        paddingBottom: 20,
    },
    btnListoIOS: {
        marginTop: 5,
        backgroundColor: '#555555',
        borderRadius: 25,
        fontFamily: 'Roboto-Regular'
    },
    confirmarText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 5,
        fontFamily: 'Roboto-Regular'
    },
    inputWeb: {
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        fontSize: '16px',
        width: '100%',
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        cursor: 'pointer',
        fontFamily: 'Roboto-Regular'
    }
});