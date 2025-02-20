import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Para decodificar el token
import Home from './pages/Home';
import Login from './pages/Login';
import PanelPrincipal from './pages/PanelPrincipal';
import Productos from './pages/Productos';
import Rubros from './pages/Rubros';
import Tienda from './pages/Tienda';
import Ventas from './pages/Ventas';
import Navbar from './components/Navbar'; 
import GestionProductos from './pages/GestionProductos';
import RegistrarVentas from './pages/RegistrarVentas';
import Reportes from './pages/Reportes';
import './App.css'; 
// Función para verificar si el usuario tiene acceso
const PrivateRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('authToken'); // Obtiene el token del almacenamiento local
  let user = null;

  try {
    if (token) {
      user = jwtDecode(token); // Decodifica el token de manera segura
    }
  } catch (error) {
    console.error('Error al decodificar el token:', error);
  }

  if (!user) {
    return <Navigate to="/" replace />; // Redirige al login si no hay usuario
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />; // Redirige al login si el rol no coincide
  }

  return element;
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas por rol */}
        <Route
          path="/panel"
          element={<PrivateRoute element={<PanelPrincipal />} allowedRoles={['master']} />}
        />
        <Route
          path="/productos"
          element={<PrivateRoute element={<Productos />} allowedRoles={['master']} />}
        />
        <Route
          path="/rubros"
          element={<PrivateRoute element={<Rubros />} allowedRoles={['master']} />}
        />
        <Route
          path="/tienda"
          element={<PrivateRoute element={<Tienda />} allowedRoles={['cliente']} />}
        />
        <Route
          path="/ventas"
          element={<PrivateRoute element={<Ventas />} allowedRoles={['vendedor']} />}
        />
        <Route path="/gestion-productos" element={<PrivateRoute element={<GestionProductos />} />} allowedRoles={['master']} />
        <Route path="/registrar-ventas" element={<PrivateRoute element={<RegistrarVentas />} />} allowedRoles={['master']} />
        <Route path="/reportes" element={<PrivateRoute element={<Reportes />} />} allowedRoles={['master']} />
      </Routes>
    </Router>
  );
};

export default App;



