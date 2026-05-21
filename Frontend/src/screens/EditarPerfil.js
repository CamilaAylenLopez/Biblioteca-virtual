import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, Platform } from 'react-native';
import { actualizarPerfil, getUsuarioById, nuevoLibro } from '../../api';
import { useIsFocused } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditarPerfil({ navigation, route }) {
    const { id } = route.params;
    const [nuevosDatos, setNuevosDatos] = useState({
        nombre: '', apellido: '', nombreUsuario: '', email: '', fecha_nacimiento: '', descripcion: '', foto_perfil: ''
    });
    const [image, setImage] = useState()
    const [error, setError] = useState(false);
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

    useEffect(() => {
        if (isFocused) {
            const cargarDatos = async () => {
                try {
                    const datosUsuario = await getUsuarioById(id);
                    console.log(datosUsuario);
                    setNuevosDatos(datosUsuario);

                    if (datosUsuario.fecha_nacimiento) {
                        const [year, month, day] = datosUsuario.fecha_nacimiento.split('-');
                        setFecha(new Date(year, month - 1, day));
                    };

                } catch (error) {
                    console.error(error);
                } finally {
                    setCargando(false);
                }
            };
            cargarDatos();
        };
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
        setError(false);

        try {
            const respuesta = await actualizarPerfil(id, { ...nuevosDatos });
            if (respuesta.ok) {

                const usuarioActualizado = {
                    id: id,
                    nombre: nuevosDatos.nombre,
                    apellido: nuevosDatos.apellido,
                    nombreUsuario: nuevosDatos.nombreUsuario,
                    email: nuevosDatos.email,
                    fecha_nacimiento: nuevosDatos.fecha_nacimiento,
                    descripcion: nuevosDatos.descripcion,
                    foto_perfil: nuevosDatos.foto_perfil
                };

                await AsyncStorage.setItem('@usuario_sesion', JSON.stringify(usuarioActualizado));

                alerta("Éxito", "Perfil actualizado correctamente.")

                navigation.goBack();
            } else {
                setError(true);
                alerta("Error", respuesta.data.error);
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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.subContainer}>
                {/*SELECCIONAR IMAGEN*/}
                <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                    <Image source={nuevosDatos.foto_perfil ? { uri: nuevosDatos.foto_perfil } : require('../img/addimage.jpg')} style={styles.imagen} />
                </TouchableOpacity>

                {/*INPUT NORMALES*/}
                <TextInput style={styles.input} value={nuevosDatos.nombre} placeholder={nuevosDatos.nombre} onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, nombre: txt })} />
                <TextInput style={styles.input} value={nuevosDatos.apellido} placeholder={nuevosDatos.apellido} onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, apellido: txt })} />
                <TextInput style={styles.input} value={nuevosDatos.nombreUsuario} placeholder={nuevosDatos.nombreUsuario} onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, nombreUsuario: txt })} />
                <TextInput style={styles.input} value={nuevosDatos.email} placeholder={nuevosDatos.email} onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, email: txt })} />
                <TextInput style={styles.input} value={nuevosDatos.descripcion} placeholder={nuevosDatos.descripcion} onChangeText={(txt) => setNuevosDatos({ ...nuevosDatos, descripcion: txt })} />

                {/*INPUT FECHA*/}
                <View style={{ zIndex: 1, width: '100%', marginVertical: 5 }}>
                    {Platform.OS === 'web' ? (
                        <View style={styles.inputD}>
                            <TextInput type="date" value={nuevosDatos.fecha_nacimiento} placeholder='YYYY-MM-DD' onChange={(e) => onChangeFechaWeb(e.target.value)} max={new Date().toISOString().split('t')[0]} style={styles.inputWeb} />
                        </View>
                    ) : (
                        <View>
                            <TouchableOpacity style={styles.inputD} onPress={() => setMostrarCalendario(!mostrarCalendario)}>
                                <Text style={styles.textoFecha}>
                                    {nuevosDatos.fecha_nacimiento ? `${nuevosDatos.fecha_nacimiento}` : "Elegir fecha de lanzmaiento..."}
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
        paddingTop: 50,
        marginTop: 50,
        backgroundColor: '#121212',
    },
    subContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagenConteiner: {
        margin: 10,
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
        borderRadius: 100,
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
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        fontSize: '16px',
        width: '100%',
        outlineStyle: 'none',
        cursor: 'pointer'
    },
});