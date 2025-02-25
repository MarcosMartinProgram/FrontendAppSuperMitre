import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

const Carousel = () => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={10}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
    >
      <SwiperSlide>
        <img src="/cervezas.png" alt="Imagen cervezas"className="home-image"  />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/gaseosas.png" alt="Imagen gaseosas" className="home-image" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/comestibles.png" alt="Imagen comestibles" className="home-image"  />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/lacteos.png" alt="Imagen Lacteos" className="home-image"/>
      </SwiperSlide>
    </Swiper>
  );
};

export default Carousel;
