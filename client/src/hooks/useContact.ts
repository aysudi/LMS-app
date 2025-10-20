import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { contactService } from "../services/contact.service";
import type { GetContactsQuery, ReplyContactData } from "../types/contact.type";

// Query keys for caching
export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (params: GetContactsQuery) => [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  stats: () => [...contactKeys.all, "stats"] as const,
};

// Hook to get contact messages (admin only)
export const useContacts = (params?: GetContactsQuery) => {
  return useQuery({
    queryKey: contactKeys.list(params || {}),
    queryFn: () => contactService.getContacts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single contact message (admin only)
export const useContact = (contactId: string) => {
  return useQuery({
    queryKey: contactKeys.detail(contactId),
    queryFn: () => contactService.getContactById(contactId),
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get contact statistics (admin only)
export const useContactStats = () => {
  return useQuery({
    queryKey: contactKeys.stats(),
    queryFn: () => contactService.getContactStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for contact mutations
export const useContactMutations = () => {
  const queryClient = useQueryClient();

  const createContact = useMutation({
    mutationFn: contactService.createContact,
    onSuccess: () => {
      toast.success("Message sent successfully! We will get back to you soon.");

      // Invalidate contact statistics for admin
      queryClient.invalidateQueries({
        queryKey: contactKeys.stats(),
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    },
  });

  const replyToContact = useMutation({
    mutationFn: ({
      contactId,
      replyData,
    }: {
      contactId: string;
      replyData: ReplyContactData;
    }) => contactService.replyToContact(contactId, replyData),
    onSuccess: (data) => {
      toast.success("Reply sent successfully!");

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: contactKeys.detail(data._id),
      });
      queryClient.invalidateQueries({
        queryKey: contactKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: contactKeys.stats(),
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reply");
    },
  });

  const deleteContact = useMutation({
    mutationFn: contactService.deleteContact,
    onSuccess: () => {
      toast.success("Contact message deleted successfully");

      // Invalidate all contact-related queries
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete contact message"
      );
    },
  });

  return {
    createContact: {
      mutate: createContact.mutate,
      isLoading: createContact.isPending,
      error: createContact.error,
    },
    replyToContact: {
      mutate: replyToContact.mutate,
      isLoading: replyToContact.isPending,
      error: replyToContact.error,
    },
    deleteContact: {
      mutate: deleteContact.mutate,
      isLoading: deleteContact.isPending,
      error: deleteContact.error,
    },
  };
};

// Hook for creating contact messages (public)
export const useCreateContact = () => {
  const mutation = useMutation({
    mutationFn: contactService.createContact,
    onSuccess: () => {
      toast.success("Message sent successfully! We will get back to you soon.");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    },
  });

  return {
    createContact: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
