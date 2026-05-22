import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, ScrollView, Platform } from 'react-native';
import { registrarUsuario } from '../../api';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CrearUsuario({ navigation, setUsuarioLogueado }) {
    const [form, setForm] = useState({
        nombre: '', apellido: '', nombreUsuario: '', email: '', password: ''
    });
    const [error, setError] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [mostrarPassword, setmostrarPassword] = useState(false);
    const [mostrarPasswordD, setmostrarPasswordD] = useState(false);

    const validarContra = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[!?/()@#$%^&*.,_-]).{8,}$/;
        return regex.test(password);
    }
    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const handleRegistro = async () => {
        setError(false);
        if (!form.nombreUsuario || !form.password || !form.email) {
            if (Platform.OS === 'web') {
                alert("Faltan completar campos");
            } else {
                Alert.alert("Error", "Faltan completar campos");
            }
            return;
        }

        if (!validarEmail(form.email)) {
            setError(true);
            setMensaje("El email no es valido");
            return;
        }

        if (!validarContra(form.password)) {
            setError(true);
            setMensaje(
                "La contraseña debe tener:\n" +
                "- Al menos 8 caracteres\n" +
                "- Una letra mayuscula\n" +
                "- Un caracter esecial (ej: !, @, #, $)"
            );
            return;
        }

        if (form.password !== form.conformarPassword) {
            setError(true);
            setMensaje("Las constraseñas no coinciden");
            return;
        }

        try {
            const respuesta = await registrarUsuario(form);
            if (respuesta.ok) {
                if (respuesta.data.usuario) {
                    await AsyncStorage.setItem(
                        '@usuario_sesion',
                        JSON.stringify(respuesta.data.usuario)
                    );
                }
                const horaActual = Date.now().toString();
                await AsyncStorage.setItem('@hora_login', horaActual);
                setUsuarioLogueado(true);

                if (Platform.OS === 'web') {
                    alert(respuesta.data.mensaje);
                } else {
                    Alert.alert("¡Éxito!", respuesta.data.mensaje);
                }
            } else {
                setError(true);
                setMensaje(respuesta.data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.subContainer}>

                <Text style={styles.titulo}>Bienvenido a tu nueva biblioteca virtual</Text>
                <Text style={styles.subtitulo}>Craer usuario</Text>

                <TextInput style={styles.input} placeholder="Nombre..." onChangeText={(txt) => setForm({ ...form, nombre: txt })} />
                <TextInput style={styles.input} placeholder="Nombre de Usuario..." onChangeText={(txt) => setForm({ ...form, nombreUsuario: txt })} />
                <TextInput style={styles.input} placeholder="Email..." onChangeText={(txt) => setForm({ ...form, email: txt })} />

                <View style={styles.inputD}>
                    <TextInput style={styles.textoInput} onChangeText={(txt) => setForm({ ...form, password: txt })} placeholder="Contraseña..." secureTextEntry={!mostrarPassword} />
                    <TouchableOpacity style={styles.icon} onPress={() => setmostrarPassword(!mostrarPassword)} >
                        <Entypo name={mostrarPassword ? 'eye-with-line' : 'eye'} size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputD}>
                    <TextInput style={styles.textoInput} onChangeText={(txt) => setForm({ ...form, conformarPassword: txt })} placeholder="Confirmar contraseña..." secureTextEntry={!mostrarPasswordD} />
                    <TouchableOpacity style={styles.icon} onPress={() => setmostrarPasswordD(!mostrarPasswordD)} >
                        <Entypo name={mostrarPasswordD ? 'eye-with-line' : 'eye'} size={24} color="white" />
                    </TouchableOpacity>
                </View>


                {error ? <Text style={styles.error}>{mensaje}</Text> : null}

                <TouchableOpacity onPress={handleRegistro} style={styles.button}>
                    <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>¿Ya tienes una cuenta creada? Iniciar sesión.</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#8E7960',
    },
    subContainer: {
        backgroundColor: '#DBD3CF',
        marginVertical: 40,
        marginHorizontal: 30,
        paddingTop: 70,
        paddingHorizontal: 30,
        minHeight: 340,
        Width: 600,
        height: 800,
        borderRadius: 50,
        alignSelf: 'center',
    },
    titulo: {
        fontSize: 35,
        fontFamily: 'Roboto-Bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    subtitulo: {
        fontSize: 24,
        fontFamily: 'Roboto-Bold',
        marginBottom: 40,
        textAlign: 'center',
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
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
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
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    link: {
        color: '#6868AC',
        marginTop: 30,
        marginBottom: 20,
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
        backgroundColor: '#7D6461',
        borderRadius: 50,
        paddingHorizontal: 15,
        marginBottom: 15,
        color: 'white',
        outlineStyle: 'none',
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
});