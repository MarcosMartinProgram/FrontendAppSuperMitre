// /helpers/auth.js
const isElectron = () => window && window.electronAPI;

export const login = async (email, password, nombre = null, numero_whatsapp = null, direccion = null) => {
  if (isElectron()) {
    return await window.electronAPI.validarLogin(email, password);
  } else {
    const response = await fetch('https://cacmarcos.alwaysdata.net/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre, numero_whatsapp, direccion }),
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud');
    }
    
    const data = await response.json();
    console.log("Respuesta del servidor:", data); // Agrega este log para ver la respuesta
    return data;
  
  }
};

export const register = async (user) => {
  const response = await fetch('https://cacmarcos.alwaysdata.net/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error('Error al registrar usuario');
  }
  return await response.json();
};
