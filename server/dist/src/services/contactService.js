import Contact from "../models/Contact";
import { sendContactNotificationEmail, sendContactReplyEmail, } from "../utils/emailService";
// Create a new contact message
export const createContact = async (contactData) => {
    try {
        const contact = new Contact(contactData);
        const savedContact = await contact.save();
        // Send notification email to admin (non-blocking)
        sendContactNotificationEmail({
            adminEmail: process.env.GMAIL_USER,
            contactData: {
                name: contactData.name,
                email: contactData.email,
                subject: contactData.subject,
                message: contactData.message,
                phone: contactData.phone,
            },
        }).catch((error) => {
            console.error("Failed to send contact notification email:", error.message);
        });
        return savedContact;
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0];
            throw new Error(firstError.message);
        }
        throw new Error("Failed to send contact message");
    }
};
// Get all contact messages with pagination and filtering
export const getContacts = async (query) => {
    try {
        let { page = 1, limit = 10, search, isReplied, sortBy = "createdAt", sortOrder = "desc", } = query;
        // Build filter object
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
            ];
        }
        // Handle isReplied filter properly
        if (isReplied !== undefined && isReplied !== null) {
            // Convert string "true"/"false" to boolean, or keep boolean as is
            if (typeof isReplied === "string") {
                filter.isReplied = isReplied === "true";
            }
            else if (typeof isReplied === "boolean") {
                filter.isReplied = isReplied;
            }
        }
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Get contacts and total count
        const [contacts, totalContacts] = await Promise.all([
            Contact.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Contact.countDocuments(filter),
        ]);
        console.log("Retrieved contacts count:", contacts.length);
        const totalPages = Math.ceil(totalContacts / limit);
        return {
            contacts: contacts,
            pagination: {
                currentPage: page,
                totalPages,
                totalContacts,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    catch (error) {
        throw new Error("Failed to retrieve contact messages");
    }
};
// Get a single contact message by ID
export const getContactById = async (contactId) => {
    try {
        const contact = await Contact.findById(contactId);
        if (!contact) {
            throw new Error("Contact message not found");
        }
        return contact;
    }
    catch (error) {
        if (error.message === "Contact message not found") {
            throw error;
        }
        throw new Error("Failed to retrieve contact message");
    }
};
// Reply to a contact message
export const replyToContact = async (contactId, replyData) => {
    try {
        const contact = await Contact.findById(contactId);
        if (!contact) {
            throw new Error("Contact message not found");
        }
        // Update contact with reply
        contact.isReplied = true;
        contact.repliedAt = new Date();
        contact.replyMessage = replyData.replyMessage;
        const updatedContact = await contact.save();
        // Send reply email to the contact person (non-blocking)
        await sendContactReplyEmail({
            contactEmail: contact.email,
            contactName: contact.name,
            originalSubject: contact.subject,
            originalMessage: contact.message,
            replyMessage: replyData.replyMessage,
        }).catch((error) => {
            console.error("Failed to send contact reply email:", error.message);
        });
        return updatedContact;
    }
    catch (error) {
        if (error.message === "Contact message not found") {
            throw error;
        }
        throw new Error("Failed to reply to contact message");
    }
};
// Delete a contact message
export const deleteContact = async (contactId) => {
    try {
        const contact = await Contact.findById(contactId);
        if (!contact) {
            throw new Error("Contact message not found");
        }
        await Contact.findByIdAndDelete(contactId);
    }
    catch (error) {
        if (error.message === "Contact message not found") {
            throw error;
        }
        throw new Error("Failed to delete contact message");
    }
};
// Get contact statistics
export const getContactStats = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const [totalContacts, repliedContacts, unrepliedContacts, todayContacts, thisWeekContacts, thisMonthContacts,] = await Promise.all([
            Contact.countDocuments(),
            Contact.countDocuments({ isReplied: true }),
            Contact.countDocuments({ isReplied: false }),
            Contact.countDocuments({ createdAt: { $gte: today } }),
            Contact.countDocuments({ createdAt: { $gte: thisWeek } }),
            Contact.countDocuments({ createdAt: { $gte: thisMonth } }),
        ]);
        return {
            totalContacts,
            repliedContacts,
            unrepliedContacts,
            todayContacts,
            thisWeekContacts,
            thisMonthContacts,
        };
    }
    catch (error) {
        throw new Error("Failed to retrieve contact statistics");
    }
};
