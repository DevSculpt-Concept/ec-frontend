import { http } from "@/lib/http";
export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  booking_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
  users?: { full_name: string; email: string };
}

export interface TicketResponse {
  id: string;
  ticket_id: string;
  responder_id: string;
  message: string;
  created_at: string;
  users?: { full_name: string; role: string };
}

export interface CreateTicketData {
  subject: string;
  category: string;
  priority?: string;
  description: string;
  bookingId?: string;
}

type TicketList = { tickets: SupportTicket[]; pagination: unknown };

export const supportService = {
  async createTicket(data: CreateTicketData): Promise<{ status: string; message: string; data: { ticket: SupportTicket } }> {
    const res = await http.post<{ ticket: SupportTicket }>("/support/tickets", data);
    return res as { status: string; message: string; data: { ticket: SupportTicket } };
  },

  async getUserTickets(
    status?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ status: string; message: string; data: TicketList }> {
    const res = await http.get<TicketList>("/support/tickets", { status, page, limit });
    return res as { status: string; message: string; data: TicketList };
  },

  async getTicketDetails(ticketId: string): Promise<{ status: string; message: string; data: { ticket: SupportTicket; responses: TicketResponse[] } }> {
    const res = await http.get<{ ticket: SupportTicket; responses: TicketResponse[] }>(`/support/tickets/${ticketId}`);
    return res as { status: string; message: string; data: { ticket: SupportTicket; responses: TicketResponse[] } };
  },

  async addResponse(ticketId: string, message: string): Promise<{ status: string; message: string; data: { response: TicketResponse } }> {
    const res = await http.post<{ response: TicketResponse }>(`/support/tickets/${ticketId}/responses`, { message });
    return res as { status: string; message: string; data: { response: TicketResponse } };
  },

  async closeTicket(ticketId: string): Promise<{ status: string; message: string }> {
    const res = await http.patch(`/support/tickets/${ticketId}/close`);
    return { status: res.status, message: res.message };
  },

  // Admin functions
  async getAllTickets(
    status?: string,
    category?: string,
    priority?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ status: string; message: string; data: TicketList }> {
    const res = await http.get<TicketList>("/admin/support/tickets", { status, category, priority, page, limit });
    return res as { status: string; message: string; data: TicketList };
  },

  async updateTicketStatus(ticketId: string, status: string): Promise<{ status: string; message: string }> {
    const res = await http.patch(`/admin/support/tickets/${ticketId}/status`, { status });
    return { status: res.status, message: res.message };
  },

  async assignTicket(ticketId: string, assignedToId: string): Promise<{ status: string; message: string }> {
    const res = await http.patch(`/admin/support/tickets/${ticketId}/assign`, { assignedToId });
    return { status: res.status, message: res.message };
  },
};
