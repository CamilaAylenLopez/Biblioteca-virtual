//consultas a la base de datos y las rutas

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from './database.js'
import bcrypt from 'bcrypt'
import e from 'express';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.send('Seridor funcionando');
});

app.get('/libros', async (req, res) => {
    try {
        const [libros] = await pool.query('SELECT * FROM libro');
        res.json(libros);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener libros' });
    }
});

app.get('/libros/:id', async (req, res) => {
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

app.get('/libros/genero/:genero', async (req, res) => {
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

app.get('/personajes/idLibro/:id', async (req, res) => {
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

app.get('/usuario/id/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const [usuario] = await pool.query('SELECT * FROM usuario WHERE id = ?', [id]);
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

app.get('/personaje/idPersonaje/:id', async (req, res) => {
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

app.get('/libro/comentarios/idLibro/:id', async (req, res) => {
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

app.get('/biblioteca/idUsuario/:id', async (req, res) => {
    const idUsuario = req.params.id;

    try {
        const [biblioteca] = await pool.query(`
            SELECT b.id, b.nombre, b.usuario_id, bl.biblioteca_id, bl.libro_id, l.titulo, l.imagen_url
            FROM biblioteca_libro bl
            LEFT JOIN biblioteca b ON b.id = bl.biblioteca_id
            INNER JOIN libro l on l.id = bl.libro_id
            WHERE b.usuario_id = ?`, [idUsuario]);
        res.json(biblioteca)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la BD' });
    }
});

app.get('/bibliotecas/:id', async (req, res) => {
    const idUsuario = req.params.id;
    try {
        const [rows] = await pool.query('SELECT id, nombre FROM biblioteca WHERE usuario_id = ?', [idUsuario]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener bibliotecas ' });
    }
});

app.post('/bibliotecas/crear', async (req, res) => {
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

app.post('/bibliotecas/agregarLibro', async (req, res) => {
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

app.get('/buscar/:texto', async (req, res) => {
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

app.post('/newComentario', async (req, res) => {
    const { texto, estrellas, usuario_id, libro_id } = req.body;

    try {
        const query = `
            INSERT INTO comentario
            (texto, estrellas, usuario_id, libro_id)
            VALUES (?,?,?,?)
        `;
        const [result] = await pool.query(query, [
            texto, estrellas, usuario_id, libro_id
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

app.post('/newLibro', async (req, res) => {
    const { titulo, autor, sinopsis, imagen_url, calificacion, lanzamiento, genero } = req.body;

    try {
        const query = `
            INSERT INTO libro
            (titulo, autor, sinopsis, imagen_url, calificacion, lanzamiento, genero)
            VALUES (?,?,?,?,?,?,?)`;
        const [result] = await pool.query(query, [
            titulo, autor, sinopsis, imagen_url, calificacion, lanzamiento, genero
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

app.put('/updateLibro/:id', async (req, res) => {
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

app.put('/updatePersonaje/:id', async (req, res) => {
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

app.put('/updateUsuario/:id', async (req, res) => {
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

app.post('/newPersonaje', async (req, res) => {
    const { idLibro, nombre, imagen_url, descripcion } = req.body;

    try {
        const queryPersonaje = `
            INSERT INTO personaje
            (nombre, imagen_url, descripcion)
            VALUES (?,?,?)`;
        const [result] = await pool.query(queryPersonaje, [nombre, imagen_url, descripcion]);

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

app.post('/login', async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body);
    try {
        const { nombreUsuario, password } = req.body;

        const [rows] = await pool.query('SELECT * FROM usuario WHERE nombreUsuario = ?', [nombreUsuario]);

        if (rows.length > 0) {
            const usuario = rows[0];

            const esValida = await bcrypt.compare(password, usuario.password);

            if (esValida) {
                delete usuario.password;
                res.status(200).json({
                    mensaje: 'Login exitoso',
                    usuario: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        apellido: usuario.apellido,
                        nombreUsuario: usuario.nombreUsuario,
                        email: usuario.email,
                        descripcion: usuario.descripcion,
                        foto_perfil: usuario.foto_perfil
                    }
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
            const mensaje = yaExiste[0].email === email
                ? "El email ya esta registrado"
                : "El nombre de usuario ya esta registrado"
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
            nombre, apellido || null, nombreUsuario, email, fecha_nacimiento|| null, hashedPassword, descripcion|| null, foto_perfil || null
        ]);

        res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado con exito',
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
        res.status(500).json({ok: false, error: 'Error al registrar el usuario' });
    }
});

app.delete('/eliminarPersonaje/:id', async (req, res) =>{
    const id = req.params.id;
    try{
        const [result] = await pool.query('DELETE FROM personaje WHERE id = ?', [id]);
        if(result.affectedRows === 0){
            return res.status(404).json({ok: false, mensaje: "No se encontro personaje"});
        }
        res.json({ ok: true, mensaje: "Personaje eliminado" });
    }catch(error){
        console.error(error);
        res.status(500).json({ok: false, mensaje: "Error al eliminar personaje"});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en http://0.0.0.0:${PORT}`);
});