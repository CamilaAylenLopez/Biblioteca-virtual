import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { getLibrosById, getPersonajesByIdLibro, getComentariosByIdLibro, nuevoComentario, getBibliotecas, crearBiblioteca, guardarLibroEnBiblioteca } from '../../api';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSortedScreens } from 'expo-router/build/useScreens';

export default function InfoLibro({ navigation, route }) {
    const { libroId } = route.params;
    const isFocused = useIsFocused();
    const [libro, setLibro] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [personajes, setPersonajes] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [newComentario, setNewComentario] = useState('');
    const [error, setError] = useState(false);
    const [usuario, setUsuario] = useState({
        nombre: '', foto: '', id: ''
    });
    const [estrellas, setEstrellas] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [bibliotecas, setBibliotecas] = useState([]);
    const [nombreNuevaBiblioteca, setNombreNuevaBiblioteca] = useState('');

    useEffect(() => {
        if (isFocused) {
            const cargarDatos = async () => {
                try {
                    const dataLibro = await getLibrosById(libroId);
                    setLibro(dataLibro);

                    const dataPersonajes = await getPersonajesByIdLibro(libroId);
                    setPersonajes(dataPersonajes);

                    const dataComentarios = await getComentariosByIdLibro(libroId);
                    setComentarios(dataComentarios);

                    const sesion = await AsyncStorage.getItem('@usuario_sesion');
                    if (sesion) {
                        const usuarioParseado = JSON.parse(sesion);
                        setUsuario({
                            nombre: usuarioParseado.nombreUsuario,
                            foto: usuarioParseado.foto_perfil,
                            id: usuarioParseado.id
                        });

                        const datosBiblioteca = await getBibliotecas(usuarioParseado.id);
                        setBibliotecas(datosBiblioteca || []);
                    };

                } catch (error) {
                    console.error(error);
                } finally {
                    setCargando(false);
                }
            };
            cargarDatos();
        }
    }, [libroId, isFocused]);

    const calificacionEstrellas = (rating) => {
        let estrellas = [];
        for (let i = 1; i <= 5; i++) {
            let nombreIcono = "";
            let colorIcono = '#FFD700';

            if (i <= Math.floor(rating)) {
                nombreIcono = "star";
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                nombreIcono = "star-half-empty";
            } else {
                nombreIcono = "star-o";
                colorIcono = "#555";
            }
            estrellas.push(<FontAwesome key={i} name={nombreIcono} size={24} color={colorIcono} style={{ margin: 3, }} />)
        }
        return estrellas;
    };

    const renderEstrellas = () => {
        return (
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setEstrellas(star)}>
                        <FontAwesome key={star} name={star <= estrellas ? "star" : "star-o"} size={24} color={star <= estrellas ? "#FFD700" : "#555"} style={{ margin: 3, }} />
                    </TouchableOpacity>
                ))}
            </View>
        )
    };

    const handleCrearBiblioteca = async () => {
        if (!nombreNuevaBiblioteca.trim()) {
            alerta("Error", "Escribe un nombre para la biblioteca");
            return;
        }

        try {
            const datos = { idUsuario: usuario.id, nombre: nombreNuevaBiblioteca };
            const respuesta = await crearBiblioteca(datos);

            if (respuesta.ok) {
                alerta("Exito", "Biblioteca creada correctamente");

                setBibliotecas([...bibliotecas, { id: respuesta.data.id_biblioteca, nombre: respuesta.data.nombre, usuario_id: usuario.id }]);
                setNombreNuevaBiblioteca('');
            } else {
                alerta("Error", "No se pudo crear la biblioteca");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGuardarLibro = async (biblioteca_id) => {
        try {
            const data = { biblioteca_id: biblioteca_id, libro_id: libroId };
            const respuesta = await guardarLibroEnBiblioteca(data);

            if (respuesta.ok) {
                alerta("Exito", "El libro se guardo correctamente");

                setModalVisible(false);
            } else {
                //agregar funcion para que se elimine
                alerta("Error", "El libro ya se encuentra en esta biblioteca");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const alerta = (titulo, mensaje) =>{
        if(Platform.OS === 'web'){
            alert(mensaje)
        }else{
            Alert.alert(titulo, mensaje)
        }
    };

    const sendComentario = async () => {
        setError(false);
        if (!newComentario || newComentario.trim() === "") {
            alerta("Error","Completa todos los campos");
            return;
        }
        try {

            const data = {
                texto: newComentario,
                estrellas: estrellas,
                usuario_id: usuario.id,
                libro_id: libroId
            }

            const respuesta = await nuevoComentario(data);
            if (respuesta.ok) {
                alerta("¡Éxito!", "Comenatrio agregado correctamente");
                setNewComentario("");
                setEstrellas(0);
                try {
                    const dataComentarios = await getComentariosByIdLibro(libroId);
                    setComentarios(dataComentarios);
                } catch (error) {
                    alerta("Error", "Error al cargar comentarios")
                };
                const dataLibroActualizado = await getLibrosById(libroId);
                setLibro(dataLibroActualizado);

            } else {
                setError(true);
                alerta("Error", "No se pudo subir el comenario");
            }
        } catch (error) {
            console.error(error);
            alerta("Error", "No se ha podido subir el comentario");
        }
    };

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!libro) return <Text style={{ color: 'white' }}>Cargando...</Text>;

    console.log(comentarios)

    return (
        <ScrollView style={styles.container}>
            <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                <Image
                    source={libro.imagen_url ? { uri: libro.imagen_url } : require('../img/Imagenotfound.png')}
                    style={styles.imagen}
                />

                <View style={styles.estrellas}>
                    {calificacionEstrellas(libro.calificacion)}
                </View>

                <View style={{ flexDirection: 'row', margin: 5, alignSelf: 'center' }}>
                    <Text style={styles.titulo}>{libro.titulo} </Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Fontisto name="favorite" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.subtexto}>Creado por {libro.autor} - {libro.lanzamiento ? libro.lanzamiento.split('T')[0] : 'No disponible'}</Text>
                <Text style={styles.subtexto}>{libro.genero}</Text>
                <Text style={styles.descripcion}>{libro.sinopsis || "Sin descripción disponible."}</Text>

                <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalBack}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitulo}>Guardar en biblioteca...</Text>
                            <FlatList
                                data={bibliotecas}
                                keyExtractor={(item) => item.id.toString()}
                                style={{ width: '100%', maxHeight: 180 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.itemBiblioteca} onPress={() => handleGuardarLibro(item.id)}>
                                        <Text style={styles.textoItem}>{item.nombre}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={{ color: 'white', textAlign: 'center', marginVertical: 15 }}>No has creado ninguna biblioteca todavía.</Text>
                                }
                            />
                            <View style={styles.separador} />

                            <Text style={styles.subtituloModal}>Crear nueva biblioteca</Text>
                            <TextInput style={styles.inputModal} value={nombreNuevaBiblioteca} placeholder='Nombre...' onChangeText={(txt) => setNombreNuevaBiblioteca(txt)} />

                            <View>
                                <TouchableOpacity style={styles.buttonCrear} onPress={handleCrearBiblioteca}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Crear</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.buttonCerrar} onPress={() => setModalVisible(false)}>
                                    <Text style={{ color: '#7D6461', fontWeight: 'bold', textAlign: 'center' }}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style={styles.subContainer}>
                    <Text style={styles.subtitulo}>Personajes</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {Array.isArray(personajes) ? personajes.map((p) => (
                            <View key={p.id} style={styles.personajeCard}>
                                <TouchableOpacity onPress={() => navigation.navigate('InfoPersonaje', { personajeId: p.id })}>
                                    <Image source={{ uri: p.imagen_url }} style={styles.fotoPersonaje} />
                                </TouchableOpacity>
                                <Text style={styles.nombrePersonaje} numberOfLines={1} ellipsizeMode="tail">{p.nombre}</Text>
                            </View>
                        )) : <Text style={{ color: 'white' }}>No hay personajes para este libro</Text>}
                        <TouchableOpacity onPress={() => navigation.navigate('NuevoPersonaje', { libroId: libro.id })} style={styles.personajeCard}>
                            <Image source={require('../img/addusericon.jpg')} style={styles.fotoPersonaje} />
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
                                    source={c.foto_perfil ? { uri: c.foto_perfil } : require('../img/userIcon.webp')}
                                    style={styles.fotoUsuario}
                                />
                                <View style={styles.vertical}>
                                    <Text style={{ color: 'white' }}>{c.nombreUsuario}</Text>
                                    <View style={styles.estrellasD}>
                                        {calificacionEstrellas(c.estrellas)}
                                    </View>
                                </View>
                            </View>
                            <Text style={{ color: 'white' }}>{c.texto}</Text>
                        </View>
                    )) : <Text style={{ color: 'white' }}>¡Se el primero en hacer un comentario!</Text>}
                    <View style={styles.comentariosContainer}>
                        <View style={styles.horizontal}>
                            <Image
                                source={usuario.foto ? { uri: usuario.foto } : require('../img/userIcon.webp')}
                                style={styles.fotoUsuario}
                            />
                            <Text style={{ color: 'white' }}>{usuario.nombre}</Text>
                        </View>
                        {renderEstrellas()}

                        <View style={styles.horizontal}>
                            <TextInput style={styles.inputComenatrio} value={newComentario} placeholder="Agregar comentario..." onChangeText={(txt) => setNewComentario(txt)} />
                            <TouchableOpacity onPress={sendComentario}>
                                <FontAwesome name="send" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </View>
        </ScrollView>
    )
};

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
    comentariosContainer: {
        backgroundColor: '#7D6461',
        marginBottom: 20,
        padding: 20,
        borderRadius: 20,
        fontFamily: 'Roboto-Regular'
    },
    comentariosContainerD: {
        backgroundColor: '#7D6461',
        marginBottom: 20,
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: 'Roboto-Regular'
    },
    horizontal: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingRight: 30,
    },
    vertical: {
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
    fotoUsuario: {
        width: 60,
        height: 60,
        borderRadius: 100,
        marginRight: 10,
        backgroundColor: '#333333',
    },
    titulo: {
        textAlign: 'center',
        fontSize: 20,
        color: 'white',
        padding: 5,
        fontFamily: 'Roboto-Bold'
    },
    subtexto: {
        textAlign: 'center',
        color: '#cdcaca',
        fontSize: 16,
        fontFamily: 'Roboto-Regular'
    },
    descripcion: {
        color: 'white',
        margin: 20,
        fontFamily: 'Roboto-Regular'
    },
    estrellas: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    estrellasD: {
        flexDirection: 'row',
        margin: 10,
    },
    subContainer: {
        margin: 20,
        paddingLeft: 10,
    },
    subtitulo: {
        color: 'white',
        fontSize: 20,
        marginBottom: 10,
        fontFamily: 'Roboto-Bold'
    },
    personajeCard: {
        alignItems: 'center',
        marginRight: 15,
    },
    fotoPersonaje: {
        width: 100,
        height: 150,
    },
    nombrePersonaje: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
        maxWidth: 100,
        fontFamily: 'Roboto-Regular'
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#7D6461',
        borderRadius: 50,
        paddingHorizontal: 15,
        marginTop: 25,
        color: 'white',
        outlineStyle: 'none',
        fontFamily: 'Roboto-Regular'
    },
    inputComenatrio: {
        width: '100%',
        height: 50,
        backgroundColor: '#7D6461',
        borderRadius: 50,
        paddingHorizontal: 15,
        color: 'white',
        outlineStyle: 'none',
        fontFamily: 'Roboto-Regular'
    },
    modalBack: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#282828',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'center',
        minHeight: 380,
    },
    modalTitulo: {
        fontSize: 18,
        marginBottom: 15,
        color: 'white',
        fontFamily: 'Roboto-Bold'
    },
    subtituloModal: {
        fontSize: 14,
        alignSelf: 'flex-start',
        marginTop: 5,
        color: 'white',
        fontFamily: 'Roboto-Bold'
    },
    itemBiblioteca: {
        width: '100%',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: '#efefef',
        color: 'white',
    },
    textoItem: {
        fontSize: 16,
        color: 'white',
        fontFamily: 'Roboto-Regular'
    },
    separador: {
        width: '100%',
        marginVertical: 15,
    },
    inputModal: {
        width: '100%',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 10,
        padding: 12,
        marginVertical: 10,
        color: 'white',
        fontFamily: 'Roboto-Regular'
    },
    containerBotonesModal: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonCrear: {
        backgroundColor: '#7D6461',
        alignContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        justifyContent: 'center',
        marginBottom: 10,
        fontFamily: 'Roboto-Regular'
    },
    buttonCerrar: {
        alignContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#7D6461',
        fontFamily: 'Roboto-Regular'
    }
});

