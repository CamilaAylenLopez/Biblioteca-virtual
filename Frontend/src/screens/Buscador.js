import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { resultadoBusqueda } from '../api/api';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Buscador({ navigation, setUsuarioLogueado }) {
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState([]);
    const [filtro, setFiltro] = useState('todo');
    const [cargando, setCargando] = useState(false);
    const isFocused = useIsFocused();

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
            await AsyncStorage.removeItem('@token_sesion');
            setUsuarioLogueado(false);
            alerta("Sesión expirada", "Tu sesión ha caducado. Por favor, inicia sesión nuevamente.");
        } catch (error) {
            console.log(error);
            alerta("Error", "Hubo un error al intentar cerrar sesión.");
        }
    };

    useEffect(() => {
        if (isFocused) {
            setQuery('');
            setResultados([]);
            setCargando(false);
        }

        return () => {
            setQuery('');
            setResultados([]);
            setCargando(false);
        };
    }, [isFocused]);

    useEffect(() => {
        if (query.trim().length <= 1) {
            setResultados([]);
            setCargando(false);
            return;
        }

        setCargando(true);

        const delayDebounceFn = setTimeout(() => {

            resultadoBusqueda(encodeURIComponent(query))
                .then(data => {
                    setResultados(data || []);
                })
                .catch(async (err) => {
                    console.error("Error en búsqueda: ", err);
                    if (err.message === 'TOKEN_EXPIRADO') {
                        await procesarCierreDeSesion();
                    } else {
                        alerta("Error", "Hubo un problema al realizar la búsqueda.");
                    }
                })
                .finally(() => {
                    setCargando(false);
                });
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);


    const resultadosFiltrados = resultados.filter(item => filtro === 'todo' ? true : item.tipo === filtro);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={() => {
            if (item.tipo === 'libro') {
                navigation.navigate('InfoLibro', { libroId: item.id });
            } else {
                navigation.navigate('InfoPersonaje', { personaje: item.id });
            }
        }}>

            <Image source={item.imagen_url ? { uri: item.imagen_url } : require('../img/Imagenotfound.png')} style={item.tipo === 'libro' ? styles.imgLibro : styles.imgPersonaje} />
            <View style={styles.info}>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <View style={styles.containerTipoTexto}>
                    <Text style={styles.tipoTexto}>{item.tipo.toUpperCase()}</Text>
                </View>
            </View>
            <AntDesign name="right" size={18} color="white" />
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <View style={styles.buscarConteiner}>
                <FontAwesome name="search" size={18} color="white" style={{ marginHorizontal: 10 }} />
                <TextInput style={styles.input} placeholder='Buscar libro o personajes...' value={query} onChangeText={setQuery} />
            </View>

            <View style={styles.tabBar}>
                {['todo', 'libro', 'personaje'].map((t) => (
                    <TouchableOpacity key={t} onPress={() => setFiltro(t)} style={[styles.tab, filtro === t && styles.tabActivo]} >
                        <Text style={[styles.tabText, filtro === t && styles.tabTextActivo]}>{t.charAt(0).toUpperCase() + t.slice(1)}s</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {cargando ? (
                <ActivityIndicator size="large" color="#6868AC" style={{ marginTop: 20 }} />
            ) : (
                <FlatList data={resultadosFiltrados}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={query.trim().length > 1 && <Text style={styles.vacio}>No se encontraron resultados</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 15,
        paddingTop: 50,
    },
    buscarConteiner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#282828',
        borderRadius: 25,
        marginTop: 20,
        paddingHorizontal: 10,
        height: 45,
    },
    input: {
        flex: 1,
        color: 'white',
        ...Platform.select({ web: { outlineStyle: 'none' } }),
        fontSize: 18,
        fontFamily: 'Roboto-Regular'
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 15,
    },
    tab: {
        paddingBottom: 5,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent'
    },
    tabActivo: {
        borderBottomColor: '#6868AC'
    },
    tabText: {
        color: '#c6c6c6',
        fontSize: 16,
        fontFamily: 'Roboto-Bold'
    },
    tabTextActivo: {
        color: '#6868AC',
        fontFamily: 'Roboto-Regular'
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10
    },
    imgLibro: {
        width: 50,
        height: 75,
        borderRadius: 5
    },
    imgPersonaje: {
        width: 60,
        height: 60,
        borderRadius: 30
    },
    info: {
        flex: 1,
        marginLeft: 15,
        fontFamily: 'Roboto-Regular'
    },
    nombre: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Roboto-Bold',
    },
    containerTipoTexto: {
        backgroundColor: '#333333',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        marginTop: 5,
    },
    tipoTexto: {
        color: '#6868AC',
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
    },
    vacio: {
        color: 'white',
        textAlign: 'center',
        marginTop: 30,
        fontFamily: 'Roboto-Regular'
    },
});