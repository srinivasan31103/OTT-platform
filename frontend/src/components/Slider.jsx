import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Mousewheel } from 'swiper/modules';
import MovieCard from './MovieCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

const Slider = ({ title, items, isLoading = false, series = false }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  if (isLoading) {
    return (
      <div className="px-4 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 sm:h-72 lg:h-80 bg-slate-800 rounded-lg loading-skeleton"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="section-spacing-small">
      <h2 className="heading-section mb-6">{title}</h2>

      <div className="relative group">
        {/* Custom Cyberpunk Navigation Buttons */}
        <button
          ref={prevRef}
          className="swiper-button-prev-custom absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-neon-purple to-neon-pink text-white p-4 rounded-full opacity-0 group-hover:opacity-100 group-hover:left-2 transition-all duration-500 disabled:opacity-0 disabled:cursor-not-allowed hover:scale-110"
          style={{
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.8), 0 0 50px rgba(236, 72, 153, 0.5)'
          }}
        >
          <ChevronLeft size={28} />
        </button>

        <button
          ref={nextRef}
          className="swiper-button-next-custom absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-neon-pink to-neon-purple text-white p-4 rounded-full opacity-0 group-hover:opacity-100 group-hover:right-2 transition-all duration-500 disabled:opacity-0 disabled:cursor-not-allowed hover:scale-110"
          style={{
            boxShadow: '0 0 25px rgba(236, 72, 153, 0.8), 0 0 50px rgba(168, 85, 247, 0.5)'
          }}
        >
          <ChevronRight size={28} />
        </button>

        <Swiper
          modules={[Navigation, FreeMode, Mousewheel]}
          spaceBetween={50}
          slidesPerView="auto"
          grabCursor={true}
          freeMode={{
            enabled: true,
            sticky: false,
            momentum: true,
            momentumRatio: 1,
            momentumVelocityRatio: 1,
          }}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          slidesPerGroup={1}
          speed={300}
          watchSlidesProgress={true}
          breakpoints={{
            320: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            640: {
              slidesPerView: 3,
              spaceBetween: 28
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 36
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 44
            },
            1536: {
              slidesPerView: 6,
              spaceBetween: 50
            },
          }}
          className="!pb-8"
          style={{ overflow: 'visible' }}
        >
          {items.map((item) => (
            <SwiperSlide key={item._id} style={{ width: 'auto', paddingRight: '0' }}>
              <MovieCard movie={item} series={series} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Slider;
