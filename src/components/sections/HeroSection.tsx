import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const heroMedia = [
  { type: "image", src: "/images/hero-1.jpeg" },
  { type: "image", src: "/images/hero-2.jpeg" },
  { type: "image", src: "/images/hero-3.jpeg" },
  { type: "image", src: "/images/hero-4.jpeg" },
  { type: "image", src: "/images/hero-5.jpeg" },
  { type: "image", src: "/images/hero-6.jpeg" },
  { type: "image", src: "/images/hero-7.jpeg" },
  { type: "image", src: "/images/hero-8.jpeg" },
  { type: "image", src: "/images/hero-9.jpeg" },
  { type: "image", src: "/images/hero-10.jpeg" },
  { type: "video", src: "/images/hero-video.mp4", poster: "/images/hero-poster.jpeg" }
];

export function HeroSection() {
  const navigate = useNavigate();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % heroMedia.length);
    }, 6000); // Change slide every 6 seconds
    return () => clearInterval(interval);
  }, []);



  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Media Carousel */}
      <div className="absolute inset-0 z-0 bg-black">
        {heroMedia.map((media, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentMediaIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {media.type === "image" ? (
              <img
                src={media.src}
                alt="Hero Background"
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
              />
            ) : (
              <video
                src={media.src}
                poster={media.poster}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center"
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 text-center">
        <h1
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-6"
          data-aos="fade-down"
          data-aos-duration="1000"
        >
          Connect  with    Perfect
          <br />
          <span className="text-primary-300">Catering Services</span>
        </h1>
        <div
          className="mx-auto max-w-3xl text-sm md:text-base text-white/90 mb-10 text-justify md:text-center space-y-4"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="1000"
        >
          <p>
            The Curry Fabulous Family delivers exceptional catering for every occasion. From authentic local favorites to elegant international cuisine, our experienced team ensures a memorable dining experience for weddings, corporate events, and private gatherings of any scale.
          </p>
        </div>

        {/* Simplified Call to Action */}
        <div 
          className="flex justify-center"
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="1000"
        >
          <Button size="lg" className="rounded-xl px-8" onClick={() => navigate('/services')}>
            Explore Our Services
          </Button>
        </div>
      </div>
    </section>
  );
}
