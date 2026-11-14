import { mockApi } from "@/api/mockApi";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ServicesSection() {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: mockApi.getServices,
  });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1);
      } else if (width < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollability = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isAtStart = Math.abs(scrollLeft) < 1;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      setCanScrollLeft(!isAtStart);
      setCanScrollRight(!isAtEnd);
    };

    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkScrollability, 100);

    container.addEventListener("scroll", checkScrollability);
    window.addEventListener("resize", checkScrollability);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [services, itemsPerView]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Get the first card element to calculate width
    const cards = container.querySelectorAll("div[class*='flex-none']");
    if (cards.length === 0) return;

    const card = cards[0] as HTMLElement;
    const cardWidth = card.offsetWidth + 24; // card width + gap (gap-6 = 24px)

    container.scrollBy({
      left:
        direction === "left"
          ? -cardWidth * itemsPerView
          : cardWidth * itemsPerView,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-32 bg-primary-50" data-aos="fade-up">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            data-aos="fade-up"
          >
            Our Services
          </h2>
          <p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Connect with verified professionals across all event service
            categories
          </p>
        </div>

        {/* Services Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-primary-500 text-white rounded-full p-2 shadow-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hidden lg:flex items-center justify-center"
            aria-label="Previous services"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-primary-500 text-white rounded-full p-2 shadow-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hidden lg:flex items-center justify-center"
            aria-label="Next services"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 overflow-hidden h-full">
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <CardContent className="p-6">
                      <div className="bg-primary-100 p-3 w-10 h-10 flex items-center justify-center mb-3 rounded-lg">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
