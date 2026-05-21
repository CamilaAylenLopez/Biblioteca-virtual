import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { nuevoLibro } from '../../api';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';
import DropdownSelect from 'react-native-input-select';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NuevoLibro({ navigation }) {
    const isFocused = useIsFocused();
    const [form, setForm] = useState({
        titulo: '', autor: '', sinopsis: '', imagen_url: '', calificacion: '', lanzamiento: '', genero: ''
    });
    const [error, setError] = useState(false);
    const [image, setImage] = useState();
    const [fecha, setFecha] = useState(new Date());
    const [mostrarCalendario, setMostrarCalendario] = useState(false);

    const alerta = (titulo, mensaje) => {
        if (Platform.OS === 'web') {
            alert(mensaje)
        } else {
            Alert.alert(titulo, mensaje)
        }
    };

    useEffect(() => {
        if (isFocused) {
            setForm({ titulo: '', autor: '', sinopsis: '', imagen_url: '', calificacion: '', lanzamiento: '', genero: '' });
        }
    }, [isFocused]);

    const onChangeFecha = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setMostrarCalendario(false);
            return;
        }

        if (selectedDate) {
            setFecha(selectedDate);

            const anio = selectedDate.getFullYear();
            const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dia = String(selectedDate.getDate()).padStart(2, '0');

            const fechaFormateada = `${anio}-${mes}-${dia}`;
            setForm({ ...form, lanzamiento: fechaFormateada });
        }

        if (Platform.OS === 'android') {
            setMostrarCalendario(false);
        }
    };

    const onChangeFechaWeb = (txt) => {
        setForm({ ...form, lanzamiento: txt });
        if (txt) {
            const [year, month, day] = txt.split('-');
            setFecha(new Date(year, month - 1, day));
        }
    };

    const selectImagen = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                alerta("Error", "Permiso no concedido");
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [2, 3],
                quality: 0.2,
                base64: true,
            });

            if (!result.canceled) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setImage(base64Image);
                setForm({ ...form, imagen_url: base64Image });
            }
        } catch (error) {
            console.error("Error al seleccioanr imagen: ", error);
        }
    };

    const agregarLibro = async () => {
        setError(false);
        if (!form.titulo || !form.autor || !form.genero) {
            alerta("Error", "Completa todos los campos");
            return;
        }

        try {
            const respuesta = await nuevoLibro({ ...form, imagen_url: image });
            if (respuesta.ok) {
                alerta("¡Éxito!", "Libro agregado correctamente");
                navigation.navigate('Home');
            } else {
                setError(true);
                alerta("Error", "No se pudo guardar el libro");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.subContainer}>
                {/*SELECCIOANR IMAGEN*/}
                <TouchableOpacity style={styles.imagenConteiner} onPress={selectImagen}>
                    <Image source={image ? { uri: image } : require('../img/addimage.jpg')} style={styles.imagen} />
                </TouchableOpacity>

                {/*INPUTS NORMALES*/}
                <TextInput style={styles.input} value={form.titulo} placeholder="*Titulo..." onChangeText={(txt) => setForm({ ...form, titulo: txt })} />
                <TextInput style={styles.input} value={form.autor} placeholder="*Autor..." onChangeText={(txt) => setForm({ ...form, autor: txt })} />
                <TextInput style={styles.input} value={form.sinopsis} placeholder="Sinopsis..." onChangeText={(txt) => setForm({ ...form, sinopsis: txt })} />

                {/*INPUT FECHA*/}
                <View style={{ zIndex: 1, width: '100%', marginVertical: 5 }}>
                    {Platform.OS === 'web' ? (
                        <View style={styles.inputD}>
                            <TextInput type="date" value={form.lanzamiento} placeholder='YYYY-MM-DD' onChange={(e) => onChangeFechaWeb(e.target.value)} max={new Date().toISOString().split('t')[0]} style={styles.inputWeb} />
                        </View>
                    ) : (
                        <View>
                            <TouchableOpacity style={styles.inputD} onPress={() => setMostrarCalendario(!mostrarCalendario)}>
                                <Text style={styles.textoFecha}>
                                    {form.lanzamiento ? `${form.lanzamiento}` : "Elegir fecha de lanzamiento"}
                                </Text>

                                {mostrarCalendario && (
                                    <View style={Platform.OS === 'ios' ? styles.contenedorCalendarioIOS : null}>
                                        <DateTimePicker
                                            value={fecha}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={onChangeFecha}
                                            maximumDate={new Date()}
                                            locale="es-ES"
                                        />


                                        {Platform.OS === 'ios' && (
                                            <TouchableOpacity style={styles.btnListoIOS} onPress={() => setMostrarCalendario(false)}>
                                                <Text style={styles.confirmarText}>Confirmar fecha</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/*INPUT GENERO*/}
                <DropdownSelect
                    style={styles.drop}
                    label=" "
                    placeholder="*Elegir genero..."
                    options={[
                        {
                            title: 'Generos...',
                            data: [
                                { label: 'Terror', value: 'Terror' },
                                { label: 'Romance', value: 'Romance' },
                                { label: 'Misterio', value: 'Misterio' },
                                { label: 'Parodia', value: 'Parodia' },
                                { label: 'Ficción', value: 'Ficción' },
                                { label: 'Contranovela', value: 'Contranovela' },
                                { label: 'Policial', value: 'Policial' },
                                { label: 'Fantasía', value: 'Fantasía' },
                            ],
                        },
                    ]}
                    value={form.genero}
                    selectedValue={form.genero}
                    onValueChange={(value) => setForm({ ...form, genero: value })}
                    isSearchable
                    primaryColor={'#7D6461'}
                    dropdownStyle={{
                        backgroundColor: '#7D6461',
                        borderColor: '#7D6461',
                        borderRadius: 50,
                    }}
                    dropdownIconStyle={{ color: 'white' }}
                    dropdownPlaceholderStyle={{ color: 'white', }}
                    placeholderStyle={{ color: 'white', fontSize: 16 }}
                    selectedItemStyle={{ color: 'white' }}
                />

                {/*BOTON DE ACEPTAR*/}
                <TouchableOpacity style={styles.button} onPress={agregarLibro}>
                    <Text style={styles.buttonText}>Hecho</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        fontFamily: 'roboto',
        backgroundColor: '#121212',
    },
    subContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'roboto',
    },
    imagenConteiner: {
        margin: 20,
        borderRadius: 50,
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
    drop: {
        backgroundColor: '#7D6461',
        fontSize: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        alignSelf: 'center',
        margin: 5,
    },
    titulo: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#7D6461',
        borderRadius: 30,
        paddingHorizontal: 15,
        marginTop: 25,
        color: 'white',
        outlineStyle: 'none',
        fontSize: 16,
    },
    button: {
        width: '50%',
        height: 50,
        backgroundColor: '#7D6461',
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        marginTop: 10,
        textAlign: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        alignSelf: 'center',
        margin: 5,
        fontSize: 16,
        fontWeight: '500'
    },
    link: {
        color: '#6868AC',
        marginTop: 50
    },
    error: {
        color: '#b91e1e',
        padding: 10,
        fontSize: 18,
        justifyContent: 'center',
    },
    inputD: {
        width: '100%',
        height: 50,
        backgroundColor: '#7D6461',
        borderRadius: 30,
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginTop: 25,
    },
    textoFecha: {
        color: 'white',
        fontSize: 16,
    },
    textoInput: {
        color: 'white',
        flex: 1,
        outlineStyle: 'none',
        fontSize: 16
    },
    icon: {
        padding: 5,
        paddingTop: 12,
    },
    imagen: {
        alignSelf: 'center',
        width: 200,
        height: 200,
    },
    contenedorCalendarioIOS: {
        borderRadius: 25,
        padding: 10,
        marginVertical: 5,
        width: '100%',
        backgroundColor: '#63504e',
        paddingBottom: 20,
    },
    btnListoIOS: {
        marginTop: 5,
        backgroundColor: '#63504e',
        borderRadius: 25,
    },
    confirmarText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 5
    },
    inputWeb: {
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        fontSize: '16px',
        width: '100%',
        outlineStyle: 'none',
        cursor: 'pointer'
    }
});