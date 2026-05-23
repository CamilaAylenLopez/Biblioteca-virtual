import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { resultadoBusqueda } from '../../api';
import { FontAwesome, AntDesign } from '@expo/vector-icons';

export default function Buscador({ navigation }) {
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState([]);
    const [filtro, setFiltro] = useState('todo');
    const [cargando, setCargando] = useState(false);

    const realizarBusqueda = async (texto) => {
        if (texto.length < 2) {
            setResultados([]);
            return;
        }
        setCargando(true);
        try {
            const data = await resultadoBusqueda(texto);
            setResultados(data);
        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    };


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim().length > 1) {
                resultadoBusqueda(encodeURIComponent(query)).then(data => {
                    console.log("Resultados recibidos:", data);
                    setResultados(data);
                });
            }
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
            
            <Image source={item.imagen_url ? { uri: item.imagen_url} : require('../img/Imagenotfound.png')} style={item.tipo === 'libro' ? styles.imgLibro : styles.imgPersonaje} />
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
                    ListEmptyComponent={query.length > 1 && <Text style={styles.vacio}>No se encontraron resultados</Text>}
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
        padding: 50,
    },
    buscarConteiner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#282828',
        borderRadius: 25,
        marginTop: 20,
        paddingHorizontal: 10,
        height: 45,
        fontFamily: 'Roboto-Regular'
    },
    input: {
        flex: 1,
        color: 'white',
        outlineStyle: 'none',
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