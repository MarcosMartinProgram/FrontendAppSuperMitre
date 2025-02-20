import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <img src="/portada.svg" alt='Logo' className="home-image" />
      <h1>Bienvenido a nuestra Tienda</h1>
      <p>Compra lo que necesitas de manera rápida y sencilla.</p>
      <Link to="/login">
        <button>Ingresar</button>
      </Link>
    </div>
  );
};

export default Home;
//frontend\public\portada.svg