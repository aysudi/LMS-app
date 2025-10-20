import { api } from "./api";
import type {
  CreateContactData,
  ContactMessage,
  ContactsPaginationData,
  GetContactsQuery,
  ReplyContactData,
  ContactStats,
} from "../types/contact.type";

class ContactService {
  // Create a new contact message (public)
  async createContact(contactData: CreateContactData): Promise<ContactMessage> {
    const response = await api.post("/api/contact", contactData);
    console.log("response data: ", response);
    return response.data;
  }

  // Get all contact messages with pagination and filtering (admin only)
  async getContacts(query?: GetContactsQuery): Promise<ContactsPaginationData> {
    const params = new URLSearchParams();

    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    if (typeof query?.isReplied === "boolean")
      params.append("isReplied", query.isReplied.toString());
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/contact?${queryString}` : "/contact";

    const response = await api.get(url);
    return response.data;
  }

  // Get a single contact message by ID (admin only)
  async getContactById(contactId: string): Promise<ContactMessage> {
    const response = await api.get(`/contact/${contactId}`);
    return response.data;
  }

  // Reply to a contact message (admin only)
  async replyToContact(
    contactId: string,
    replyData: ReplyContactData
  ): Promise<ContactMessage> {
    const response = await api.post(`/contact/${contactId}/reply`, replyData);
    return response.data;
  }

  // Delete a contact message (admin only)
  async deleteContact(contactId: string): Promise<void> {
    await api.delete(`/contact/${contactId}`);
  }

  // Get contact statistics (admin only)
  async getContactStats(): Promise<ContactStats> {
    const response = await api.get("/contact/stats");
    return response.data;
  }
}

export const contactService = new ContactService();
export default contactService;
