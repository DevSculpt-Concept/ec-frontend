import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, HelpCircle } from "lucide-react";
import { useState } from "react";
import { SupportTicketModal } from "@/components/support/SupportTicketModal";

export function ContactPage() {
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  return (
    <>
      <SupportTicketModal
        open={supportModalOpen}
        onOpenChange={setSupportModalOpen}
        defaultCategory="general"
      />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or need help? We're here to assist you. Reach out to
              us and we'll get back to you as soon as possible.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setSupportModalOpen(true)}
                size="lg"
                className="cursor-pointer"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Create Support Ticket
              </Button>
            </div>
          </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {/* Contact Information */}
          <div className="space-y-8 w-full max-w-2xl">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">support@thecurryfabulousfamily.com</p>
                    <p className="text-gray-600">info@thecurryfabulousfamily.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">08068130812</p>
                    <p className="text-gray-600">09150967985</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Address
                    </h3>
                    <p className="text-gray-600">
                      100 cele bus stop opposite st.rapheal hospital
                      <br />
                      ijede road ikorodu
                      <br />
                      lagos, Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-sm p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Office Hours</h3>
              <div className="space-y-2 text-white/90">
                <div className="flex justify-between items-center text-lg font-semibold py-2">
                  <span>Open 24/7</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Always Available</span>
                </div>
                <p className="text-sm opacity-80 italic">We are free all day, including Sundays, to assist you.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
