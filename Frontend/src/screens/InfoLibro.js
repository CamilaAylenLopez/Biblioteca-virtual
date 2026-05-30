import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, Platform, KeyboardAvoidingView } from 'react-native';
import { getLibrosById, getPersonajesByIdLibro, getComentariosByIdLibro, nuevoComentario, getBibliotecas, crearBiblioteca, guardarLibroEnBiblioteca, eliminarLibro } from '../api/api';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function InfoLibro({ navigation, route, setUsuarioLogueado }) {
    const { libroId } = route.params;
    const isFocused = useIsFocused();
    const [libro, setLibro] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [personajes, setPersonajes] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [newComentario, setNewComentario] = useState('');
    const [usuario, setUsuario] = useState({
        nombre: '', foto: '', id: ''
    });
    const [estrellas, setEstrellas] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [bibliotecas, setBibliotecas] = useState([]);
    const [nombreNuevaBiblioteca, setNombreNuevaBiblioteca] = useState('');

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
    }, [libroId, isFocused]);

    const deleteLibro = async () => {
        const ejecutarBaja = async () => {
            try {
                const respuesta = await eliminarLibro(libroId);
                if (respuesta.ok) {
                    alerta("Exito", "Libro eliminado con exito");
                    navigation.goBack();
                } else {
                    alerta("Error", "No se ha podido eliminar el Libro");
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
        }
        if (Platform.OS === 'web') {
            if (confirm("¿Estas seguro de borrar este libro?")) ejecutarBaja();
        } else {
            Alert.alert("Eliminar", "¿Seguro que quieres borrar este libro?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: ejecutarBaja }
            ]);
        }
    };

    const calificacionEstrellas = (rating) => {
        let estrellasArray = [];
        if (!rating) return null;

        for (let i = 1; i <= 5; i++) {
            let nombreIcono = "";
            let colorIcono = '#FFD700';

            if (i <= Math.floor(rating)) {
                nombreIcono = "star";
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                nombreIcono = "star-half-empty";
            } else {
                nombreIcono = "star-o";
                colorIcono = "#555555";
            }
            estrellasArray.push(<FontAwesome key={i} name={nombreIcono} size={24} color={colorIcono} style={{ margin: 3, }} />)
        }
        return estrellasArray;
    };

    const renderEstrellas = () => {
        return (
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setEstrellas(estrellas === star ? null : star)}>
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

    const handleGuardarLibro = async (biblioteca_id) => {
        try {
            const data = { biblioteca_id: biblioteca_id, libro_id: libroId };
            const respuesta = await guardarLibroEnBiblioteca(data);

            if (respuesta.ok) {
                alerta("Exito", "El libro se guardo correctamente");
                setModalVisible(false);
            } else {
                alerta("Error", "El libro ya se encuentra en esta biblioteca");
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

    const sendComentario = async () => {
        if (!newComentario || newComentario.trim() === "") {
            alerta("Error", "Completa todos los campos");
            return;
        }

        try {
            const data = {
                texto: newComentario,
                estrellas: estrellas || null,
                usuario_id: usuario.id,
                libro_id: libroId
            }

            const respuesta = await nuevoComentario(data);
            if (respuesta.ok) {
                alerta("¡Éxito!", "Comentario agregado correctamente");
                setNewComentario("");
                setEstrellas(null);

                const dataComentarios = await getComentariosByIdLibro(libroId);
                setComentarios(dataComentarios);
                const dataLibroActualizado = await getLibrosById(libroId);
                setLibro(dataLibroActualizado);
            } else {
                alerta("Error", "No se pudo subir el comenario");
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

    if (cargando) return <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />;
    if (!libro) return <Text style={{ color: 'white' }}>Cargando...</Text>;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TouchableOpacity style={styles.icon} onPress={deleteLibro}>
                    <FontAwesome name="trash" size={35} color="#bebebe" />
                </TouchableOpacity>
                <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                    <Image
                        source={libro.imagen_url ? { uri: libro.imagen_url } : require('../img/addimage.jpg')}
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

                    <Text style={styles.subtexto}>Creado por {libro.autor} - {libro.lanzamiento ? libro.lanzamiento.split('T')[0] : 'Fecha desconocida'}</Text>
                    <Text style={styles.subtexto}>{libro.genero}</Text>
                    <Text style={styles.descripcion}>{libro.sinopsis || "Sin descripción disponible."}</Text>

                    {/* SECCIÓN GUARDAR LIBRO */}
                    <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBack}>
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

                                <View style={styles.containerBotonesModal}>
                                    <TouchableOpacity style={styles.buttonCrear} onPress={handleCrearBiblioteca}>
                                        <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', color: 'black' }}>Crear</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.buttonCerrar} onPress={() => setModalVisible(false)}>
                                        <Text style={{ color: '#bcbcbc', fontWeight: 'bold', textAlign: 'center' }}>Cerrar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </Modal>

                    {/* SECCIÓN PERSONAJES */}
                    <View style={styles.subContainer}>
                        <Text style={styles.subtitulo}>Personajes</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {Array.isArray(personajes) ? personajes.map((p) => (
                                <View key={p.id} style={styles.personajeCard}>
                                    <TouchableOpacity onPress={() => navigation.navigate('InfoPersonaje', { personajeId: p.id })}>
                                        <Image source={p.imagen_url ? { uri: p.imagen_url } : require('../img/userIcon.webp')} style={styles.fotoPersonaje} />
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

                    {/* SECCIÓN COMENTARIOS */}
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
                                <TextInput multiline numberOfLines={3} style={styles.inputComentario} value={newComentario} placeholder="Agregar comentario..." onChangeText={(txt) => setNewComentario(txt)} />

                                <TouchableOpacity onPress={sendComentario}>
                                    <FontAwesome name="send" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 70,
        ...Platform.select({ ios: { paddingTop: 130 } }),
        backgroundColor: '#121212',
    },
    subContainer: {
        margin: 20,
        paddingLeft: 10,
    },
    comentariosContainer: {
        backgroundColor: '#282828',
        marginBottom: 20,
        padding: 20,
        borderRadius: 20,
        fontFamily: 'Roboto-Regular'
    },
    comentariosContainerD: {
        backgroundColor: '#282828',
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
        width: '70%',
        height: 400,
        resizeMode: 'cover',
        alignSelf: 'center',
        margin: 20,
        marginTop: 10,
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
        backgroundColor: '#282828',
        borderRadius: 50,
        paddingHorizontal: 15,
        marginTop: 25,
        color: 'white',
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        fontFamily: 'Roboto-Regular'
    },
    inputComentario: {
        flex: 1,
        backgroundColor: '#282828',
        borderRadius: 30,
        paddingHorizontal: 15,
        marginTop: 5,
        color: 'white',
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        height: 50,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    modalBack: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
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
        height: 1,
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
        marginTop: 15,
    },
    buttonCrear: {
        flex: 0.48,
        backgroundColor: '#bcbcbc',
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignContent: 'center',
        borderRadius: 10,
        justifyContent: 'center',
        marginBottom: 10,
    },
    buttonCerrar: {
        flex: 0.48,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#bcbcbc',
    },
    icon: {
        display: 'flex',
        alignItems: 'flex-end',
    },
});

