import { howItWorksSteps } from "@/data/mockData";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 bg-white" data-aos="fade-up">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            data-aos="fade-up"
          >
            Our Specialties
          </h2>
          <p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            We take pride in delivering exceptional dining experiences.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.map((step, index) => (
            <div 
              key={step.step} 
              className="relative text-center"
              data-aos="fade-up"
              data-aos-delay={index * 150}
            >
              {/* Step Number Circle */}
              <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary shadow-lg">
                <span className="text-5xl font-bold text-white">
                  {step.step}
                </span>
              </div>

              {/* Step Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
