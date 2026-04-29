import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { registrarUsuario } from '../../api';

export default function CrearRegistro({ navigation }) {
    const [form, setForm] = useState({
        nombre: '', apellido: '', nombreUsuario: '', email: '', password: ''
    });

    const handleRegistro = async () => {
        // Validación simple
        if (!form.nombreUsuario || !form.password || !form.email) {
            Alert.alert("Error", "Faltan campos obligatorios");
            return;
        }

        const { ok, data } = await registrarUsuario(form);

        if (ok) {
            Alert.alert("¡Éxito!", "Usuario creado correctamente");
            navigation.navigate('Login'); // Volvemos al login para probar
        } else {
            Alert.alert("Error", data.mensaje);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput placeholder="Nombre" onChangeText={(txt) => setForm({...form, nombre: txt})} />
            <TextInput placeholder="Nombre de Usuario" onChangeText={(txt) => setForm({...form, nombreUsuario: txt})} />
            <TextInput placeholder="Email" onChangeText={(txt) => setForm({...form, email: txt})} />
            <TextInput placeholder="Contraseña" secureTextEntry onChangeText={(txt) => setForm({...form, password: txt})} />
            
            <TouchableOpacity onPress={handleRegistro} style={{ backgroundColor: 'blue', padding: 15, marginTop: 10 }}>
                <Text style={{ color: 'white', textAlign: 'center' }}>Registrarse</Text>
            </TouchableOpacity>
        </View>
    );
}