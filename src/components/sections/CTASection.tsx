import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-32 bg-white" data-aos="fade-up">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            data-aos="fade-up"
          >
            Ready to Plan Your Perfect Event?
          </h2>
          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto mb-10"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Join thousands of satisfied customers who found their perfect event
            vendors through The Curry Fabulous Family
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <Link to="/search">
              <Button size="lg" className="min-w-[200px]">
                Search Vendors
              </Button>
            </Link>
           
          </div>
        </div>
      </div>
    </section>
  );
}
