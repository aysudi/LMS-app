import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import paymentService from "../services/payment.service";
import type {
  CreateOrderRequest,
  PaymentIntentRequest,
  ConfirmPaymentRequest,
} from "../services/payment.service";

// Hook for creating orders
export const useCreateOrder = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) =>
      paymentService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar("Order created successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create order";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
};

export const useCreatePaymentIntent = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (request: PaymentIntentRequest) =>
      paymentService.createPaymentIntent(request),
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to create payment intent";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
};

export const useConfirmPayment = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ConfirmPaymentRequest) =>
      paymentService.confirmPayment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["user-courses"] });
      enqueueSnackbar("Payment confirmed! Welcome to your courses!", {
        variant: "success",
        autoHideDuration: 5000,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to confirm payment";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
};

export const useCreateCheckoutSession = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (request: {
      orderId: string;
      lineItems: any[];
      successUrl: string;
      cancelUrl: string;
    }) => paymentService.createCheckoutSession(request),
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to create checkout session";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
};

export const useUserOrders = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["orders", page, limit],
    queryFn: () => paymentService.getUserOrders(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => paymentService.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCancelOrder = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => paymentService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar("Order cancelled successfully", { variant: "success" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to cancel order";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
};
