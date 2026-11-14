import { mockApi } from "@/api/mockApi";
import { useQuery } from "@tanstack/react-query";

export function StatsSection() {
  const { data: stats = [] } = useQuery({
    queryKey: ["stats"],
    queryFn: mockApi.getStats,
  });

  return (
    <section className="py-28 bg-primary" data-aos="fade-up">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="text-3xl font-bold text-white sm:text-4xl mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-white/90 sm:text-base font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
