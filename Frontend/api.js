const API_URL = 'http://192.168.0.196:3000';

export const getLibros = async () => {
    try {
        const res = await fetch(`${API_URL}/libros`);
        return await res.json();
    } catch (error){
        console.error("Error al obtener libros: ", error);
    }
};

export const getLibrosByGenero = async (genero) => {
    try{
        const res = await fetch(`${API_URL}/libros/${genero}`);
        return await res.json();
    } catch(error){
        console.error("Error al filtrar por género: ", error);
    }
};

export const getComentariosByIdLibro = async (idLibro) => {
    try{
        const res = await fetch(`${API_URL}/libro/comentarios/idLibro/${idLibro}`);
        return await res.json();
    }catch(error){
        console.error("Error al enocntrar comentarios: ", error);
    }
};

export const getPersonajeById = async (idPersonaje) => {
    try{
        const res = await fetch(`${API_URL}/personaje/idPersonaje/${idPersonaje}`);
        return await res.json();
    }catch(error){
        console.error("Error al encontrar personaje: ", error);
    }
};

export const getLibrosById = async (id) => {
    try{
        const res = await fetch(`${API_URL}/libros/${id}`);
        return await res.json();
    }catch(error){
        console.error("Error al obtener libro por id: ", error);
    }
};

export const getPersonajesByIdLibro = async (id) => {
    try{
        const res = await fetch(`${API_URL}/personajes/idLibro/${id}`);
        return await res.json();
    }catch(error){
        console.error("Error al obtener ids de los personajes asociados a determinado libro");
    }
};

export const getUsuarioById = async (id) => {
    try{
        const res = await fetch(`${API_URL}/usuario/id/${id}`);
        return await res.json();
    }catch(error){
        console.error("Error en encontra el usuario");
    }
};

export const getBiblioteca = async (id) => {
    try{
        const res = await fetch(`${API_URL}/biblioteca/idUsuario/${id}`);
        return await res.json();
    }catch(error){
        console.error("Error en encontrar las bibliotecas");
    }
};

export const loginUsuario = async (nombreUsuario, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreUsuario, password }),
        });
        return { ok: response.ok, data: await response.json() };
    } catch (error) {
        console.error("Error en login:", error);
        return { ok: false, data: { mensaje: "Error de conexión" } };
    }
};

export const registrarUsuario = async (datos) => {
    try {
        const response = await fetch(`${API_URL}/nuevoUsuario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        return { ok: response.ok, data: await response.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        return { ok: false, data: { error: "Error de red" } };
    }
};

export const nuevoLibro = async (datos) => {
    try {
        const response = await fetch(`${API_URL}/newLibro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        return { ok: response.ok, data: await response.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        return { ok: false, data: { error: "Error de red" } };
    }
};

export const nuevoPersonaje = async (datos) => {
    try {
        const response = await fetch(`${API_URL}/newPersonaje`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        return { ok: response.ok, data: await response.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        return { ok: false, data: { error: "Error de red" } };
    }
};

export const nuevoComentario = async (datos) => {
    try {
        const response = await fetch(`${API_URL}/newComentario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        return { ok: response.ok, data: await response.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        return { ok: false, data: { error: "Error de red" } };
    }
};