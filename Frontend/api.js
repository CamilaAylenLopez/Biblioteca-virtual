const API_URL = 'http://192.168.0.145:3000';

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
        const response = await fetch(`${API_URL}/nuevoRegistro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        return { ok: response.ok, data: await response.json() };
    } catch (error) {
        console.error("Error en registro:", error);
        return { ok: false, data: { mensaje: "Error de red" } };
    }
};