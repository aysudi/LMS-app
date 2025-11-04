import * as contactService from "../services/contactService";
// Create a new contact message
export const createContact = async (req, res) => {
    try {
        const contactData = req.body;
        const contact = await contactService.createContact(contactData);
        res.status(201).json({
            success: true,
            message: "Contact message sent successfully",
            data: contact,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to send contact message",
        });
    }
};
// Get all contact messages (Admin only)
export const getContacts = async (req, res) => {
    try {
        const query = req.query;
        const result = await contactService.getContacts(query);
        res.status(200).json({
            success: true,
            message: "Contact messages retrieved successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve contact messages",
        });
    }
};
// Get a single contact message by ID (Admin only)
export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await contactService.getContactById(id);
        res.status(200).json({
            success: true,
            message: "Contact message retrieved successfully",
            data: contact,
        });
    }
    catch (error) {
        if (error.message === "Contact message not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve contact message",
        });
    }
};
// Reply to a contact message (Admin only)
export const replyToContact = async (req, res) => {
    try {
        const { id } = req.params;
        const replyData = req.body;
        const updatedContact = await contactService.replyToContact(id, replyData);
        res.status(200).json({
            success: true,
            message: "Reply sent successfully",
            data: updatedContact,
        });
    }
    catch (error) {
        if (error.message === "Contact message not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Failed to reply to contact message",
        });
    }
};
// Delete a contact message (Admin only)
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        await contactService.deleteContact(id);
        res.status(200).json({
            success: true,
            message: "Contact message deleted successfully",
        });
    }
    catch (error) {
        if (error.message === "Contact message not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete contact message",
        });
    }
};
// Get contact statistics (Admin only)
export const getContactStats = async (req, res) => {
    try {
        const stats = await contactService.getContactStats();
        res.status(200).json({
            success: true,
            message: "Contact statistics retrieved successfully",
            data: stats,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve contact statistics",
        });
    }
};
