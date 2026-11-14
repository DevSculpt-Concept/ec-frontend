import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportService, type CreateTicketData } from "@/services/api/support.service";

/**
 * Hook to create a support ticket
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketData) => supportService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });
};

/**
 * Hook to get user's support tickets
 */
export const useUserTickets = (status?: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["support", "tickets", status, page, limit],
    queryFn: () => supportService.getUserTickets(status, page, limit),
  });
};

/**
 * Hook to get ticket details
 */
export const useTicketDetails = (ticketId: string | null) => {
  return useQuery({
    queryKey: ["support", "ticket", ticketId],
    queryFn: () => supportService.getTicketDetails(ticketId!),
    enabled: !!ticketId,
  });
};

/**
 * Hook to add response to ticket
 */
export const useAddTicketResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      supportService.addResponse(ticketId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["support", "ticket", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });
};

/**
 * Hook to close ticket
 */
export const useCloseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => supportService.closeTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });
};

// Admin hooks
/**
 * Hook to get all tickets (admin)
 */
export const useAllTickets = (
  status?: string,
  category?: string,
  priority?: string,
  page: number = 1,
  limit: number = 20
) => {
  return useQuery({
    queryKey: ["support", "admin", "tickets", status, category, priority, page, limit],
    queryFn: () => supportService.getAllTickets(status, category, priority, page, limit),
  });
};

/**
 * Hook to update ticket status (admin)
 */
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      supportService.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });
};

/**
 * Hook to assign ticket (admin)
 */
export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, assignedToId }: { ticketId: string; assignedToId: string }) =>
      supportService.assignTicket(ticketId, assignedToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "admin", "tickets"] });
    },
  });
};

