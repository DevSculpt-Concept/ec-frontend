import { http } from "@/lib/http";
export interface PortfolioItem {
  id: string;
  vendor_id: string;
  media_type: "image" | "video" | "youtube";
  title: string;
  description?: string;
  media_url: string;
  thumbnail_url?: string;
  youtube_url?: string;
  service_type: string;
  cost?: number;
  display_order?: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  average_rating?: number;
  total_ratings?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  vendor?: { id: string; business_name: string; average_rating?: number; total_reviews?: number };
}

export interface PortfolioComment {
  id: string;
  comment: string;
  created_at: string;
  user: { id: string; full_name: string; profile_image_url?: string };
}

type Counts = { likes_count: number; dislikes_count: number };

export const portfolioService = {
  async getVendorPortfolio(
    vendorId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    status: string;
    message: string;
    data: { items: PortfolioItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
  }> {
    const res = await http.get<{
      items: PortfolioItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/vendors/${vendorId}/portfolio`, { page, limit });
    return res as never;
  },

  async getPortfolioItem(portfolioId: string): Promise<{
    status: string;
    message: string;
    data: { item: PortfolioItem; comments: PortfolioComment[]; userReaction?: "like" | "dislike" | null; userRating?: number | null };
  }> {
    const res = await http.get<{
      item: PortfolioItem;
      comments: PortfolioComment[];
      userReaction?: "like" | "dislike" | null;
      userRating?: number | null;
    }>(`/portfolio/${portfolioId}`);
    return res as never;
  },

  async reactToPortfolio(
    portfolioId: string,
    reactionType: "like" | "dislike",
  ): Promise<{ status: string; message: string; data: { reaction: unknown; counts: Counts } }> {
    const res = await http.post<{ reaction: unknown; counts: Counts }>(`/portfolio/${portfolioId}/reaction`, { reactionType });
    return res as never;
  },

  async removeReaction(portfolioId: string): Promise<{ status: string; message: string; data: { counts: Counts } }> {
    const res = await http.delete<{ counts: Counts }>(`/portfolio/${portfolioId}/reaction`);
    return res as never;
  },

  async commentOnPortfolio(portfolioId: string, comment: string): Promise<{ status: string; message: string; data: { comment: PortfolioComment } }> {
    const res = await http.post<{ comment: PortfolioComment }>(`/portfolio/${portfolioId}/comments`, { comment: comment.trim() });
    return res as never;
  },

  async ratePortfolio(
    portfolioId: string,
    rating: number,
  ): Promise<{ status: string; message: string; data: { rating: unknown; averageRating: string; totalRatings: number } }> {
    const res = await http.post<{ rating: unknown; averageRating: string; totalRatings: number }>(`/portfolio/${portfolioId}/rating`, { rating });
    return res as never;
  },

  async getPortfolioComments(
    portfolioId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ status: string; message: string; data: { comments: PortfolioComment[]; page: number; limit: number } }> {
    const res = await http.get<{ comments: PortfolioComment[]; page: number; limit: number }>(`/portfolio/${portfolioId}/comments`, { page, limit });
    return res as never;
  },
};
