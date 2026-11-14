import { VendorLayout } from "@/components/layout/VendorLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicketDetails, useAddTicketResponse, useCloseTicket } from "@/hooks/useSupport";
import { showToast } from "@/lib/toast";

export function TicketDetails() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");

  const { data, isLoading, isError } = useTicketDetails(ticketId || null);
  const addResponseMutation = useAddTicketResponse();
  const closeTicketMutation = useCloseTicket();

  const ticket = data?.data?.ticket;
  const responses = data?.data?.responses || [];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;

    try {
      await addResponseMutation.mutateAsync({
        ticketId,
        message: newMessage.trim(),
      });
      setNewMessage("");
      showToast.success("Response sent successfully");
    } catch (error) {
      showToast.error("Failed to send response", error instanceof Error ? error.message : "Please try again");
    }
  };

  const handleCloseTicket = async () => {
    if (!ticketId) return;
    if (!window.confirm("Are you sure you want to close this ticket?")) return;

    try {
      await closeTicketMutation.mutateAsync(ticketId);
      showToast.success("Ticket closed successfully");
      navigate("/vendor/dashboard/support");
    } catch (error) {
      showToast.error("Failed to close ticket", error instanceof Error ? error.message : "Please try again");
    }
  };

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

  if (isLoading) {
    return (
      <VendorLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </VendorLayout>
    );
  }

  if (isError || !ticket) {
    return (
      <VendorLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to load ticket details
            </h3>
            <Button onClick={() => navigate("/vendor/dashboard/support")} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/vendor/dashboard/support")}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Support
          </Button>
          {ticket.status !== "closed" && (
            <Button
              variant="outline"
              onClick={handleCloseTicket}
              disabled={closeTicketMutation.isPending}
              className="cursor-pointer"
            >
              Close Ticket
            </Button>
          )}
        </div>

        {/* Ticket Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
              <p className="text-sm text-gray-600">Ticket #{ticket.ticket_number}</p>
            </div>
            {getStatusBadge(ticket.status)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-medium text-gray-900">{ticket.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Priority</p>
              <p className="font-medium text-gray-900">{ticket.priority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(ticket.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium text-gray-900">
                {ticket.updated_at
                  ? new Date(ticket.updated_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Description</p>
            <p className="text-gray-900">{ticket.description}</p>
          </div>
        </div>

        {/* Responses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h2>

          <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
            {responses.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No responses yet</p>
            ) : (
              responses.map((response: any) => (
                <div
                  key={response.id}
                  className={`p-4 rounded-lg ${
                    response.users?.role === "admin"
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900">
                      {response.users?.full_name || "Unknown"}
                      {response.users?.role === "admin" && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Support Team
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(response.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-700">{response.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Reply Form */}
          {ticket.status !== "closed" && (
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Response
              </label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="mb-3"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || addResponseMutation.isPending}
                className="cursor-pointer"
              >
                <Send className="w-4 h-4 mr-2" />
                {addResponseMutation.isPending ? "Sending..." : "Send Response"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}

