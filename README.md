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
├── .env                       # Configuración de la base de datos
├── app.js                     # Servidor Express, endpoints de la API, middlewares de seguridad y consultas SQL (Pool)
├── config.js                  # Variables de entorno y configuraciones centralizadas (puerto, credenciales de base de datos)
├── database.js                # Pool de conexiones a MySQL utilizando promesas
└── bibliotecadb.sql           # Script de creación de la base de datos relacional, tablas y restricciones

## Requisitos previos
Antes de levantar el proyecto, asegúrate de tener instalado:
1. Node.js
2. Expo CLI (Instalado globalmente o mediante npx)
3. Expo Go (Aplicación móvil para pruebas en tiempo real)
4. MySQL Server o un gestor de base de datos compatible (XAMPP, Laragon, MySQL Workbench)

## Instalación y despliegue
Sigue estos pasos para poner en marcha el proyecto de manera local tanto en el Backend como en el Frontend.
1. Configuración de la Base de Datos (MySQL)
   1. Abre tu gestor de MySQL.
   2. Importa y ejecuta el archivo **bibliotecadb.sql** ubicado en la carpeta del backend para crear la estructura de tablas necesaria.

2. Configuración y despliegue del Backend
   1. Abre una terminal y desplázate a la carpeta del backend:
   ```cd ruta/hacia/tu/proyecto/backend```
   2. Instala todas las dependencias requeridas:
   ```npm install```
   3. Configura las credenciales de tu base de datos y la clave secreta de JWT en el archivo **.env**
   4. Inicializa el servidor Express (el backend debería indicar en la consola que está escuchando en el puerto asignado y conectado exitosamente a MySQL):
   ```node app.js```

3. Configuración y Despliegue del Frontend
   1. Abre una segunda terminal y desplázate a la carpeta del frontend:
   ```cd ruta/hacia/tu/proyecto/frontend```
   2. Instala los paquetes y dependencias del ecosistema Expo:
   ```npm install```
   3. Abre el archivo api/api.js y asegúrate de que la URL base (baseURL) apunte a la dirección IP local de tu computadora en la red Wi-Fi (ejemplo: http://192.168.1.50:3000) si vas a probar en un dispositivo físico con Expo Go, o usa http://localhost:3000 si estás en un emulador web/móvil integrado.
   4. Inicia el servidor de desarrollo de Expo (si es ios agregar **--tunnel** al final para que funcione correctamente):
   ```npx expo start```
   5. Escanea el código QR que aparece en la terminal usando la cámara de tu celular (en iOS) o desde la aplicación Expo Go (en Android) para sincronizar y renderizar la aplicación móvil en tiempo real.