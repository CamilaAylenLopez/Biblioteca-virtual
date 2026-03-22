const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Para que el backend entienda JSON

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('¡El servidor de la Biblioteca Virtual funciona!');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});