// script.js (¡Reemplazar todo el contenido anterior!)

// Variables para almacenar la URL de la imagen original
let originalImageUrl = '';
let imagenCargada = false;

// --- FUNCIONES LIGHTBOX (se mantienen iguales) ---
function abrirLightbox(imgSrc, titulo) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');

    lightbox.style.display = "block";
    lightboxImage.src = imgSrc;
    lightboxCaption.innerHTML = titulo;
}

function cerrarLightbox() {
    document.getElementById('lightbox').style.display = "none";
}

// --- FUNCIÓN DE SUBIDA Y CÁLCULO REAL ---
async function cargarImagen(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (!file) return;

    // Mostrar la imagen original inmediatamente en el placeholder
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImageUrl = e.target.result;

        const imgOriginal = new Image();
        imgOriginal.src = originalImageUrl;
        imgOriginal.onload = function() {
            imgOriginal.onclick = () => abrirLightbox(imgOriginal.src, 'Imagen Original: Matriz A');
            
            const originalPlaceholder = document.getElementById('originalImagePlaceholder');
            originalPlaceholder.innerHTML = '';
            originalPlaceholder.appendChild(imgOriginal);
            
            imagenCargada = true;
            // Inicializar datos simulados con el tamaño de la imagen real
            const M = imgOriginal.height;
            const N = imgOriginal.width;
            document.getElementById('datosOriginales').textContent = (M * N).toLocaleString();
            
            actualizarK(document.getElementById('rangoK').value);
            
            document.getElementById('compressedImagePlaceholder').innerHTML = 'Imagen cargada. Ajusta k y COMPRIME.';
            document.getElementById('compressedImagePlaceholder').style.backgroundColor = '#e0f7fa';
        };
    };
    reader.readAsDataURL(file);
}

// --- ACTUALIZACIÓN DE K (solo actualiza el cálculo teórico en el front-end) ---
function actualizarK(k) {
    document.getElementById('valorK').textContent = `k = ${k}`;
    const M = 512; // Se usan valores default si no hay imagen
    const N = 512; 
    const DATOS_ORIGINALES = 262144; 

    if (!imagenCargada) {
        document.getElementById('datosComprimidos').textContent = 'N/A';
        document.getElementById('ahorroPorcentaje').textContent = '0%';
        document.getElementById('kFinal').textContent = k;
        return;
    }

    // Aquí solo se simula el cálculo teórico del SVD para la demostración
    const datosComprimidosTeoricos = k * (M + N + 1);
    const ahorroTeorico = ((DATOS_ORIGINALES - datosComprimidosTeoricos) / DATOS_ORIGINALES) * 100;

    document.getElementById('datosComprimidos').textContent = datosComprimidosTeoricos.toLocaleString();
    document.getElementById('ahorroPorcentaje').textContent = `${ahorroTeorico.toFixed(1)}%`;
    document.getElementById('kFinal').textContent = k;
}

// --- FUNCIÓN QUE LLAMA AL SERVIDOR PYTHON ---
async function simularCompresion() {
    if (!imagenCargada) {
        alert("Por favor, primero carga una imagen para simular la compresión.");
        return;
    }

    const fileInput = document.getElementById('imageUpload');
    const k = document.getElementById('rangoK').value;

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('k_value', k);
    
    // Muestra mensaje de carga
    const placeholder = document.getElementById('compressedImagePlaceholder');
    placeholder.innerHTML = '<h2>Calculando SVD...</h2><p>Esto puede tardar unos segundos.</p>';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            const compressedUrl = data.compressed_url;
            
            // 1. Mostrar la imagen comprimida real
            const imgComprimida = new Image();
            imgComprimida.src = compressedUrl;
            imgComprimida.onload = function() {
                 const ahorro = data.ahorro_porcentaje;
                 
                 // 2. Asignar onclick para ver en grande
                 imgComprimida.onclick = () => abrirLightbox(imgComprimida.src, `Resultado SVD (k=${k}) - Ahorro: ${ahorro.toFixed(1)}%`);
                 
                 // 3. Mostrar el resultado en el placeholder
                 placeholder.innerHTML = '';
                 placeholder.appendChild(imgComprimida);
                 
                 let mensaje = `Compresión exitosa (k=${k})`;
                 let bgColor = '#d4edda';
                 if (k < 30) {
                     mensaje = `ALTA COMPRESIÓN. Notarás la pérdida de detalle.`;
                     bgColor = '#ffdddd'; 
                 }
                 
                 placeholder.innerHTML += `<p style="font-size:0.9em; margin-top:5px;">${mensaje}<br>Ahorro: ${ahorro.toFixed(1)}%</p>`;
                 placeholder.style.backgroundColor = bgColor;
                 placeholder.style.transition = 'background-color 0.5s';
                 
                 // 4. Actualizar las estadísticas con datos reales del servidor (SVD teórico)
                 document.getElementById('datosOriginales').textContent = data.datos_originales.toLocaleString();
                 document.getElementById('datosComprimidos').textContent = data.datos_comprimidos_svd.toLocaleString();
                 document.getElementById('ahorroPorcentaje').textContent = `${data.ahorro_porcentaje.toFixed(1)}%`;
                 document.getElementById('kFinal').textContent = k;
            };
            
        } else {
            placeholder.innerHTML = `Error: ${data.error}`;
            placeholder.style.backgroundColor = '#f8d7da';
        }

    } catch (error) {
        placeholder.innerHTML = `Error de conexión con el servidor: ${error.message}`;
        placeholder.style.backgroundColor = '#f8d7da';
    }
}

// Inicializa al cargar la página
window.onload = () => {
    // Nota: Inicialmente no se puede calcular k sin imagen
    document.getElementById('rangoK').value = 50; 
};