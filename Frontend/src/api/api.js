import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = 'http://192.168.0.233:3000';

const verificarStatusToken = async (res) => {
    if (res.status === 401 || res.status === 403) {
        await AsyncStorage.removeItem('@usuario_sesion');
        await SecureStore.deleteItemAsync('token_sesion');
        throw new Error("TOKEN_EXPIRADO");
    }
};

export const getLibros = async () => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/libros`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error al obtener libros: ", error);
        throw error;
    }
};

export const getLibrosByGenero = async (genero) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/libros/${genero}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error al filtrar por género: ", error);
        throw error;
    }
};

export const getComentariosByIdLibro = async (idLibro) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/libro/comentarios/idLibro/${idLibro}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error al enocntrar comentarios: ", error);
        throw error;
    }
};

export const getPersonajeById = async (idPersonaje) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/personaje/idPersonaje/${idPersonaje}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error al encontrar personaje: ", error);
        throw error;
    }
};

export const getLibrosById = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/libros/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error al obtener libro por id: ", error);
        throw error;
    }
};

export const getPersonajesByIdLibro = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/personajes/idLibro/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error al obtener ids de los personajes asociados a determinado libro");
        throw error;
    }
};

export const getUsuarioById = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/usuario/id/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error en encontra el usuario");
        throw error;
    }
};

export const getBiblioteca = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/biblioteca/idUsuario/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error en encontrar las bibliotecas");
        throw error;
    }
};

export const getBibliotecaById = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/biblioteca/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error en encontrar la biblioteca");
        throw error;
    }
};

export const getBibliotecas = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/bibliotecas/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error en encontrar las bibliotecas");
        throw error;
    }
};

export const crearBiblioteca = async (datos) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/bibliotecas/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(datos),
        });
        await verificarStatusToken(res);
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        throw error;
    }
};

export const guardarLibroEnBiblioteca = async (datos) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/bibliotecas/agregarLibro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(datos),
        });
        await verificarStatusToken(res);
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        throw error;
    }
};

export const resultadoBusqueda = async (texto) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/buscar/${texto}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error al obtener resultado: ", error);
        throw error;
    }
};

export const actualizarLibro = async (id, datos) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/updateLibro/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(datos),
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error en actualizarLibro:", error);
        throw error;
    }
};

export const actualizarPersonaje = async (id, datos) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/updatePersonaje/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(datos),
        });
        await verificarStatusToken(res);
        return await res.json();
    } catch (error) {
        console.error("Error en actualizarPersonaje:", error);
        throw error;
    }
};

export const actualizarPerfil = async (id, datos) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/updateUsuario/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(datos),
        });
        await verificarStatusToken(res);
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error en actualizarPerfil:", error);
        throw error;
    }
};

export const loginUsuario = async (nombreUsuario, password) => {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ nombreUsuario, password }),
        });
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error en login:", error);
        throw error;
    }
};

export const registrarUsuario = async (datos) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/nuevoUsuario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        throw error;
    }
};

export const nuevoLibro = async (datos) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/newLibro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(datos),
        });
        await verificarStatusToken(res);
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        throw error;
    }
};

export const nuevoPersonaje = async (datos) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/newPersonaje`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(datos),
        });
        await verificarStatusToken(res);
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        throw error;
    }
};

export const nuevoComentario = async (datos) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/newComentario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(datos),
        });
        await verificarStatusToken(res);
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        throw error;
    }
};

export const eliminarPersonaje = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/eliminarPersonaje/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export const eliminarLibro = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/eliminarLibro/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        await verificarStatusToken(res);
        return { ok: res.ok, data: await res.json() };
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export const eliminarBiblioteca = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/eliminarBiblioteca/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        const data = await res.json(); 
        await verificarStatusToken(res);
        
        return { ok: res.ok, data };
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export const eliminarLibroBiblioteca = async (idBiblioteca, idLibro) => {
    try {
        const token = await SecureStore.getItemAsync('token_sesion');
        const res = await fetch(`${API_URL}/eliminarLibroBiblioteca/${idBiblioteca}/${idLibro}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        });
        const data = await res.json();
        await verificarStatusToken(res);
        
        return { ok: res.ok, data };
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};