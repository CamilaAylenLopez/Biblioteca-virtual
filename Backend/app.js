//consultas a la base de datos y las rutas

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from './database.js'
import bcrypt from 'bcrypt'

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Seridor funcionando');
});

app.get('/libros', async (req, res) => {
    try{
        const [libros] = await pool.query('SELECT * FROM libro');
        res.json(libros);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener libros' });
    }
});

app.get('/libros/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const [rows] = await pool.query('SELECT * FROM libro WHERE id = ?', [Number(id)]);
        if(rows.length > 0){
            res.json(rows[0]);
        }else{
            res.status(404).json({ error: 'Libro no encontrado' });
        }
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Error en la BD'});
    }
});

app.get('/libros/genero/:genero', async (req, res) => {
    const generoReq = req.params.genero;

    try{
        const [libros] = await pool.query('SELECT * FROM libro WHERE genero = ?', [generoReq]);
        res.json(libros);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error en la BD' });
    }
});

app.get('/personajes/idLibro/:id', async (req, res) => {
    const idLibro = req.params.id;

    try{
        const [rows] = await pool.query(`
            SELECT p.* FROM personaje p
            INNER JOIN libro_personaje lp ON p.id = lp.personaje_id
            WHERE lp.libro_id = ?`, [idLibro]);

        if(rows.length > 0){
            res.json(rows);
        }else{
           res.json([]);
        }
    }catch(error){
        console.error(error.message);
        res.status(500).json({error: 'Error en la BD'});
    }
});

app.get('/usuario/id/:id', async (req, res) => {
    const id = req.params.id;

    try{
        const [usuario] = await pool.query('SELECT * FROM usuario WHERE id = ?', [id]);
        res.json(usuario);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Error en la bd'});
    }
});

app.get('/personaje/idPersonaje/:id', async (req, res) => {
    const id = req.params.id;

    try{
        const [personajes] = await pool.query('SELECT * FROM personaje WHERE id = ?', [id]);
        if(personajes.length > 0){
            res.json(personajes[0]);
        }else{
            res.status(404).json({ error: 'Personaje no encontrado' });
        }
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Error en la BD'});
    }
});

app.get('/libro/comentarios/idLibro/:id', async (req, res) => {
    const idLibro = req.params.id;

    try{
        const[comentarios] = await pool.query(`
            SELECT c.*, u.nombreUsuario, u.foto_perfil
            FROM comentario c
            INNER JOIN usuario u ON c.usuario_id = u.id
            WHERE c.libro_id = ?`, [idLibro]);
        if(comentarios.length > 0){
            res.json(comentarios);
        }else{
           res.json([]);
        }
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Error en la BD'});
    }
});

app.post('/nuevoUsuario', async (req, res) => {
    const { nombre, apellido, nombreUsuario, email, fecha_nacimiento, password, descripcion, foto_perfil } = req.body;

    try {
        const [yaExiste] = await pool.query('SELECT * FROM usuario WHERE nombreUsuario = ? OR email = ?', [nombreUsuario, email]);

        if (yaExiste.length > 0){
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
            nombre, apellido, nombreUsuario, email, fecha_nacimiento, hashedPassword, descripcion, foto_perfil
        ]);

        res.status(201).json({
            mensaje: 'Usuario creado con exito',
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error al registrar el usuario'});
    }
});

app.post('/login', async (req, res) => {

    try {
        const { nombreUsuario, password } = req.body;

        const [rows] = await pool.query('SELECT * FROM usuario WHERE nombreUsuario = ?', [nombreUsuario]);

        if (rows.length > 0){
            const usuario = rows[0];

            const esValida = await bcrypt.compare(password, usuario.password);

            if (esValida){
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
            }else{
                res.status(401).json({error: 'Contraseña incorrecta'})
            }
            
        }else{
            res.status(401).json({error: 'Usuario no encontrado'});
        }

    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en http://0.0.0.0:${PORT}`);
});