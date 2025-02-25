import React from "react";
import "./footer.css"; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Super Mitre - Todos los derechos reservados.</p>
        <p> Imagenes a modo ilustrativo</p>
        <p>
          Síguenos en:
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"> Facebook</a> |
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"> Instagram</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
