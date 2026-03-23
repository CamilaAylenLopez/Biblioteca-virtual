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
    try {
        const [libros] = await pool.query('SELECT * FROM libro');
        res.json(libros);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la BD' });
    }
});


app.post('/nuevoRegistro', async (req, res) => {
    const { nombre, apellido, nombreUsuario, email, telefono, fecha_nacimiento, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
        INSERT INTO usuario
        (nombre, apellido, nombreUsuario, email, telefono, fecha_nacimiento, password)
        VALUES (?,?,?,?,?,?,?)`;

        const [result] = await pool.query(query, [
            nombre, apellido, nombreUsuario, email, telefono, fecha_nacimiento, hashedPassword
        ]);

        res.status(201).json({
            mensaje: 'Usuario creado con exito',
        })
    } catch (error) {
        console.error(error);
        //si ya existia el mail o nombre de usuario o el telefono
        if (error.code == 'ER_DUP_ENTRY'){
            return res.status(409).json({error: 'El email o nombre de usuario o telefono ya están registrados'});
        }
        res.status(500).json({error: 'Error al registrar el usuario'});
    }
});

app.post('/login', async (req, res) => {
    const { nombreUsuario, password } = req.body;

    try {
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
                    telefono: usuario.telefono
                }
                });
            } else{
                res.status(401).json({error: 'Contraseña incorrecta'})
            }
            
        } else{
            res.status(401).json({error: 'Usuario no encontrado'});
        }

    } catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});