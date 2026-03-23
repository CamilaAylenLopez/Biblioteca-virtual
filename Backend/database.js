//conexión con la base de datos

import mysql from 'mysql2/promise';
import { dbConfig } from "./config.js"; 

const pool = mysql.createPool(dbConfig)

export default pool;