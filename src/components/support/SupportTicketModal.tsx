import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTicket } from "@/hooks/useSupport";
import { showToast } from "@/lib/toast";

interface SupportTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: string;
  bookingId?: string;
}

export function SupportTicketModal({
  open,
  onOpenChange,
  defaultCategory = "general",
  bookingId,
}: SupportTicketModalProps) {
  const [formData, setFormData] = useState({
    subject: "",
    category: defaultCategory,
    priority: "medium",
    description: "",
  });

  const createTicketMutation = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.description) {
      showToast.error("Please fill in all required fields");
      return;
    }

    try {
      await createTicketMutation.mutateAsync({
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        bookingId,
      });

      showToast.success("Support ticket created successfully", "Our team will respond shortly");
      
      // Reset form
      setFormData({
        subject: "",
        category: defaultCategory,
        priority: "medium",
        description: "",
      });
      
      onOpenChange(false);
    } catch (error) {
      showToast.error(
        "Failed to create support ticket",
        error instanceof Error ? error.message : "Please try again"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Submit a support ticket and our team will get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                Subject *
              </label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Issue</option>
                  <option value="booking">Booking Related</option>
                  <option value="payment">Payment Issue</option>
                  <option value="account">Account Issue</option>
                  <option value="vendor">Vendor Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description *
              </label>
              <Textarea
                id="description"
                placeholder="Please provide detailed information about your issue..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                required
              />
            </div>

            {bookingId && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                <p>
                  📌 This ticket will be linked to your booking for faster
                  resolution.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTicketMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="cursor-pointer"
            >
              {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

