import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getPersonajeById } from '../../api';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function InfoPersonaje({ navigation, route }) {
    const { personajeId } = route.params;
    const [cargando, setCargando] = useState(true);
    const [personaje, setPersonaje] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try{
                const dataPersonaje = await getPersonajeById(personajeId);
                setPersonaje(dataPersonaje);
            }catch(error){
                console.error(error);
            }finally{
                setCargando(false);
            }
        };
        cargarDatos();
    }, [personajeId]);

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!personaje) return <Text style={{color: 'white'}}>Cargando...</Text>;

    console.log("Datos personaje ", personaje)

    return (
        <ScrollView style={styles.container}>
            <View style={{justifyContent: 'center', alignContent: 'center'}}>
                <Image
                    source={{ uri: personaje.imagen_url || 'https://previews.123rf.com/images/yoginta/yoginta2301/yoginta230100567/196853824-image-not-found-vector-illustration.jpg' }}
                    style={styles.imagen}
                />


                <Text style={styles.titulo}>{personaje.nombre} </Text>

                <Text style={styles.descripcion}>{personaje.descripcion || "Sin descripción disponible."}</Text>
                
            </View>

        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: 'black',
    },
    comentariosContainer:{
        backgroundColor: '#7D6461',
        marginBottom: 20,
        padding: 20,
        borderRadius: 20,
    },
    horizontal:{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    vertical:{
        flexDirection: 'column',
        justifyContent: 'center',
    },
    imagen: {
        width: '60%',
        height: 400,
        resizeMode: 'cover',
        alignSelf: 'center',
        margin: 20,
        marginTop: 40,
    },
    fotoUsuario:{
        width: 60,
        height: 60,
        borderRadius: 100,
        marginRight: 10,
        backgroundColor: '#333',
    },
    titulo:{
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white',
        padding: 5,
    },
    subtexto:{
        textAlign: 'center',
        color: '#cdcaca',
        fontSize: 16,
    },
    descripcion:{
        color: 'white',
        margin: 20,
    },
    estrellas:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    estrellasD:{
        flexDirection: 'row',
        margin: 10,
    },
    subContainer:{
        margin: 20,
        paddingLeft: 10,
    },
    subtitulo:{
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    personajeCard: {
        alignItems: 'center',
        marginRight:15,
    },
    fotoPersonaje:{
        width: 100,
        height: 150,
    },
    nombrePersonaje:{
        color: 'white',
        fontSize: 12,
        marginTop: 5,
    },
});