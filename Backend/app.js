//consultas a la base de datos y las rutas

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from './database.js'
import bcrypt from 'bcrypt'
import { createRequire } from 'module';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const limitadorGeneral = rateLimit({
    //hasta 100 peticiones en 15 minutos
    windowMs: 15 * 60 * 1000,
    max: 500,
    handler: (req, res) => {
        console.log(`IP BLOQUEADA (General): ${req.ip}`);
        
        return res.status(429).json({ 
            ok: false, 
            error: 'Demasiadas peticiones desde esta IP, intenta más tarde.' 
        });
    }
});
app.use(limitadorGeneral)

const limitadorLogin = rateLimit({
    //10 intentos en 15 minutos
    windowMs: 15 * 60 * 1000,
    max: 10,
    handler: (req, res, next, options) => {
        console.log(`INTENTOS DE LOGIN EXCEDIDOS para la IP: ${req.ip}`);
        return res.status(429).json({ ok: false, error: 'Demasiados intentos de inicio de sesión. Bloqueado por 15 minutos.' });
    }
});

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ ok: false, error: 'Acceso denegado. Token inexistente.' });
    }
    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado;
        next();
    } catch (error) {
        return res.status(403).json({ ok: false, error: 'Token inválido o expirado.' });
    }
};

app.get('/', (req, res) => {
    res.send('Seridor funcionando');
});

app.get('/libros', verificarToken, async (req, res) => {
    try {
        const [libros] = await pool.query('SELECT * FROM libro');
        res.json(libros);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener libros' });
    }
});

app.get('/libros/genero/:genero', verificarToken, async (req, res) => {
    const generoReq = req.params.genero;

    try {
        const [libros] = await pool.query('SELECT * FROM libro WHERE genero = ?', [generoReq]);
        res.json(libros);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la BD' });
    }
});

app.get('/libros/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM libro WHERE id = ?', [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Libro no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la BD' });
    }
});

app.get('/personajes/idLibro/:id', verificarToken, async (req, res) => {
    const idLibro = req.params.id;

    try {
        const [rows] = await pool.query(`
            SELECT p.* FROM personaje p
            INNER JOIN libro_personaje lp ON p.id = lp.personaje_id
            WHERE lp.libro_id = ?`, [idLibro]);

        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en la BD' });
    }
});

app.get('/usuario/id/:id', verificarToken, async (req, res) => {
    const id = req.params.id;

    try {
        const [usuario] = await pool.query('SELECT id, nombre, apellido, nombreUsuario, email, fecha_nacimiento, descripcion, foto_perfil FROM usuario WHERE id = ?', [id]);
        if (usuario.length > 0) {
            res.json(usuario[0]);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la bd' });
    }
});

app.get('/personaje/idPersonaje/:id', verificarToken, async (req, res) => {
    const id = req.params.id;

    try {
        const [personajes] = await pool.query('SELECT * FROM personaje WHERE id = ?', [id]);
        if (personajes.length > 0) {
            res.json(personajes[0]);
        } else {
            res.status(404).json({ error: 'Personaje no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la BD' });
    }
});

app.get('/libro/comentarios/idLibro/:id', verificarToken, async (req, res) => {
    const idLibro = req.params.id;

    try {
        const [comentarios] = await pool.query(`
            SELECT c.*, u.nombreUsuario, u.foto_perfil
            FROM comentario c
            INNER JOIN usuario u ON c.usuario_id = u.id
            WHERE c.libro_id = ?`, [idLibro]);
        if (comentarios.length > 0) {
            res.json(comentarios);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la BD' });
    }
});

app.get('/biblioteca/:id', verificarToken, async (req, res) => {
    const idBiblioteca = req.params.id;

    try {
        const [biblioteca] = await pool.query(`
            SELECT bl.biblioteca_id, l.id AS libro_id, l.titulo, l.imagen_url
            FROM libro l
            INNER JOIN biblioteca_libro bl on l.id = bl.libro_id
            WHERE bl.biblioteca_id = ?`, [idBiblioteca]);
        res.json(biblioteca)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la BD' });
    }
});

app.get('/biblioteca/idUsuario/:id', verificarToken, async (req, res) => {
    const idUsuario = req.params.id;

    try {
        const [biblioteca] = await pool.query(`
            SELECT b.id AS biblioteca_id, b.nombre, b.usuario_id, bl.libro_id, l.titulo, l.imagen_url
            FROM biblioteca b
            LEFT JOIN biblioteca_libro bl ON b.id = bl.biblioteca_id
            LEFT JOIN libro l ON l.id = bl.libro_id
            WHERE b.usuario_id = ?`, [idUsuario]);
        res.json(biblioteca)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la BD' });
    }
});

app.get('/bibliotecas/:id', verificarToken, async (req, res) => {
    const idUsuario = req.params.id;
    try {
        const [rows] = await pool.query('SELECT id, nombre FROM biblioteca WHERE usuario_id = ?', [idUsuario]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener bibliotecas ' });
    }
});

app.post('/bibliotecas/crear', verificarToken, async (req, res) => {
    const { idUsuario, nombre } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO biblioteca (nombre, usuario_id) VALUES (?,?)', [nombre, idUsuario]);
        res.status(201).json({
            ok: true,
            id_biblioteca: result.insertId, nombre
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear biblioteca' });
    }
});

app.post('/bibliotecas/agregarLibro', verificarToken, async (req, res) => {
    const { biblioteca_id, libro_id } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO biblioteca_libro (biblioteca_id, libro_id) VALUES (?,?)', [biblioteca_id, libro_id]);
        res.status(201).json({
            ok: true,
            mensaje: 'Libro guardao en biblioteca',
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar libro en biblioteca' });
    }
});

app.get('/buscar/:texto', verificarToken, async (req, res) => {
    const texto = req.params.texto;
    const busqueda = `%${texto}%`;

    try {
        const [libros] = await pool.query('SELECT id, titulo as nombre, "libro" as tipo, imagen_url FROM libro WHERE titulo LIKE ? OR autor LIKE ?', [busqueda, busqueda]);
        const [personajes] = await pool.query('SELECT id, nombre, "personaje" as tipo, imagen_url FROM personaje WHERE nombre LIKE ?', [busqueda]);

        const result = [...libros, ...personajes];
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Error en la búsqueda" });
    }
});

app.post('/newComentario', verificarToken, async (req, res) => {
    const { texto, estrellas, usuario_id, libro_id } = req.body;

    try {
        const query = `
            INSERT INTO comentario
            (texto, estrellas, usuario_id, libro_id)
            VALUES (?,?,?,?)
        `;
        const [result] = await pool.query(query, [
            texto, estrellas || null, usuario_id, libro_id
        ]);
        const queryCalificacionLibro = `
            UPDATE libro
            SET calificacion = (
                SELECT AVG(estrellas)
                FROM comentario
                WHERE libro_id = ?
            )
            WHERE id = ?`;
        const [resultD] = await pool.query(queryCalificacionLibro, [libro_id, libro_id]);
        res.status(201).json({
            ok: true,
            mensaje: 'Cometario publicado con exito',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al publicar el comentario' });
    }
});

app.post('/newLibro', verificarToken, async (req, res) => {
    const { titulo, autor, sinopsis, imagen_url, calificacion, lanzamiento, genero } = req.body;

    try {
        const query = `
            INSERT INTO libro
            (titulo, autor, sinopsis, imagen_url, calificacion, lanzamiento, genero)
            VALUES (?,?,?,?,?,?,?)`;
        const [result] = await pool.query(query, [
            titulo, autor, sinopsis || null, imagen_url || null, calificacion || null, lanzamiento || null, genero
        ]);
        res.status(201).json({
            ok: true,
            mensaje: 'Libro creado con exito',
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el libro' });
    }
});

app.put('/updateLibro/:id', verificarToken, async (req, res) => {
    const id = req.params.id;
    const { titulo, autor, sinopsis, imagen_url, calificacion, lanzamiento, genero } = req.body;

    try {
        const query = `
            UPDATE libro
            SET titulo = ?,  autor = ?, sinopsis = ?, imagen_url = ?, calificacion = ?, lanzamiento = ?, genero = ?
            WHERE id = ?`;
        const [result] = await pool.query(query, [
            titulo, autor, sinopsis, imagen_url, calificacion, lanzamiento, genero, id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "No se encontro el libro" });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Libro actualizado correctamente',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el libro' });
    }
});

app.put('/updatePersonaje/:id', verificarToken, async (req, res) => {
    const id = req.params.id;
    const { nombre, imagen_url, descripcion } = req.body;

    try {
        const query = `
            UPDATE personaje
            SET nombre = ?, imagen_url = ?, descripcion = ?
            WHERE id = ?`;
        const [result] = await pool.query(query, [
            nombre, imagen_url, descripcion, id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "No se encontro el personaje" });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Personaje actualizado correctamente',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar personaje' });
    }
});

app.put('/updateUsuario/:id', verificarToken, async (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, nombreUsuario, email, fecha_nacimiento, descripcion, foto_perfil } = req.body;

    try {
        const [yaExiste] = await pool.query('SELECT * FROM usuario WHERE (nombreUsuario = ? OR email = ?) AND id != ?', [nombreUsuario, email, id]);

        if (yaExiste.length > 0) {
            const mensaje = yaExiste[0].email === email
                ? "El email ya esta registrado"
                : "El nombre de usuario ya esta registrado"
            return res.status(400).json({
                ok: false,
                error: mensaje
            });
        };

        const query = `
            UPDATE usuario
            SET nombre = ?, apellido = ?, nombreUsuario = ?, email = ?, fecha_nacimiento = ?, descripcion = ?, foto_perfil = ?
            WHERE id = ?`;

        const [result] = await pool.query(query, [
            nombre, apellido, nombreUsuario, email, fecha_nacimiento, descripcion, foto_perfil, id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "No se encontro el usuario" });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Perfil actualizado correctamente',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar perfil' });
    }
});

app.post('/newPersonaje', verificarToken, async (req, res) => {
    const { idLibro, nombre, imagen_url, descripcion } = req.body;

    try {
        const queryPersonaje = `
            INSERT INTO personaje
            (nombre, imagen_url, descripcion)
            VALUES (?,?,?)`;
        const [result] = await pool.query(queryPersonaje, [nombre, imagen_url || null, descripcion || null]);

        const personajeId = result.insertId;

        const queryRelacion = `
            INSERT INTO libro_personaje
            (libro_id, personaje_id)
            VALUES (?,?)`;
        const [resultD] = await pool.query(queryRelacion, [
            idLibro, personajeId
        ]);
        res.status(201).json({
            ok: true,
            mensaje: 'Personaje creado con exito',
            idPersonaje: personajeId
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el personaje' });
    }
});

app.post('/login', limitadorLogin, async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body);
    try {
        const { nombreUsuario, password } = req.body;

        const [rows] = await pool.query('SELECT * FROM usuario WHERE nombreUsuario = ?', [nombreUsuario]);

        if (rows.length > 0) {
            const usuario = rows[0];
            const esValida = await bcrypt.compare(password, usuario.password);

            if (esValida) {
                delete usuario.password;
                const token = jwt.sign(
                    { usuarioId: usuario.id, email: usuario.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' } // o sea vence en 7 días
                )
                res.status(200).json({
                    mensaje: 'Login exitoso',
                    ok: true,
                    token,
                    usuario
                });
            } else {
                res.status(401).json({ error: 'Contraseña incorrecta' })
            }

        } else {
            res.status(401).json({ error: 'Usuario no encontrado' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/nuevoUsuario', async (req, res) => {
    const { nombre, apellido, nombreUsuario, email, fecha_nacimiento, password, descripcion, foto_perfil } = req.body;

    try {
        const [yaExiste] = await pool.query('SELECT * FROM usuario WHERE nombreUsuario = ? OR email = ?', [nombreUsuario, email]);

        if (yaExiste.length > 0) {
            const mensaje = yaExiste[0].email === email ? "El email ya esta registrado" : "El nombre de usuario ya esta registrado";
            return res.status(400).json({
                ok: false,
                error: mensaje
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
        INSERT INTO usuario
        (nombre, apellido, nombreUsuario, email, fecha_nacimiento, password, descripcion, foto_perfil)
        VALUES (?,?,?,?,?,?,?,?)`;

        const [result] = await pool.query(query, [
            nombre, apellido || null, nombreUsuario, email, fecha_nacimiento || null, hashedPassword, descripcion || null, foto_perfil || null
        ]);

        const nuevoUsuarioId = result.insertId;

        const token = jwt.sign(
            { usuarioId: nuevoUsuarioId, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // o sea vence en 7 días
        )

        res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado con exito',
            token,
            usuario: {
                id: result.insertId,
                nombre: nombre,
                apellido: "",
                nombreUsuario: nombreUsuario,
                email: email,
                fecha_nacimiento: "",
                descripcion: "",
                foto_perfil: null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: 'Error al registrar el usuario' });
    }
});

app.delete('/eliminarPersonaje/:id', verificarToken, async (req, res) => {
    const id = req.params.id;
    try {
        const [result] = await pool.query('DELETE FROM personaje WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "No se encontro personaje" });
        }
        res.json({ ok: true, mensaje: "Personaje eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar personaje" });
    }
});

app.delete('/eliminarLibro/:id', verificarToken, async (req, res) => {
    const id = req.params.id;
    try {
        const [result] = await pool.query('DELETE FROM libro WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "No se encontro libro" });
        }
        res.json({ ok: true, mensaje: "Libro eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar libro" });
    }
});

app.delete('/eliminarBiblioteca/:id', verificarToken, async (req, res) => {
    const id = req.params.id;
    const usuario_id = req.usuario.usuarioId;
    try {
        const [result] = await pool.query('DELETE FROM biblioteca WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "No se encontro biblioteca o no tienes permiso para completar esta acción." });
        }
        res.json({ ok: true, mensaje: "biblioteca eliminada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar biblioteca" });
    }
});

app.delete('/eliminarLibroBiblioteca/:biblioteca_id/:libro_id', verificarToken, async (req, res) => {
    const { biblioteca_id, libro_id } = req.params;
    const usuario_id = req.usuario.usuarioId;
    console.log("Biblioteca ID enviado:", biblioteca_id);
    console.log("Libro ID enviado:", libro_id);
    console.log("Usuario ID del Token:", usuario_id);
    try {
        const [result] = await pool.query(`
            DELETE bl 
            FROM biblioteca_libro bl
            INNER JOIN biblioteca b ON bl.biblioteca_id = b.id
            WHERE bl.biblioteca_id = ? AND bl.libro_id = ? AND b.usuario_id = ?
            `, [biblioteca_id, libro_id, usuario_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, mensaje: "No se encontro el libro en la biblioteca o no tienes permiso para completar esta acción." });
        }
        res.json({ ok: true, mensaje: "libro eliminado de biblioteca" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar libro de biblioteca" });
    }
});

app.use((err, req, res, next) => {
    console.error("Error no controlado detectado:", err.stack);
    res.status(500).json({ ok: false, error: 'Ocurrio un error interno en el servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en http://0.0.0.0:${PORT}`);
});