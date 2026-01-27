# 🛒 Super Mitre | Frontend Web
> **Sistema de Gestión y Punto de Venta Profesional para Supermercados.**

---

## 💻 Tecnologías Core

| Frontend Framework | Styling & UI | Build Tool | Package Manager |
| :---: | :---: | :---: | :---: |
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) | ![pnpm](https://img.shields.io/badge/pnpm-4a4a4a?style=for-the-badge&logo=pnpm&logoColor=f69220) |

---

## 📌 Descripción del Proyecto

Este repositorio contiene la interfaz de usuario del ecosistema **Super Mitre**. Es una Single Page Application (SPA) diseñada para ofrecer una experiencia fluida y rápida, ideal para entornos de alta rotación como la caja de un supermercado.

### 🌟 Funcionalidades Destacadas
* **POS (Point of Sale):** Gestión de ventas con carga dinámica de productos.
* **Admin Dashboard:** Control total sobre el inventario, precios y categorías.
* **Auth System:** Manejo de sesiones seguras mediante JWT.
* **Responsive Design:** Adaptabilidad garantizada para pantallas de escritorio y tablets.

---

## 🛠️ Stack Técnico Detallado

* **Estado Global:** React Context API para manejo de carrito y autenticación.
* **Comunicación:** Axios con interceptores para inyección automática de tokens.
* **Ruteo:** React Router para una navegación fluida entre módulos.
* **Arquitectura:** Organización por capas (Services, Hooks, Components).

---

## 📂 Estructura de Carpetas

```text
src/
 ├── components/    # Componentes atómicos y reutilizables
 ├── views/         # Vistas principales de la aplicación
 ├── hooks/         # Lógica de negocio (Custom Hooks)
 ├── services/      # Abstracción de llamadas a la API
 └── context/       # Estado global (Auth & Cart)
```

🚀 Instalación y Uso
Sigue estos pasos para levantar el proyecto localmente:

1. Clonar el repositorio

git clone [https://github.com/MarcosMartinProgram/FrontendAppSuperMitre.git](https://github.com/MarcosMartinProgram/FrontendAppSuperMitre.git)

2. Instalar dependencias

pnpm install

3. Configurar el entorno Crea un archivo .env en la raíz con la URL de tu API:

VITE_API_URL=http://localhost:5000/api

4. Correr el proyecto

pnpm dev

👤 Autor
Marcos Martin Tecnico Superior en Desarrollo de Software, enfocado en soluciones eficientes.
