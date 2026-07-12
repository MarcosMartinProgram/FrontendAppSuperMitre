const isElectron = () => window && window.electronAPI;

export const login = async (email, password) => {
  if (isElectron()) {
    return await window.electronAPI.validarLogin(email, password);
  }
  const response = await fetch(
    `${process.env.REACT_APP_API_URL || ''}/api/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }
  );
  if (!response.ok) throw new Error('Credenciales incorrectas');
  return response.json();
};

export const register = async (user) => {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL || ''}/api/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }
  );
  if (!response.ok) throw new Error('Error al registrar usuario');
  return response.json();
};
