# Biblioteca Virtual

---

## Acerca del proyecto
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
```
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
```

### Backend
```
├── .env                       # Configuración de la base de datos
├── app.js                     # Servidor Express, endpoints de la API, middlewares de seguridad y consultas SQL (Pool)
├── config.js                  # Variables de entorno y configuraciones centralizadas (puerto, credenciales de base de datos)
├── database.js                # Pool de conexiones a MySQL utilizando promesas
└── bibliotecadb.sql           # Script de creación de la base de datos relacional, tablas y restricciones
```

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
   ```
   env
   PORT=3000
   DB_HOST=localhost
   DB_USER=tu_usuario_mysql
   DB_PASS=tu_contraseña_mysql
   DB_NAME=bibliotecadb
   JWT_SECRET=tu_clave_secreta_super_segura
   ```
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

## Endpoints de la API
### Libros:
- **GET** '/libros' - Devuleve todos los libros
- **GET** 'libros/:id' - Devuelve el libro con determinado id
- **GET** '/libros/genero/:genero' - Devuelve todos los libros de determinado genero

### Autenticación y Usuarios
- 


## Caracteristicas principales
- **Autenticación Segura:** Registro e inicio de sesión protegidos mediante hashing de contraseñas con `bcrypt` y sesiones manejadas por `JWT`.
- **Persistencia Local Dual:** Uso de `SecureStore` para datos sensibles (tokens) y `AsyncStorage` para optimizar la carga del perfil del usuario en modo offline.
- **Seguridad en la API:** Implementación de `rateLimit` para prevenir ataques de fuerza bruta o saturación de peticiones en el servidor.
- **Carga de Imágenes Optimizada:** Selección, recorte y compresión de portadas y fotos de perfil directamente desde el dispositivo usando `Expo ImagePicker`, almacenadas en formato Base64 (`LONGTEXT`).
- **Buscador Inteligente:** Filtro en tiempo real para localizar libros y personajes al instante.

## Algunas capturas de pantallas
<img src="https://res.cloudinary.com/drigjw61u/image/upload/v1780059232/loginTFG.jpg" width="250" />     <img src="https://res.cloudinary.com/drigjw61u/image/upload/v1780059398/WhatsApp_Image_2026-05-29_at_2.40.48_PM_1_cy7bqk.jpg" width="250" />     <img src="https://res.cloudinary.com/drigjw61u/image/upload/v1780059397/WhatsApp_Image_2026-05-29_at_2.40.48_PM_2_jtjrji.jpg" width="250" /> 
<img src="https://res.cloudinary.com/drigjw61u/image/upload/v1780059397/WhatsApp_Image_2026-05-29_at_2.40.48_PM_3_kbdyz2.jpg" width="250" />     <img src="https://res.cloudinary.com/drigjw61u/image/upload/v1780059398/WhatsApp_Image_2026-05-29_at_2.40.48_PM_5_pttspf.jpg" width="250" />     <img src="https://res.cloudinary.com/drigjw61u/image/upload/v1780059398/WhatsApp_Image_2026-05-29_at_2.40.48_PM_6_vjxzwf.jpg" width="250" /> 
<img src="https://res.cloudinary.com/drigjw61u/image/upload/v1780059397/WhatsApp_Image_2026-05-29_at_2.40.48_PM_4_tl478n.jpg" width="250" /> 

## Autor
Desarrollado por Camila Lopez - 2026.