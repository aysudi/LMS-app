export interface CreateContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  isReplied: boolean;
  repliedAt?: string;
  replyMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsPaginationData {
  contacts: ContactMessage[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalContacts: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetContactsQuery {
  page?: number;
  limit?: number;
  search?: string;
  isReplied?: boolean;
  sortBy?: "createdAt" | "name" | "email" | "subject";
  sortOrder?: "asc" | "desc";
}

export interface ReplyContactData {
  replyMessage: string;
}

export interface ContactStats {
  totalContacts: number;
  repliedContacts: number;
  unrepliedContacts: number;
  todayContacts: number;
  thisWeekContacts: number;
  thisMonthContacts: number;
}
