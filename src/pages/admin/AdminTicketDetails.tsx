import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
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
import { useTicketDetails, useAddTicketResponse, useUpdateTicketStatus } from "@/hooks/useSupport";
import { showToast } from "@/lib/toast";

export function AdminTicketDetails() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");

  const { data, isLoading, isError } = useTicketDetails(ticketId || null);
  const addResponseMutation = useAddTicketResponse();
  const updateStatusMutation = useUpdateTicketStatus();

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

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId) return;

    try {
      await updateStatusMutation.mutateAsync({ ticketId, status: newStatus });
      showToast.success("Ticket status updated successfully");
    } catch (error) {
      showToast.error("Failed to update status", error instanceof Error ? error.message : "Please try again");
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
      <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
        <div className="p-6 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !ticket) {
    return (
      <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to load ticket details
            </h3>
            <Button onClick={() => navigate("/admin/reports")} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/reports")}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Status:</span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
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
              <p className="text-sm text-gray-600">Submitted By</p>
              <p className="font-medium text-gray-900">{ticket.users?.full_name || "N/A"}</p>
              <p className="text-xs text-gray-500">{ticket.users?.email}</p>
            </div>
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
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Description</p>
            <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>

        {/* Responses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation History</h2>

          <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
            {responses.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No responses yet</p>
            ) : (
              responses.map((response: any) => {
                const isAdmin = response.users?.role === "admin";
                return (
                  <div
                    key={response.id}
                    className={`p-4 rounded-lg ${
                      isAdmin
                        ? "bg-blue-50 border border-blue-200 ml-8"
                        : "bg-gray-50 border border-gray-200 mr-8"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {response.users?.full_name || "Unknown"}
                        </p>
                        {isAdmin && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Support Team
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(response.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          {ticket.status !== "closed" && (
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reply to Ticket
              </label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your response here..."
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
    </DashboardLayout>
  );
}

