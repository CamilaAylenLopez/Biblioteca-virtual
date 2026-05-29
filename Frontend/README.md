# Biblioteca Virtual

---

Aplicación móvil desarrollada con React Native y Expo diseñada para la gestión de bibliotecas virtuales personales, permitiendo a los usuarios registrar libros y personajes, buscar información, hacer reseñas y guardar libros.

## Tecnologías utilizadas

### Frontend
- React Native y Expo Framework
- React Navigation
- Expo SecureStore
- AsyncStorage
- Expo ImagePicker
- React Native Community DateTimePicker

### Backend
- Node.js con Express
- JSON Web Token (JWT)
- MySQL
- Bcrypt
- rateLimit

## Estructura del proyecto 
### Frontend
├── api/
│   └── api.js                 # Configuración de Axios/Fetch y peticiones HTTP (Login, Registro, Perfil)
├── img/                       # Assets visuales estáticos (imágenes locales)
│   └── addimage.jpg
│   └── addusericon.jpg
│   └── Imagenotfound.png
│   └── userIcon.webp
├── navigation/
│   └── MainStack.js           # Enrutador principal mediante Stack Navigation
│   └── TabNavigation.js       # Barra de navegación inferior (Tabs) para acceso rápido a las secciones principales
├── screens/                   # Pantallas principales del flujo de la aplicación
│   ├── Login.js               # Pantalla de autenticación con ocultación de contraseña
│   ├── CrearUsuario.js        # Formulario de registro con validaciones Regex
│   └── Home.js                # Feed principal con los libros y publicaciones de los usuarios
│   └── NuevoLibro.js          # Formulario para registrar libros
│   └── NuevoPersonaje.js      # Formulario para registrar personajes
│   └── Buscador.js            # Buscador de personajes y libros filtrados
│   └── Perfil.js              # Vista del perfil del usuario y acceso a sus bibliotecas
│   └── InfoLibro.js           # Detalles e información del libro, sección para hacer reseñas y guardar el libro en alguna biblioteca
│   └── InfoPersonaje.js       # Detalles e información del personaje
│   └── EditarInfoLibro.js     # Formulario de edición para actualizar el libro registrado
│   └── EditarInfoPersonaje.js # Formulario de edición para actualizar el personaje registrado
│   └── EditarPerfil.js        # Gestión de perfil, foto en Base64 y selector de fecha
│   └── DetalleBiblioteca.js   # Vista ampliada y organizada de las colecciones de libros personales del usuario
├── App.js                     # Punto de entrada de la aplicación y lógica de sesión global
└── package.json               # Dependencias y scripts del proyecto

### Backend
├── app.js                     # Servidor Express, endpoints de la API, middlewares de seguridad y consultas SQL (Pool)
├── config.js                  # Variables de entorno y configuraciones centralizadas (puerto, credenciales de base de datos)
├── database.js                # Conexión con la base de datos
└── bibliotecadb.sql           # Base de datos relacional

## Requisitos previos
Antes de levantar el proyecto, asegúrate de tener instalado:
1. Node.js
2. Expo CLI (Instalado globalmente o mediante npx)
3. Expo Go (Aplicación móvil para pruebas en tiempo real)

## Instalación y despliegue