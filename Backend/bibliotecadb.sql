-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-03-2026 a las 20:36:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bibliotecadb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `biblioteca`
--

CREATE TABLE `biblioteca` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `usuario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `biblioteca`
--

INSERT INTO `biblioteca` (`id`, `nombre`, `usuario_id`) VALUES
(1, 'Mis Favoritos', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `biblioteca_libro`
--

CREATE TABLE `biblioteca_libro` (
  `biblioteca_id` int(11) NOT NULL,
  `libro_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `biblioteca_libro`
--

INSERT INTO `biblioteca_libro` (`biblioteca_id`, `libro_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentario`
--

CREATE TABLE `comentario` (
  `id` int(11) NOT NULL,
  `texto` text NOT NULL,
  `estrellas` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `libro_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `libro`
--

CREATE TABLE `libro` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(100) NOT NULL,
  `sinopsis` text NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `calificacion` double DEFAULT NULL,
  `lanzamiento` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `libro`
--

INSERT INTO `libro` (`id`, `titulo`, `autor`, `sinopsis`, `imagen_url`, `calificacion`, `lanzamiento`) VALUES
(1, 'percy jackson y el ladrón del rayo', 'Rick Riordan', 'Tras descubrir que él es el hijo del dios griego Poseidón, un joven se convierte en el principal sospechoso del robo del relámpago de Zeus.', 'https://m.media-amazon.com/images/I/81i9IrRKWrL._AC_UF1000,1000_QL80_.jpg', 5, '2005-06-01'),
(2, 'Don Quijote de la Mancha', 'Miguel de Cervantes', 'Las aventuras de un hidalgo que enloquece leyendo libros de caballería...', NULL, 4.7, '1605-01-16'),
(3, 'La sombra del viento', 'Carlos Ruiz Zafón', 'Un joven descubre un libro misterioso que cambiará su vida...', NULL, 4.6, '2001-04-01'),
(4, 'El amor en los tiempos del cólera', 'Gabriel García Márquez', 'Una historia de amor que perdura durante décadas...', NULL, 4.5, '1985-09-05'),
(5, '1984', 'George Orwell', 'Una sociedad distópica vigilada por un régimen totalitario...', NULL, 4.7, '1949-06-08'),
(6, 'El principito', 'Antoine de Saint-Exupéry', 'Un pequeño príncipe viaja por diferentes planetas aprendiendo sobre la vida...', NULL, 4.8, '1943-04-06'),
(7, 'Rayuela', 'Julio Cortázar', 'Una novela experimental que puede leerse de múltiples formas...', NULL, 4.4, '1963-06-28'),
(8, 'Fahrenheit 451', 'Ray Bradbury', 'En un futuro donde los libros están prohibidos, los bomberos los queman...', NULL, 4.6, '1953-10-19'),
(9, 'Crónica de una muerte anunciada', 'Gabriel García Márquez', 'La historia de un asesinato anunciado que nadie evita...', NULL, 4.5, '1981-03-01'),
(10, 'El código Da Vinci', 'Dan Brown', 'Un thriller que mezcla arte, religión y conspiraciones...', NULL, 4.3, '2003-03-18'),
(11, 'Los juegos del hambre', 'Suzanne Collins', 'Un futuro distópico donde jóvenes luchan por sobrevivir en un reality mortal...', NULL, 4.4, '2008-09-14'),
(12, 'Harry Potter y la piedra filosofal', 'J.K. Rowling', 'Un niño descubre que es mago y comienza su educación en Hogwarts...', NULL, 4.8, '1997-06-26'),
(13, 'El señor de los anillos: La comunidad del anillo', 'J.R.R. Tolkien', 'Un grupo emprende una misión para destruir un anillo poderoso...', NULL, 4.9, '1954-07-29'),
(14, 'Orgullo y prejuicio', 'Jane Austen', 'Una historia romántica en la Inglaterra del siglo XIX...', NULL, 4.6, '1813-01-28'),
(15, 'Matar a un ruiseñor', 'Harper Lee', 'Una historia sobre justicia y racismo en el sur de Estados Unidos...', NULL, 4.7, '1960-07-11'),
(16, 'La chica del tren', 'Paula Hawkins', 'Una mujer observa algo sospechoso desde el tren que cambia su vida...', NULL, 4.1, '2015-01-13'),
(17, 'It', 'Stephen King', 'Un grupo de amigos enfrenta a una entidad maligna que toma forma de sus miedos...', NULL, 4.5, '1986-09-15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `libro_personaje`
--

CREATE TABLE `libro_personaje` (
  `libro_id` int(11) NOT NULL,
  `personaje_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `libro_personaje`
--

INSERT INTO `libro_personaje` (`libro_id`, `personaje_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personaje`
--

CREATE TABLE `personaje` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `personaje`
--

INSERT INTO `personaje` (`id`, `nombre`, `imagen_url`, `descripcion`) VALUES
(1, 'Percy Jackson', 'https://static.wikia.nocookie.net/olympians/images/1/10/Percy_Jackson.jpg/revision/latest?cb=20180319172727', 'Percy Jackson es el protagonista semidiós de la popular saga literaria Percy Jackson y los dioses del Olimpo, escrita por Rick Riordan. Es hijo de Poseidón, dios del mar, y la mortal Sally Jackson. Percy es conocido por ser valiente, sarcástico, leal a sus amigos y por controlar el agua, luchar con la espada y tener dislexia y TDAH (causados por su naturaleza mestiza)');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `nombreUsuario` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `apellido`, `nombreUsuario`, `email`, `fecha_nacimiento`, `password`, `descripcion`) VALUES
(1, 'Tamara', 'Gonzalez', 'Tamaris', 'tamaragonzalez@gmail.com', '2006-01-01', '9262f4ab4511f01be266301a6c77accf', ''),
(2, 'Silvia', 'Perez', 'silviP', 'silviaperez@gmail.com', '1990-03-02', 'f7c4bdfe01ea463b98baf382e9b839d3', ''),
(3, 'Camila', 'Lopez', 'camilaLopez', 'camilalopez@gmail.com', '2006-01-01', 'e10adc3949ba59abbe56e057f20f883e', ''),
(4, 'Leo', 'Messi', 'pulga10', 'leo@gmail.com', '1987-06-24', '56754', ''),
(5, 'Marta', 'Perez', 'martita01', 'marta@gmail.com', '1987-06-24', '$2b$10$3bwZJPvxSAvSYjYQJ3aHNOgYoIilKFFkogIodaswdBjQa5TgPnR5C', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `biblioteca`
--
ALTER TABLE `biblioteca`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `biblioteca_libro`
--
ALTER TABLE `biblioteca_libro`
  ADD PRIMARY KEY (`biblioteca_id`,`libro_id`),
  ADD KEY `libro_id` (`libro_id`),
  ADD KEY `biblioteca_id` (`biblioteca_id`);

--
-- Indices de la tabla `comentario`
--
ALTER TABLE `comentario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `libro_id` (`libro_id`);

--
-- Indices de la tabla `libro`
--
ALTER TABLE `libro`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `libro_personaje`
--
ALTER TABLE `libro_personaje`
  ADD PRIMARY KEY (`libro_id`,`personaje_id`),
  ADD KEY `personaje_id` (`personaje_id`),
  ADD KEY `libro_id` (`libro_id`);

--
-- Indices de la tabla `personaje`
--
ALTER TABLE `personaje`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombreUsuario` (`nombreUsuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `biblioteca`
--
ALTER TABLE `biblioteca`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `comentario`
--
ALTER TABLE `comentario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `libro`
--
ALTER TABLE `libro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `personaje`
--
ALTER TABLE `personaje`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `biblioteca`
--
ALTER TABLE `biblioteca`
  ADD CONSTRAINT `biblioteca_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `biblioteca_libro`
--
ALTER TABLE `biblioteca_libro`
  ADD CONSTRAINT `biblioteca_libro_ibfk_1` FOREIGN KEY (`biblioteca_id`) REFERENCES `biblioteca` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `biblioteca_libro_ibfk_2` FOREIGN KEY (`libro_id`) REFERENCES `libro` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `comentario`
--
ALTER TABLE `comentario`
  ADD CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comentario_ibfk_2` FOREIGN KEY (`libro_id`) REFERENCES `libro` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `libro_personaje`
--
ALTER TABLE `libro_personaje`
  ADD CONSTRAINT `libro_personaje_ibfk_1` FOREIGN KEY (`libro_id`) REFERENCES `libro` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `libro_personaje_ibfk_2` FOREIGN KEY (`personaje_id`) REFERENCES `personaje` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
