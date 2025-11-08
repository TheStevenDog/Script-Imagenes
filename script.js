// Dimensiones simuladas de la matriz (ej. 512x512)
let M = 512;
let N = 512;
let DATOS_ORIGINALES = M * N;
let imagenCargada = false;

// Inicialización de la interfaz (código omitido por brevedad, asume que está en el archivo)

// --- FUNCIONES LIGHTBOX ---
function abrirLightbox(imgElement, titulo) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');

    lightbox.style.display = "block";
    lightboxImage.src = imgElement.src;
    lightboxCaption.innerHTML = titulo;
}

function cerrarLightbox() {
    document.getElementById('lightbox').style.display = "none";
}

// --- FUNCIONES DE LA APLICACIÓN ---

function cargarImagen(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            M = img.height; 
            N = img.width;  
            DATOS_ORIGINALES = M * N;

            // Clonar la imagen para poder asignarle un onclick diferente a cada placeholder
            const imgOriginal = img.cloneNode(true);
            imgOriginal.onclick = () => abrirLightbox(imgOriginal, 'Imagen Original: Matriz A'); // Asignar onclick

            const originalPlaceholder = document.getElementById('originalImagePlaceholder');
            originalPlaceholder.innerHTML = ''; 
            originalPlaceholder.appendChild(imgOriginal);

            imagenCargada = true;
            actualizarK(document.getElementById('rangoK').value);

            document.getElementById('datosOriginales').textContent = DATOS_ORIGINALES.toLocaleString();
            document.getElementById('compressedImagePlaceholder').innerHTML = 'Ajusta k y presiona Simular';
            document.getElementById('compressedImagePlaceholder').style.backgroundColor = '#e0f7fa';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}


function actualizarK(k) {
    document.getElementById('valorK').textContent = `k = ${k}`;
    
    if (!imagenCargada) {
        document.getElementById('datosComprimidos').textContent = 'N/A';
        document.getElementById('ahorroPorcentaje').textContent = '0%';
        document.getElementById('kFinal').textContent = k;
        return;
    }

    const datosComprimidos = k * (M + N + 1);
    const ahorro = ((DATOS_ORIGINALES - datosComprimidos) / DATOS_ORIGINALES) * 100;

    document.getElementById('datosComprimidos').textContent = datosComprimidos.toLocaleString();
    document.getElementById('ahorroPorcentaje').textContent = `${ahorro.toFixed(1)}%`;
    document.getElementById('kFinal').textContent = k;
}

function simularCompresion() {
    if (!imagenCargada) {
        alert("Por favor, primero carga una imagen para simular la compresión.");
        return;
    }

    const k = document.getElementById('rangoK').value;
    const placeholder = document.getElementById('compressedImagePlaceholder');
    const ahorro = parseFloat(document.getElementById('ahorroPorcentaje').textContent);
    const originalImage = document.getElementById('originalImagePlaceholder').querySelector('img');
    
    // Crear la imagen simulada que se puede ver en grande
    const imgSimulada = originalImage.cloneNode(true);
    let mensaje = '';
    let bgColor = '';
    
    if (k < 30) {
        mensaje = `IMAGEN BORROSA (k=${k})`;
        bgColor = '#ffdddd';
        imgSimulada.style.filter = 'blur(2px) grayscale(100%)'; 
    } else if (k < 100) {
        mensaje = `ALTA CALIDAD (k=${k}, Ahorro ${ahorro.toFixed(1)}%)`;
        bgColor = '#d4edda'; 
        imgSimulada.style.filter = 'none';
    } else {
        mensaje = `IMAGEN PERFECTA (k=${k})`;
        bgColor = '#cce5ff';
        imgSimulada.style.filter = 'none';
    }
    
    // Asignar el evento onclick a la imagen simulada
    imgSimulada.onclick = () => abrirLightbox(imgSimulada, `Resultado SVD Simulado: ${mensaje}`);

    // Vaciar placeholder y añadir la imagen simulada
    placeholder.innerHTML = '';
    placeholder.appendChild(imgSimulada);

    // Añadir el párrafo informativo sin usar innerHTML (preserva listeners)
    const infoP = document.createElement('p');
    infoP.style.fontSize = '0.9em';
    infoP.style.marginTop = '5px';
    infoP.innerHTML = `${mensaje}<br>Ahorro: ${ahorro.toFixed(1)}%`;
    placeholder.appendChild(infoP);

    placeholder.style.backgroundColor = bgColor;
    placeholder.style.transition = 'background-color 0.5s';
}

// Inicializa al cargar la página
window.onload = () => {
    actualizarK(document.getElementById('rangoK').value);
};