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

app.get('/personajes/idPersonaje/:id', async (req, res) => {
    const idPersonaje = req.params.id;

    try{
        const [personajes] = await pool.query('SELECT * FROM personaje WHERE id = ?', [idPersonaje]);
        res.json(personajes);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Error en la BD'});
    }
});

app.post('/nuevoRegistro', async (req, res) => {
    const { nombre, apellido, nombreUsuario, email, fecha_nacimiento, password, descripcion } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
        INSERT INTO usuario
        (nombre, apellido, nombreUsuario, email, fecha_nacimiento, password, descripcion)
        VALUES (?,?,?,?,?,?,?)`;

        const [result] = await pool.query(query, [
            nombre, apellido, nombreUsuario, email, fecha_nacimiento, hashedPassword, descripcion
        ]);

        res.status(201).json({
            mensaje: 'Usuario creado con exito',
        })
    } catch (error) {
        console.error(error);
        //si ya existia el mail o nombre de usuario
        if (error.code == 'ER_DUP_ENTRY'){
            return res.status(409).json({error: 'El email o nombre de usuario ya están registrados'});
        }
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
                res.status(200).json({
                mensaje: 'Login exitoso',
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    nombreUsuario: usuario.nombreUsuario,
                    email: usuario.email,
                    descripcion: usuario.descripcion
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