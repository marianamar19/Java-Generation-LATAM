// js/utils/api.js
const API_BASE_URL = 'http://localhost:8080';

// Usar sessionStorage (más seguro que localStorage)
let authToken = sessionStorage.getItem('hera_token');
let currentUser = JSON.parse(sessionStorage.getItem('hera_user') || 'null');

export function setAuth(token, user) {
    authToken = token;
    currentUser = user;
    sessionStorage.setItem('hera_token', token);
    sessionStorage.setItem('hera_user', JSON.stringify(user));
}

export function clearAuth() {
    authToken = null;
    currentUser = null;
    sessionStorage.removeItem('hera_token');
    sessionStorage.removeItem('hera_user');
}

export function getCurrentUser() {
    return currentUser;
}

export function isAuthenticated() {
    return !!authToken;
}

export function isAdmin() {
    return currentUser && currentUser.rol === 'ADMIN';
}

export async function authFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const config = { ...options, headers };
    
    try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
            console.warn('Token expirado. Redirigiendo a login...');
            clearAuth();
            const currentPath = window.location.pathname;
            if (!currentPath.includes('cuenta.html')) {
                sessionStorage.setItem('redirectAfterLogin', currentPath);
            }
            window.location.href = '/pages/cuenta.html';
            throw new Error('Sesión expirada');
        }
        
        return response;
    } catch (error) {
        if (error.message === 'Sesión expirada') throw error;
        throw new Error('Error de conexión con el servidor');
    }
}

export async function get(endpoint) {
    const response = await authFetch(endpoint, { method: 'GET' });
    return response.json();
}

export async function post(endpoint, data) {
    const response = await authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function put(endpoint, data) {
    const response = await authFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function del(endpoint) {
    const response = await authFetch(endpoint, { method: 'DELETE' });
    if (response.status === 204) return null;
    return response.json();
}

// ========== ENDPOINTS ESPECÍFICOS ==========

export async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Credenciales inválidas');
    }
    
    const data = await response.json();
    setAuth(data.token, { email: data.email, nombre: data.nombre, rol: data.rol });
    return data;
}

export async function register(nombre, email, password, telefono = '') {
    const response = await fetch(`${API_BASE_URL}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, email, password, telefono })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en el registro');
    }
    
    const data = await response.json();
    setAuth(data.token, { email: data.email, nombre: data.nombre, rol: data.rol });
    return data;
}

export async function logout() {
    try {
        await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    clearAuth();
    window.location.href = '/pages/cuenta.html';
}

export async function getPerfil() {
    return get('/api/usuario/perfil');
}

export async function updatePerfil(data) {
    return put('/api/usuario/perfil', data);
}

export async function updateEmail(nuevoEmail) {
    return put('/api/usuario/email', { nuevoEmail });
}

export async function updatePassword(passwordActual, nuevaPassword) {
    return put('/api/usuario/password', { passwordActual, nuevaPassword });
}

export async function getProductos() {
    const response = await fetch(`${API_BASE_URL}/api/productos`);
    return response.json();
}

export async function getProductosByTipo(tipo) {
    const response = await fetch(`${API_BASE_URL}/api/productos/tipo/${tipo}`);
    return response.json();
}

export async function getProductoBySlug(slug) {
    const response = await fetch(`${API_BASE_URL}/api/productos/slug/${slug}`);
    return response.json();
}

export async function searchProductos(query) {
    const url = query 
        ? `${API_BASE_URL}/api/productos/buscar?q=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/api/productos`;
    const response = await fetch(url);
    return response.json();
}

export async function getCarrito() {
    return get('/api/carrito');
}

export async function addToCart(varianteId, cantidad) {
    return post('/api/carrito/items', { varianteId, cantidad });
}

export async function updateCartItem(itemId, cantidad) {
    return put(`/api/carrito/items/${itemId}?cantidad=${cantidad}`, {});
}

export async function removeCartItem(itemId) {
    return del(`/api/carrito/items/${itemId}`);
}

export async function clearCart() {
    return del('/api/carrito/vaciar');
}

export async function getDirecciones() {
    return get('/api/direcciones');
}

export async function createDireccion(data) {
    return post('/api/direcciones', data);
}

export async function updateDireccion(id, data) {
    return put(`/api/direcciones/${id}`, data);
}

export async function deleteDireccion(id) {
    return del(`/api/direcciones/${id}`);
}

export async function getFavoritos() {
    return get('/api/favoritos');
}

export async function addFavorito(productoId) {
    return post(`/api/favoritos/${productoId}`, {});
}

export async function removeFavorito(productoId) {
    return del(`/api/favoritos/${productoId}`);
}

export async function isFavorito(productoId) {
    const response = await get(`/api/favoritos/check/${productoId}`);
    return response.esFavorito;
}

// ========== ADMIN - PRODUCTOS ==========

export async function createProducto(productoData) {
    return post('/api/productos', productoData);
}

export async function updateProducto(id, productoData) {
    return put(`/api/productos/${id}`, productoData);
}

export async function deleteProducto(id) {
    return del(`/api/productos/${id}`);
}

export async function getAdminProductos() {
    return get('/api/productos/admin/todos');
}

// ========== NUEVOS MÉTODOS PARA PRODUCTO DETALLE ==========

/**
 * Obtiene un producto por su ID numérico
 * @param {Number} id - ID numérico del producto
 */
export async function getProductoById(id) {
    const response = await fetch(`${API_BASE_URL}/api/productos/${id}`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
}

/**
 * Obtiene productos similares por tipo/categoría
 * @param {string} tipo - 'perfumes' o 'joyeria'
 * @param {string} productIdExcluir - ID del producto actual para excluirlo
 * @param {number} limite - Cantidad máxima de productos similares (default 4)
 */
export async function getProductosSimilares(tipo, productIdExcluir, limite = 4) {
    try {
        const productos = await getProductosByTipo(tipo);
        return productos.filter(p => p.productId !== productIdExcluir).slice(0, limite);
    } catch (error) {
        console.error('Error cargando productos similares:', error);
        return [];
    }
}

/**
 * Obtiene reseñas de un producto
 * @param {string} productId - ID del producto
 */
export async function getResenasProducto(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/productos/${productId}/resenas`);
        if (!response.ok) return [];
        return response.json();
    } catch (error) {
        console.warn('Endpoint de reseñas no disponible:', error);
        return [];
    }
}

/**
 * Publica una reseña de un producto
 * @param {string} productId - ID del producto
 * @param {Object} reviewData - Datos de la reseña { calificacion, comentario, autor, ciudad }
 */
export async function postResena(productId, reviewData) {
    return post(`/api/productos/${productId}/resenas`, reviewData);
}

/**
 * Obtiene el historial de modificaciones de un producto (solo ADMIN)
 * @param {Number} id - ID numérico del producto
 */
export async function getProductoHistorial(id) {
    return get(`/api/productos/${id}/historial`);
}

// ========== MÉTODOS PARA CARDS DEL INDEX ==========

// Productos destacados → hero card del index
export async function getDestacados() {
    const response = await fetch(`${API_BASE_URL}/api/productos/destacados`);
    return response.json();
}

// Productos bestsellers → carrusel del index
export async function getBestsellers() {
    const response = await fetch(`${API_BASE_URL}/api/productos/bestsellers`);
    return response.json();
}

// Productos nuevos → sección editorial del index
export async function getNuevos() {
    const response = await fetch(`${API_BASE_URL}/api/productos/nuevos`);
    return response.json();
}