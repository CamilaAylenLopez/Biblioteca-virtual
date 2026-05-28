import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { registrarUsuario } from '../api/api';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function CrearUsuario({ navigation, setUsuarioLogueado }) {
    const [form, setForm] = useState({
        nombre: '', apellido: '', nombreUsuario: '', email: '', password: '', conformarPassword: ''
    });
    const [mostrarPassword, setmostrarPassword] = useState(false);
    const [mostrarPasswordD, setmostrarPasswordD] = useState(false);

    const alerta = (titulo, mensaje) => {
        if (Platform.OS === 'web') {
            alert(mensaje)
        } else {
            Alert.alert(titulo, mensaje)
        }
    };

    const validarContra = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[!?/()@#$%^&*.,_-¿¡=<>]).{8,}$/;
        return regex.test(password);
    };

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleRegistro = async () => {
        if (!form.nombreUsuario || !form.nombre || !form.password || !form.email) {
            alerta("¡Error!", "Faltan completar campos");
            return;
        }

        if (!validarEmail(form.email)) {
            alerta("¡Error!", "El email no es valido");
            return;
        }

        if (!validarContra(form.password)) {
            alerta("Error!", "La contraseña debe tener:\n" +
                "- Al menos 8 caracteres\n" +
                "- Una letra mayuscula\n" +
                "- Un caracter esecial (ej: !, @, #, $)");
            return;
        }

        if (form.password !== form.conformarPassword) {
            alerta("¡Error!", "Las constraseñas no coinciden")
            return;
        }

        try {
            const respuesta = await registrarUsuario(form);
            if (respuesta && respuesta.ok) {
                if (respuesta.data.usuario) {
                    await AsyncStorage.setItem(
                        '@usuario_sesion',
                        JSON.stringify(respuesta.data.usuario)
                    );
                }
                if (respuesta.data && respuesta.data.token) {
                    await SecureStore.setItemAsync('token_sesion', respuesta.data.token);
                }

                alerta("¡Éxito!", "Usuario creado con éxito.")

                setUsuarioLogueado(true);

            } else {
                const mensajeError = respuesta?.data?.error || "No se pudo completar el registro.";
                alerta("¡Error!", mensajeError);
            }
        } catch (error) {
            console.error(error);
            alerta("¡Error!", "Hubo un problema de conexión con el servidor.");
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.subContainer} showsVerticalScrollIndicator={false}>

                <Text style={styles.titulo}>Bienvenido a tu nueva biblioteca virtual</Text>
                <Text style={styles.subtitulo}>Crear usuario</Text>

                <TextInput style={styles.input} autoCapitalize="none" autoCorrect={false} placeholder="Nombre..." onChangeText={(txt) => setForm({ ...form, nombre: txt })} />
                <TextInput style={styles.input} autoCapitalize="none" autoCorrect={false} placeholder="Nombre de Usuario..." onChangeText={(txt) => setForm({ ...form, nombreUsuario: txt })} />
                <TextInput style={styles.input} autoCapitalize="none" autoCorrect={false} placeholder="Email..." keyboardType="email-address" onChangeText={(txt) => setForm({ ...form, email: txt })} />

                <View style={styles.inputD}>
                    <TextInput style={styles.textoInput} autoCapitalize="none" autoCorrect={false} onChangeText={(txt) => setForm({ ...form, password: txt })} placeholder="Contraseña..." secureTextEntry={!mostrarPassword} />
                    <TouchableOpacity style={styles.icon} onPress={() => setmostrarPassword(!mostrarPassword)} >
                        <Entypo name={mostrarPassword ? 'eye-with-line' : 'eye'} size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputD}>
                    <TextInput style={styles.textoInput} autoCapitalize="none" autoCorrect={false} onChangeText={(txt) => setForm({ ...form, conformarPassword: txt })} placeholder="Confirmar contraseña..." secureTextEntry={!mostrarPasswordD} />
                    <TouchableOpacity style={styles.icon} onPress={() => setmostrarPasswordD(!mostrarPasswordD)} >
                        <Entypo name={mostrarPasswordD ? 'eye-with-line' : 'eye'} size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleRegistro} style={styles.button}>
                    <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>¿Ya tienes una cuenta creada? Iniciar sesión.</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#8E7960',
    },
    subContainer: {
        flexGrow: 1,
        backgroundColor: '#DBD3CF',
        marginVertical: 40,
        marginHorizontal: 30,
        paddingVertical: 40,
        paddingTop: 70,
        paddingHorizontal: 30,
        width: 350,
        maxWidth: 450,
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
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
    },
    button: {
        width: '60%',
        height: 50,
        backgroundColor: '#7D6461',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        marginTop: 10,
        textAlign: 'center',
        minWidth: 130,
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
        ...Platform.select({ web: { outlineStyle: 'none' } }),
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
});