import { Badge } from "@/components/ui/badge";
import { Utensils, PartyPopper } from "lucide-react";

const services = [
  {
    icon: <Utensils className="h-6 w-6" />,
    title: "Wedding Catering",
    description: "Premium catering services tailored for weddings, including customized menus, buffet setups, and full-service food coordination for your special day.",
    features: ["Customized Menus", "Buffet Setups", "Full-service Coordination"],
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop"
  },
  {
    icon: <Utensils className="h-6 w-6" />,
    title: "Corporate Catering",
    description: "Professional catering for business meetings, conferences, office events, seminars, and corporate gatherings.",
    features: ["Business Meetings", "Office Events", "Seminars"],
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop"
  },
  {
    icon: <PartyPopper className="h-6 w-6" />,
    title: "Social Event Catering",
    description: "Catering for birthdays, anniversaries, naming ceremonies, family gatherings, and other social celebrations.",
    features: ["Birthdays", "Anniversaries", "Family Gatherings"],
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop"
  },
  {
    icon: <Utensils className="h-6 w-6" />,
    title: "Local & Traditional Dishes",
    description: "Authentic preparation of a variety of Nigerian local dishes, served with quality ingredients and great presentation.",
    features: ["Nigerian Local Dishes", "Quality Ingredients", "Great Presentation"],
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop"
  },
  {
    icon: <Utensils className="h-6 w-6" />,
    title: "International Cuisine",
    description: "A selection of continental and international meals prepared to suit diverse tastes and event styles.",
    features: ["Continental Meals", "International Flavors", "Diverse Tastes"],
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&auto=format&fit=crop"
  },
  {
    icon: <Utensils className="h-6 w-6" />,
    title: "Buffet & Small Chops",
    description: "Buffet-style service featuring a variety of meals, snacks, finger foods, and small chops perfect for parties and large gatherings.",
    features: ["Buffet-style", "Small Chops", "Finger Foods"],
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop"
  },
];

export function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-purple-600 text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Comprehensive event solutions tailored to make your occasion
              unforgettable. From intimate gatherings to grand celebrations,
              we've got you covered.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col"
            >
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-6 space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Event?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Let our professional team help you create an unforgettable
            experience. Browse our verified vendors or contact us for
            personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/search"
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Vendors
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/30"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
