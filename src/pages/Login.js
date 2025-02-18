import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login } from '../helpers/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login(email, password, isNewUser ? nombre : null);
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
      if (error.message === 'Usuario no encontrado') {
        setIsNewUser(true); // Mostrar campo de nombre
      } else {
        setError(error.message || 'Ocurrió un error');
      }
    }
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
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
        <button type="submit">{isNewUser ? 'Registrarse' : 'Iniciar Sesión'}</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;

