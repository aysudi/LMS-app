import { Request, Response } from "express";
import * as contactService from "../services/contactService";

// Create a new contact message
export const createContact = async (
  req: Request<
    {},
    {},
    {
      name: string;
      email: string;
      subject: string;
      message: string;
      phone?: string;
    }
  >,
  res: Response
) => {
  try {
    const contactData = req.body;
    const contact = await contactService.createContact(contactData);

    res.status(201).json({
      success: true,
      message: "Contact message sent successfully",
      data: contact,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to send contact message",
    });
  }
};

// Get all contact messages (Admin only)
export const getContacts = async (req: Request<{}, {}, {}>, res: Response) => {
  try {
    const query = req.query;
    const result = await contactService.getContacts(query);

    res.status(200).json({
      success: true,
      message: "Contact messages retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve contact messages",
    });
  }
};

// Get a single contact message by ID (Admin only)
export const getContactById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const contact = await contactService.getContactById(id);

    res.status(200).json({
      success: true,
      message: "Contact message retrieved successfully",
      data: contact,
    });
  } catch (error: any) {
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
export const replyToContact = async (
  req: Request<{ id: string }, {}, { replyMessage: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const replyData = req.body;

    const updatedContact = await contactService.replyToContact(id, replyData);

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: updatedContact,
    });
  } catch (error: any) {
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
export const deleteContact = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    await contactService.deleteContact(id);

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error: any) {
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
export const getContactStats = async (req: Request, res: Response) => {
  try {
    const stats = await contactService.getContactStats();

    res.status(200).json({
      success: true,
      message: "Contact statistics retrieved successfully",
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve contact statistics",
    });
  }
};
