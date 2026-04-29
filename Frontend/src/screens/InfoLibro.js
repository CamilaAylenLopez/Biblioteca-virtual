import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView } from 'react-native';

export default function InfoLibro({ navigation }) {
    return (
        <Text>Hola</Text>
    )

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: 50,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 15,
        marginBottom: 20,
    },
    contenedorGenero: {
        marginBottom: 25,
    },
    tituloGenero: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E5E5E5',
        marginLeft: 15,
        marginBottom: 10,
    },
    card: {
        width: 120,
        marginLeft: 15,
    },
    portada: {
        width: 120,
        height: 180,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    tituloLibro: {
        color: 'white',
        fontSize: 14,
        marginTop: 5,
    },
    });
};

