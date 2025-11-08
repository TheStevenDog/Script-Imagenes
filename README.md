# Script-Imagenes

Pequeña app Flask que simula compresión SVD de imágenes. Contenido principal:

- `index.html`, `style.css`, `script.js` — frontend
- `app.py` — backend Flask que recibe la imagen y devuelve la versión "comprimida" por SVD


## ¿Puedo subir esto a GitHub y usarlo como página web?

Sí, puedes subir el código a GitHub, pero hay dos casos distintos:

1) Solo frontend (página estática):
   - Si solo quieres la parte visual y la simulación en el cliente (sin subir imágenes al servidor), puedes usar GitHub Pages para servir `index.html`, `style.css` y `script.js` como página estática.
   - Limitación: la función de subida y la compresión SVD (backend en Python) NO funcionarán en GitHub Pages.
   - Pasos rápidos:
     - Crea un repo, commitea los archivos y empuja a GitHub.
     - En la configuración del repo activa GitHub Pages desde la rama `main` y carpeta `/ (root)` o `docs/`.

2) Frontend + backend (app Flask completa):
   - GitHub Pages no ejecuta Flask. Necesitas un host que ejecute tu servidor Python. Opciones populares y sencillas:
     - Render (https://render.com) — despliegue directo desde GitHub, gratis con limitaciones.
     - Railway, Fly, Replit, PythonAnywhere — alternativas con distintos planes.
   - Qué añadí aquí para facilitar el despliegue:
     - `requirements.txt` — dependencias.
     - `Procfile` — comando para arrancar con Gunicorn.
     - `runtime.txt` — versión de Python.
     - `.gitignore` — ignorar archivos locales.
   - Flujo típico con Render:
     1. Subes este repo a GitHub.
     2. Creas un nuevo "Web Service" en Render y conectas tu repo.
     3. Render detectará `requirements.txt` y ejecutará `pip install -r requirements.txt`.
     4. El comando de inicio se toma del `Procfile` (gunicorn app:app).
     5. Tras deploy, obtendrás una URL pública donde la app funcionará como local.


## Cómo preparar y subir a GitHub (resumen de comandos)

```pwsh
git init
git add .
git commit -m "Initial commit"
# crea un repo en GitHub y añade el remoto
git remote add origin https://github.com/tu-usuario/Script-Imagenes.git
git branch -M main
git push -u origin main
```


## Desplegar en Render (ejemplo rápido)

1. Ve a https://render.com y crea una cuenta.
2. Crea un nuevo `Web Service` -> `Connect a repository` -> selecciona tu repo.
3. Para `Build command` deja vacío (Render detecta python). Para `Start command` deja que use el `Procfile` (o pon `gunicorn app:app`).
4. Espera a que build y deploy terminen; tu servicio quedará publicado.


## Alternativa: mantener frontend público en GitHub Pages y usar un backend separado

Puedes publicar el frontend en GitHub Pages y desplegar solo el backend en Render/Replit. En `script.js` solo tendrás que apuntar las llamadas `fetch('/upload')` a la URL pública del backend (por ejemplo `https://mi-backend.onrender.com/upload`).


## Si quieres, hago esto por ti:

- Crear el repo y subirlo a GitHub (necesitaré que me des el remoto o que ejecutes los comandos locales).
- Configurar un deploy automático en Render (puedo generar los pasos exactos).

Dime cuál opción prefieres: 1) `GitHub Pages (solo frontend)` 2) `Deploy completo (frontend+Flask) en Render/Replit/etc.` — y preparo los pasos concretos y/o automatizo los archivos restantes.
