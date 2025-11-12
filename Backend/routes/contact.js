const express = require('express');
const Contact = require('../models/Contact');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Submit contact form (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contact = new Contact({
            name,
            email,
            subject,
            message
        });

        await contact.save();
        res.status(201).json({ 
            success: true, 
            message: 'Thank you for your message! I will get back to you soon.' 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all contact messages (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Contact.countDocuments();

        res.json({
            contacts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalContacts: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single contact message (admin only)
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }
        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark contact as read (admin only)
router.patch('/:id/read', adminAuth, async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }
        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete contact message (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }
        res.json({ message: 'Contact message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;