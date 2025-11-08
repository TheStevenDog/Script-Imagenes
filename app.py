import os
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory
from scipy.linalg import svd

app = Flask(__name__)
# Rutas de almacenamiento
UPLOAD_FOLDER = 'uploads'
COMPRESSED_FOLDER = 'compressed'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(COMPRESSED_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['COMPRESSED_FOLDER'] = COMPRESSED_FOLDER

# --- Función central de Compresión SVD ---
def compress_image_svd(file_path, k):
    """Carga, comprime usando SVD, y guarda la imagen."""
    
    # Cargar y convertir a escala de grises
    img_color = Image.open(file_path).convert('L')
    matriz_original = np.array(img_color, dtype=float)
    m, n = matriz_original.shape

    # 1. Aplicar SVD
    # scipi.linalg.svd es más eficiente para matrices grandes que np.linalg.svd
    U, s, Vh = svd(matriz_original, full_matrices=False)
    
    # 2. Reconstrucción con k componentes
    k = min(k, len(s)) # Asegura que k no exceda el número de valores singulares
    
    sigma_k = np.diag(s[:k])
    
    # Reconstrucción: U_k @ sigma_k @ Vh_k
    A_k = U[:, :k] @ sigma_k @ Vh[:k, :]
    
    # 3. Preparar la matriz para guardar
    # Asegurar que los valores estén entre 0 y 255 y sean enteros
    A_k = np.clip(A_k, 0, 255).astype(np.uint8)
    
    # 4. Guardar la imagen comprimida
    compressed_img = Image.fromarray(A_k, 'L')
    compressed_filename = f"comp_{k}_{os.path.basename(file_path)}"
    compressed_path = os.path.join(app.config['COMPRESSED_FOLDER'], compressed_filename)
    compressed_img.save(compressed_path)

    # Cálculo de ahorro de datos (simulado para el front-end)
    datos_originales = m * n # Número de píxeles
    datos_comprimidos_svd = k * (m + n + 1) # Datos teóricos a almacenar
    ahorro_porcentaje = (1 - (datos_comprimidos_svd / datos_originales)) * 100
    
    return compressed_filename, datos_originales, datos_comprimidos_svd, ahorro_porcentaje

# --- Rutas de la Aplicación ---

@app.route('/')
def index():
    # Sirve el archivo HTML principal sin decodificar en Python (evita errores de encoding)
    # Usar send_from_directory permite que Flask entregue el archivo tal cual en bytes.
    return send_from_directory('.', 'index.html')


# Rutas para servir assets estáticos en la raíz del proyecto
@app.route('/style.css')
def style_css():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def script_js():
    return send_from_directory('.', 'script.js')

@app.route('/favicon.ico')
def favicon():
    # Si no existe, Flask retornará 404 automáticamente
    return send_from_directory('.', 'favicon.ico')

@app.route('/upload', methods=['POST'])
def upload_and_compress():
    if 'image' not in request.files or 'k_value' not in request.form:
        return jsonify({"error": "Faltan datos (imagen o k)"}), 400

    file = request.files['image']
    k_value = int(request.form['k_value'])

    if file.filename == '':
        return jsonify({"error": "No se seleccionó archivo"}), 400
    
    # Guardar el archivo original
    original_filename = file.filename
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)
    file.save(file_path)

    # Llamar a la función de compresión SVD
    compressed_filename, datos_originales, datos_comprimidos_svd, ahorro = compress_image_svd(file_path, k_value)

    # Devolver los resultados al front-end
    return jsonify({
        "success": True,
        "original_filename": original_filename,
        "compressed_filename": compressed_filename,
        "datos_originales": datos_originales,
        "datos_comprimidos_svd": datos_comprimidos_svd,
        "ahorro_porcentaje": ahorro,
        "original_url": f'/uploads/{original_filename}',
        "compressed_url": f'/compressed/{compressed_filename}'
    })

# Ruta para servir archivos estáticos (imágenes)
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/compressed/<filename>')
def compressed_file(filename):
    return send_from_directory(app.config['COMPRESSED_FOLDER'], filename)

if __name__ == '__main__':
    # Para la exposición, usar host='0.0.0.0' para acceso local
    app.run(debug=True, host='0.0.0.0')