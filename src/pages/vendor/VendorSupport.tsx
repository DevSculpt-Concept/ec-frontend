import { VendorLayout } from "@/components/layout/VendorLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ChevronDown,
  BookOpen,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { useUserTickets } from "@/hooks/useSupport";
import { SupportTicketModal } from "@/components/support/SupportTicketModal";

const faqs = [
  {
    category: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        q: "How do I complete my vendor profile?",
        a: "Navigate to Profile Management in your dashboard. Fill in all required fields including business name, services offered, pricing, and upload quality photos of your work.",
      },
      {
        q: "How long does verification take?",
        a: "Vendor verification typically takes 24-48 hours. Our team reviews your profile, credentials, and portfolio to ensure quality standards.",
      },
    ],
  },
  {
    category: "Bookings & Payments",
    icon: DollarSign,
    questions: [
      {
        q: "When do I receive payment?",
        a: "Payments are processed after event completion. Funds are typically transferred to your account within 3-5 business days after the client confirms service delivery.",
      },
      {
        q: "What is the platform fee?",
        a: "The Curry Fabulous Family charges a 10% platform fee on each booking. This covers payment processing, customer support, and platform maintenance.",
      },
      {
        q: "Can I offer discounts?",
        a: "Yes! You can set promotional pricing in your service settings. Discounts help attract more clients and build your reputation.",
      },
    ],
  },
  {
    category: "Managing Bookings",
    icon: Calendar,
    questions: [
      {
        q: "How do I accept or reject bookings?",
        a: "Go to Booking Management and review pending requests. You have 48 hours to accept or reject. Communicate clearly with clients about any concerns.",
      },
      {
        q: "What if I need to cancel?",
        a: "Contact the client immediately and explain the situation. Cancellations affect your rating, so only cancel in emergencies. Refunds are processed automatically.",
      },
    ],
  },
  {
    category: "Customer Relations",
    icon: Users,
    questions: [
      {
        q: "How do I communicate with clients?",
        a: "Use the Messages section in your dashboard. All communication should stay on platform for security and record-keeping.",
      },
      {
        q: "How can I improve my ratings?",
        a: "Deliver excellent service, communicate promptly, be professional, arrive on time, and exceed expectations. Ask satisfied clients to leave reviews.",
      },
    ],
  },
];

export function VendorSupport() {
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const { data, isLoading, isError } = useUserTickets(statusFilter || undefined, page, 20);

  const tickets = data?.data?.tickets || [];
  const pagination = (data?.data?.pagination || {}) as any;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      open: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
      in_progress: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      resolved: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
      closed: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle },
    };

    const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800", icon: HelpCircle };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, " ").toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { bg: string; text: string }> = {
      low: { bg: "bg-gray-100", text: "text-gray-700" },
      medium: { bg: "bg-blue-100", text: "text-blue-700" },
      high: { bg: "bg-orange-100", text: "text-orange-700" },
      urgent: { bg: "bg-red-100", text: "text-red-700" },
    };

    const config = priorityConfig[priority] || { bg: "bg-gray-100", text: "text-gray-700" };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <>
      <SupportTicketModal
        open={supportModalOpen}
        onOpenChange={setSupportModalOpen}
        defaultCategory="vendor"
      />
      <VendorLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support & Help Centre</h1>
              <p className="text-gray-600 mt-1">Get help with your vendor account</p>
            </div>
            <Button
              onClick={() => setSupportModalOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Support Ticket
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Failed to load support tickets
              </h3>
              <p className="text-red-700">Please try again later</p>
            </div>
          )}

          {/* Tickets List */}
          {!isLoading && !isError && (
            <>
              {tickets.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Support Tickets Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {statusFilter
                      ? "No tickets match your filter criteria."
                      : "You haven't created any support tickets yet."}
                  </p>
                  <Button onClick={() => setSupportModalOpen(true)} className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {ticket.subject}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Ticket #{ticket.ticket_number}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4 line-clamp-2">
                            {ticket.description}
                          </p>

                          <div className="flex flex-wrap gap-3 items-center text-sm">
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                            <span className="text-gray-600">
                              Category: <span className="font-medium">{ticket.category}</span>
                            </span>
                            <span className="text-gray-600">
                              Created: {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:min-w-[160px]">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full cursor-pointer"
                          onClick={() => window.location.href = `/vendor/dashboard/support/${ticket.id}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalResults} total)
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
            )}
          </>
        )}

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {category.questions.map((faq, faqIndex) => {
                      const faqId = categoryIndex * 100 + faqIndex;
                      const isExpanded = expandedFaq === faqId;
                      return (
                        <div key={faqIndex}>
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                                isExpanded ? "transform rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4">
                              <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Support Call-to-Action */}
          <div className="mt-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg p-8 text-white text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Still Need Help?</h3>
            <p className="mb-6 text-white/90">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Button
              onClick={() => setSupportModalOpen(true)}
              className="bg-white text-primary hover:bg-gray-100 cursor-pointer"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Support Ticket
            </Button>
          </div>
        </div>
      </div>
    </VendorLayout>
    </>
  );
}
