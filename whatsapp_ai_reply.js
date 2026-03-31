// Improved AI reply generator for WhatsApp
// Generates contextual and intelligent replies based on message content

function generateAIReply(message, direction, contactName) {
    const messageText = message.body.toLowerCase();
    const originalText = message.body;

    // If outgoing (user sent), generate anticipated reply
    if (direction === 'outgoing') {
        // Common patterns for anticipated replies
        if (messageText.includes('invoice') || messageText.includes('bill')) {
            return "Sure! I'll send it right away. Give me a few minutes.";
        }
        if (messageText.includes('files') || messageText.includes('document')) {
            return "Of course! I'll share them with you shortly.";
        }
        if (messageText.includes('meeting') || messageText.includes('call')) {
            return "Yes, that works for me. What time is convenient for you?";
        }
        if (messageText.includes('?')) {
            return "Let me check and get back to you soon.";
        }
        return "Okay, understood. I'll take care of it.";
    }

    // If incoming (received message), generate intelligent response
    else {
        // Greetings - respond warmly
        if (messageText.match(/^(hi|hello|hey|salam|assalam)/i)) {
            return `Hello ${contactName}! How can I help you today?`;
        }

        // Specific questions about invoice/payment
        if (messageText.includes('invoice') || messageText.includes('bill') || messageText.includes('payment')) {
            if (messageText.includes('?') || messageText.includes('kab') || messageText.includes('when')) {
                return "I'll check your invoice details and send them to you right away. Please give me a moment.";
            }
            return "I've noted your request regarding the invoice. I'll process this and get back to you shortly.";
        }

        // Status/update requests
        if (messageText.includes('status') || messageText.includes('update') || messageText.includes('progress')) {
            return "Let me check the current status for you. I'll update you in a few minutes with the latest information.";
        }

        // Project/work related
        if (messageText.includes('project') || messageText.includes('work') || messageText.includes('task')) {
            if (messageText.includes('?')) {
                return "Regarding the project, let me review the details and provide you with a comprehensive update shortly.";
            }
            return "Thank you for the update. I've noted this and will proceed accordingly.";
        }

        // File/document requests
        if (messageText.includes('file') || messageText.includes('document') || messageText.includes('send')) {
            return "I'll prepare and send you the requested files shortly. Thank you for your patience.";
        }

        // Meeting/call requests
        if (messageText.includes('meeting') || messageText.includes('call') || messageText.includes('discuss')) {
            return "Sure! I'm available for a meeting. What time works best for you?";
        }

        // Urgent requests
        if (messageText.includes('urgent') || messageText.includes('asap') || messageText.includes('immediately')) {
            return "I understand this is urgent. I'm prioritizing this and will respond as quickly as possible.";
        }

        // Help/support requests
        if (messageText.includes('help') || messageText.includes('support') || messageText.includes('assist')) {
            return "Of course! I'm here to help. Could you please provide more details about what you need assistance with?";
        }

        // Confirmation/acknowledgment
        if (messageText.match(/^(ok|okay|yes|no|sure|fine|alright)/i)) {
            return "Noted! Thank you for confirming. I'll proceed accordingly.";
        }

        // Thanks/appreciation
        if (messageText.includes('thank') || messageText.includes('thanks') || messageText.includes('appreciate')) {
            return "You're very welcome! Feel free to reach out if you need anything else.";
        }

        // Questions (general)
        if (messageText.includes('?') || messageText.includes('kya') || messageText.includes('kab') || messageText.includes('kaise')) {
            // Try to understand the question context
            if (messageText.length < 50) {
                return "That's a good question. Let me look into this and provide you with a detailed answer shortly.";
            }
            return "Thank you for your detailed question. I'll review this carefully and respond with the information you need.";
        }

        // Complaints/issues
        if (messageText.includes('problem') || messageText.includes('issue') || messageText.includes('error') || messageText.includes('not working')) {
            return "I'm sorry to hear about this issue. Let me investigate and resolve this for you as quickly as possible.";
        }

        // Price/cost inquiries
        if (messageText.includes('price') || messageText.includes('cost') || messageText.includes('rate') || messageText.includes('kitna')) {
            return "I'll check the pricing details for you and share them shortly. Thank you for your interest!";
        }

        // Availability/timing
        if (messageText.includes('available') || messageText.includes('free') || messageText.includes('time')) {
            return "Let me check my availability and get back to you with suitable time slots.";
        }

        // Default intelligent response based on message length
        if (originalText.length > 100) {
            return "Thank you for your detailed message. I've received it and will review everything carefully. I'll respond with a comprehensive answer shortly.";
        } else if (originalText.length > 50) {
            return "Thank you for your message. I've noted the details and will get back to you soon with a proper response.";
        } else {
            return "Thank you for reaching out! I've received your message and will respond shortly.";
        }
    }
}

module.exports = { generateAIReply };
