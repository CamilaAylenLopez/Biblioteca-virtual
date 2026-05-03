import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getLibrosById, getPersonajesByIdLibro, getComentariosByIdLibro } from '../../api';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function InfoLibro({ navigation, route }) {
    const { libroId } = route.params;
    const [libro, setLibro] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [personajes, setPersonajes] = useState([]);
    const [comentarios, setComentarios] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try{
                const dataLibro = await getLibrosById(libroId);
                setLibro(dataLibro);

                const dataPersonajes = await getPersonajesByIdLibro(libroId);
                setPersonajes(dataPersonajes);

                const dataComentarios = await getComentariosByIdLibro(libroId);
                setComentarios(dataComentarios);
            }catch(error){
                console.error(error);
            }finally{
                setCargando(false);
            }
        };
        cargarDatos();
    }, [libroId]);

    const calificacionEstrellas = (rating) => {
        let estrellas = [];
        for (let i = 1; i <= 5; i++){
            let nombreIcono = "";
            let colorIcono = '#FFD700';

            if(i <= Math.floor(rating)){
                nombreIcono = "star";
            }else if (i === Math.ceil(rating) && rating % 1 !== 0){
                nombreIcono = "star-half-empty";
            } else{
                nombreIcono = "star-o";
                colorIcono = "#555";
            }
            estrellas.push(<FontAwesome key={i} name={nombreIcono} size={24} color={colorIcono} style={{margin: 3,}}/>)
        }
        return estrellas;
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!libro) return <Text style={{color: 'white'}}>Cargando...</Text>;

    console.log(comentarios)

    return (
        <ScrollView style={styles.container}>
            <View style={{justifyContent: 'center', alignContent: 'center'}}>
                <Image
                    source={{ uri: libro.imagen_url || 'https://previews.123rf.com/images/yoginta/yoginta2301/yoginta230100567/196853824-image-not-found-vector-illustration.jpg' }}
                    style={styles.imagen}
                />

                <View style={styles.estrellas}>
                    {calificacionEstrellas(libro.calificacion)}
                </View>

                <View style={{flexDirection: 'row', margin: 5, alignSelf: 'center'}}>
                    <Text style={styles.titulo}>{libro.titulo} </Text>
                    <Fontisto name="favorite" size={24} color="white" />
                </View>

                <Text style={styles.subtexto}>Creado por {libro.autor} - {libro.lanzamiento ? libro.lanzamiento.split('T')[0] : 'No disponible'}</Text>
                <Text style={styles.subtexto}>{libro.genero}</Text>
                <Text style={styles.descripcion}>{libro.sinopsis || "Sin descripción disponible."}</Text>


                <View style={styles.subContainer}>
                    <Text style={styles.subtitulo}>Personajes</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {Array.isArray(personajes) ? personajes.map((p) => (
                            <View key={p.id} style={styles.personajeCard}>
                                <TouchableOpacity  onPress={() => navigation.navigate('InfoPersonaje', {personajeId: p.id })}>
                                    <Image source={{ uri: p.imagen_url }} style={styles.fotoPersonaje} />
                                </TouchableOpacity>
                                <Text style={styles.nombrePersonaje}>{p.nombre}</Text>
                            </View>
                        )) : <Text style={{color: 'white'}}>No hay personajes para este libro</Text>}
                        <TouchableOpacity onPress={() => navigation.navigate('NuevoPersonaje', {libroId: libro.id })} style={styles.personajeCard}>
                            <Image source={'https://us.123rf.com/450wm/siamimages/siamimages1612/siamimages161201212/67657240-icono-de-la-gente-ilustraci%C3%B3n-dise%C3%B1o.jpg?ver=6'} style={styles.fotoPersonaje}/>
                            <Text style={styles.nombrePersonaje}>Agregar personaje</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <View style={styles.subContainer}>
                    <Text style={styles.subtitulo}>Comentarios</Text>
                    {Array.isArray(comentarios) ? comentarios.map((c) => (
                        <View style={styles.comentariosContainer} key={c.id}>
                            <View style={styles.horizontal}>
                                <Image 
                                    source={{ uri: c.foto_perfil || 'https://previews.123rf.com/images/yoginta/yoginta2301/yoginta230100567/196853824-image-not-found-vector-illustration.jpg' }}
                                    style={styles.fotoUsuario}
                                />
                                <View style={styles.vertical}>
                                    <Text style={{color: 'white'}}>{c.nombreUsuario}</Text>
                                    <View style={styles.estrellasD}>
                                        {calificacionEstrellas(c.estrellas)}
                                    </View>
                                </View>
                            </View>
                            <Text style={{color: 'white'}}>{c.texto}</Text>
                        </View>
                    )) : <Text style={{color: 'white'}}>¡Se el primero en hacer un comentario!</Text>}
                    <View style={styles.comentariosContainer}>
                        <Text>Agregar comenatrio...</Text>
                    </View>
                </View>
                
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

