import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { portfolioService } from "@/services/api/portfolio.service";

export const useVendorPortfolio = (vendorId: string | null, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["portfolio", "vendor", vendorId, page, limit],
    queryFn: () => portfolioService.getVendorPortfolio(vendorId!, page, limit),
    enabled: !!vendorId,
  });
};

export const usePortfolioItem = (portfolioId: string | null) => {
  return useQuery({
    queryKey: ["portfolio", "item", portfolioId],
    queryFn: () => portfolioService.getPortfolioItem(portfolioId!),
    enabled: !!portfolioId,
  });
};

export const useReactToPortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, reactionType }: { portfolioId: string; reactionType: "like" | "dislike" }) =>
      portfolioService.reactToPortfolio(portfolioId, reactionType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", "item", variables.portfolioId] });
    },
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portfolioId: string) => portfolioService.removeReaction(portfolioId),
    onSuccess: (_, portfolioId) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", "item", portfolioId] });
    },
  });
};

export const useCommentOnPortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, comment }: { portfolioId: string; comment: string }) =>
      portfolioService.commentOnPortfolio(portfolioId, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", "item", variables.portfolioId] });
    },
  });
};

export const useRatePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, rating }: { portfolioId: string; rating: number }) =>
      portfolioService.ratePortfolio(portfolioId, rating),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", "item", variables.portfolioId] });
    },
  });
};

