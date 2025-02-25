// frontend pages/Login.js
import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login, register } from '../helpers/auth';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [numero_whatsapp, setNumero_whatsapp] = useState('');
  const [direccion, setDireccion] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log("Datos enviados desde el frontend:", {
        email,
        password,
        nombre,
        numero_whatsapp,
        direccion,
        isNewUser
      });
  
      let data;
      
      if (isNewUser) {
        // Si es un usuario nuevo, usar el endpoint de registro
        data = await register({
          email,
          password,
          nombre,
          numero_whatsapp,
          direccion
        });
      } else {
        // Si no, usar login
        data = await login(email, password);
      }
  
      console.log("Respuesta del backend:", data);
  
      if (!data.token) {
        throw new Error("No se recibió un token. Verifica la API.");
      }
  
      localStorage.setItem('authToken', data.token);
  
      const decodedToken = jwtDecode(data.token);
      const userRole = decodedToken.rol;
  
      switch (userRole) {
        case 'master':
          window.location.href = '/panel';
          break;
        case 'cliente':
          window.location.href = '/tienda';
          break;
        case 'vendedor':
          window.location.href = '/ventas';
          break;
        default:
          window.location.href = '/';
      }
    } catch (error) {
      console.error("Error en login/register:", error);
      setError(error.message || 'Ocurrió un error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>{isNewUser ? 'Registrarse' : 'Iniciar Sesión'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isNewUser && (
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          )}
          {isNewUser && (
            <input
              type="text"
              placeholder="Numero de whatsapp"
              value={numero_whatsapp}
              onChange={(e) => setNumero_whatsapp(e.target.value)}
              required
            />
          )}
          {isNewUser && (
            <input
              type="text"
              placeholder="Direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
            />
          )}
          <button type="submit">{isNewUser ? 'Registrarse' : 'Iniciar Sesión'}</button>
        </form>
        <p className="toggle-text">
          {isNewUser ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <span onClick={() => setIsNewUser(!isNewUser)}>
            {isNewUser ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </p>
        <Link to="/" className="back-home">Volver a inicio</Link>
      </div>
    </div>
  );
};

export default Login;


