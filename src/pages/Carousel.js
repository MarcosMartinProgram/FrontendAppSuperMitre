import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

const slides = [
  { src: '/slider1.png', alt: 'Super Mitre - Ofertas' },
  { src: '/slider2.png', alt: 'Super Mitre - Promociones' },
  { src: '/slider3.png', alt: 'Super Mitre - Productos' },
  { src: '/slider4.png', alt: 'Super Mitre - Descuentos' },
];

const Carousel = () => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={0}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      style={{ borderRadius: '20px' }}
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i}>
          <img
            src={slide.src}
            alt={slide.alt}
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '400px' }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;
