CREATE DATABASE IF NOT EXISTS bibliotecadb;

USE bibliotecadb;

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    nombreUsuario VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono varchar(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    password VARCHAR(255) NOT NULL
);


CREATE TABLE libro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(100),
    sinopsis TEXT,
    imagen_url VARCHAR(255),
    calificacion DOUBLE,
    lanzamiento DATE
);

CREATE TABLE biblioteca (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE biblioteca_libro (
    biblioteca_id INT,
    libro_id INT,
    PRIMARY KEY (biblioteca_id, libro_id),
    FOREIGN KEY (biblioteca_id) REFERENCES biblioteca(id) ON DELETE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libro(id) ON DELETE CASCADE
);

CREATE TABLE personaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen_url VARCHAR(255),
    descripcion TEXT
);

CREATE TABLE libro_personaje (
    libro_id INT,
    personaje_id INT,
    PRIMARY KEY (libro_id, personaje_id),
    FOREIGN KEY (libro_id) REFERENCES libro(id) ON DELETE CASCADE,
    FOREIGN KEY (personaje_id) REFERENCES personaje(id) ON DELETE CASCADE
);

CREATE TABLE comentario(
    id INT AUTO_INCREMENT PRIMARY KEY,
    texto TEXT NOT NULL,
    estrellas INT NOT NULL,
    usuario_id INT,
    libro_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libro(id) ON DELETE CASCADE
);