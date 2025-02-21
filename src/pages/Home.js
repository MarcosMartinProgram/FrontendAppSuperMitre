import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from './Carousel';


const Home = () => {
  return (
    <div className="home-container">
      <img src="/portada.png" alt='Logo' className="home-image" />
      <Carousel />
      <h1>Bienvenido a nuestra Tienda</h1>
      <p>Compra lo que necesitas de manera rápida y sencilla.</p>
      <Link to="/login">
        <button>Ingresar</button>
      </Link>
    </div>
  );
};

export default Home;
