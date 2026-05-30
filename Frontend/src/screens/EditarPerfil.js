import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, Platform, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native';
import { actualizarPerfil, getUsuarioById } from '../api/api';
import { useIsFocused } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function EditarPerfil({ navigation, route, setUsuarioLogueado }) {
    const { id } = route.params;
    const [nuevosDatos, setNuevosDatos] = useState({
        nombre: '', apellido: '', nombreUsuario: '', email: '', fecha_nacimiento: '', descripcion: '', foto_perfil: ''
    });
    const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const isFocused = useIsFocused();
    const [cargando, setCargando] = useState(true);
    const [fecha, setFecha] = useState(new Date());

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
        if (isFocused) {
            const cargarDatos = async () => {
                try {
                    const datosUsuario = await getUsuarioById(id);
                    setNuevosDatos(datosUsuario);

                    if (datosUsuario.fecha_nacimiento) {
                        const [year, month, day] = datosUsuario.fecha_nacimiento.split('-');
                        setFecha(new Date(year, month - 1, day));
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
        };
    }, [isFocused]);

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
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
                aspect: [1, 1],
                quality: 0.2,
                base64: true,
            });

            if (!result.canceled) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setNuevosDatos({ ...nuevosDatos, foto_perfil: base64Image });
            }
        } catch (error) {
            console.error("Error al seleccionar imagen: ", error);
        }
    };

    const actualizar = async () => {
        if (!validarEmail(nuevosDatos.email)) {
            alerta("¡Error!", "El email no es valido");
            return;
        }

        try {
            const respuesta = await actualizarPerfil(id, { ...nuevosDatos });
            if (respuesta && respuesta.ok) {

                const usuarioActualizado = {
                    id: id,
                    nombre: nuevosDatos.nombre,
                    apellido: nuevosDatos.apellido,
                    nombreUsuario: nuevosDatos.nombreUsuario,
                    email: nuevosDatos.email,
                    fecha_nacimiento: nuevosDatos.fecha_nacimiento,
                    descripcion: nuevosDatos.descripcion,
                    foto_perfil: nuevosDatos.foto_perfil ? nuevosDatos.foto_perfil : ""
                };

                await AsyncStorage.setItem('@usuario_sesion', JSON.stringify(usuarioActualizado));
                alerta("Éxito", "Perfil actualizado correctamente.")
                navigation.goBack();
            } else {
                alerta("Error", "No se ha podido actualizar el perfil.");
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
            setNuevosDatos({ ...nuevosDatos, fecha_nacimiento: fechaFormateada });
        }

        if (Platform.OS === 'android') {
            setMostrarCalendario(false);
        }
    };

    const onChangeFechaWeb = (txt) => {
        setNuevosDatos({ ...nuevosDatos, fecha_nacimiento: txt });
        if (txt) {
            const [year, month, day] = txt.split('-');
            setFecha(new Date(year, month - 1, day));
        }
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!nuevosDatos) return <Text style={{ color: 'white' }}>Cargando...</Text>;

    const Formulario = (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.subContainer}>
                {/*SELECCIONAR IMAGEN*/}
                <TouchableOpacity style={styles.imagenContainer} onPress={selectImagen}>
                    <Image source={nuevosDatos.foto_perfil ? { uri: nuevosDatos.foto_perfil } : require('../img/addimage.jpg')} style={styles.imagen} />
                </TouchableOpacity>

                {/*INPUT NORMALES*/}
                <TextInput autoCorrect={false} style={styles.input} value={nuevosDatos.nombre} placeholder="Agregar nombre" onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, nombre: txt })} />
                <TextInput autoCorrect={false} style={styles.input} value={nuevosDatos.apellido} placeholder="Agregar apellido" onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, apellido: txt })} />
                <TextInput autoCapitalize="none" autoCorrect={false} style={styles.input} value={nuevosDatos.nombreUsuario} placeholder="Agregar nombre de usuario" onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, nombreUsuario: txt })} />
                <TextInput autoCapitalize="none" autoCorrect={false} style={styles.input} value={nuevosDatos.email} placeholder="Agregar email" onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, email: txt })} />
                <TextInput autoCorrect={false} style={styles.inputLargo} multiline numberOfLines={4} value={nuevosDatos.descripcion} placeholder="Agregar descripcion" onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, descripcion: txt })} />

                {/*INPUT FECHA*/}
                <View style={{ zIndex: 1, width: '100%', marginVertical: 5 }}>
                    {Platform.OS === 'web' ? (
                        <View style={styles.inputD}>
                            <TextInput type="date" value={nuevosDatos.fecha_nacimiento} placeholder='YYYY-MM-DD' onChange={(e) => onChangeFechaWeb(e.target.value)} max={new Date().toISOString().split('T')[0]} style={styles.inputWeb} />
                        </View>
                    ) : (
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View>
                                <TouchableOpacity style={styles.inputD} onPress={() => setMostrarCalendario(!mostrarCalendario)}>
                                    <Text style={styles.textoFecha}>{nuevosDatos.fecha_nacimiento ? `${nuevosDatos.fecha_nacimiento}` : "Elegir fecha de nacimiento..."}</Text>
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

                {/*BOTON ACEPTAR*/}
                <TouchableOpacity style={styles.button} onPress={actualizar}>
                    <Text style={styles.buttonText}>Hecho</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

            {Platform.OS === 'web' ? (
                Formulario
            ) : (
                <TouchableWithoutFeedback onPress={() => {
                    setMostrarCalendario(false);
                    Keyboard.dismiss();
                }}>
                    {Formulario}
                </TouchableWithoutFeedback>
            )}
        </KeyboardAvoidingView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 70,
        ...Platform.select({ ios: { paddingTop: 130 } }),
        backgroundColor: '#121212',
    },
    subContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagenContainer: {
        margin: 10,
        width: 200,
        height: 200,
        borderRadius: 100,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#282828',
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
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 100,
    },
    contenedorCalendarioIOS: {
        borderRadius: 25,
        padding: 10,
        marginVertical: 5,
        width: '100%',
        backgroundColor: '#282828',
        paddingBottom: 20,
    },
    btnListoIOS: {
        marginTop: 5,
        backgroundColor: '#282828',
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
    },
});