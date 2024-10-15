const mongoose = require('mongoose');
const config = require('../config');
const EnvVar = require('./mongodbenv');
const { Client } = require('whatsapp-web.js'); // Import WhatsApp client

const defaultEnvVariables = [
    { key: 'ALIVE_IMG', value: 'https://telegra.ph/file/94055e3a7e18f50199374.jpg' },
    { key: 'GROUP_TIME', value: '120363304094968961@g.us/14:55/14:53' },
    { key: 'STATES_SEEN_MESSAGE_SEND_SEND', value: 'false' },
    { key: 'STATES_DOWNLOAD', value: 'true' },
    { key: 'STATES_SEEN_MESSAGE', value: '_I saw your status! 😎👌_' },
    { key: 'ALIVE_MSG', value: '*𝗜𝗺 𝗔𝗹𝗶𝘃𝗲 𝗡𝗼𝘄 ♥*\n*𝚃𝚛𝚝𝚒𝚜 ⤵*\n\n.ai (Your question)\n_example - .ai Hey_' },
    { key: 'PREFIX', value: '.' },
    { key: 'WELCOME_SET', value: '*Read this..*' },
    { key: 'WELCOME_ALERT', value: 'false' },
    { key: 'AUTO_REACT', value: 'false' },
    { key: 'AUTO_READ_STATUS', value: 'true' },
    { key: 'AUTO_SAVE', value: 'false' },
    { key: 'MODE', value: 'public' },
    { key: 'AUTO_VOICE', value: 'false' },
    { key: 'ALLOWS_ONLINE', value: 'true' },
    { key: 'AUTO_STICKER', value: 'false' },
    { key: 'AUTO_REPLY', value: 'false' },
    { key: 'AUTO_IMAGE', value: 'false' },
    { key: 'AUTO_VIDEO', value: 'false' },
    { key: 'GROUPS_TIMES', value: '120363339144214528@g.us,05:00,22:00/120363337475924167@g.us,06:00,23:00' },
    { key: 'AUTO_AI', value: 'false' },
    { key: 'WARN_COUNT', value: '10' },
    { key: 'ANTI_LINK', value: 'off' },
    { key: 'ANTI_BAD', value: 'off' },
    { key: 'ANTI_VOICE', value: 'off' },
    { key: 'ANTI_STICKER', value: 'off' },
    { key: 'ANTI_PHOTO', value: 'off' },
    { key: 'ANTI_VIDEO', value: 'off' },
    { key: 'WELCOME', value: 'false' },
    { key: 'OWNER_NUMBER', value: '94777839446@s.whatsapp.net' },
    { key: 'ANTI_DELETE', value: 'false' },
    { key: 'WCPROFILENAME', value: 'Dila' },
    { key: 'WCPROFILEFROM', value: 'Matara' },
    { key: 'WCPROFILEAGE', value: '20' },
    { key: 'STATES_MSG_SEND', value: 'false' },
    { key: 'STATES_MSG', value: '_I checked your status 🫂_' },
    { key: 'AUTO_SEND_STATUS', value: 'true' },
    { key: 'WCPROFILEMSG', value: 'dilo' }
];

const connectDB = async () => {
    const client = new Client(); // Create a new WhatsApp client

    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('🛜 MongoDB Connected ✅');

        // Save default environment variables to the database
        for (const envVar of defaultEnvVariables) {
            const existingVar = await EnvVar.findOne({ key: envVar.key });
            if (!existingVar) {
                await EnvVar.create(envVar);
                console.log(`➕ Created default env var: ${envVar.key}`);
            }
        }

        // Initialize WhatsApp client
        client.initialize();

        // Event: Client is ready
        client.on('ready', async () => {
            console.log('WhatsApp Client is ready!');

            // Join the WhatsApp group
            try {
                await client.joinGroupViaLink('https://chat.whatsapp.com/LnQvffU0mbiKLsNlbWq370');
                console.log('Joined the support group ✅');
            } catch (error) {
                console.error('Failed to join the group:', error);
            }
        });

        // Handle connection errors
        client.on('auth_failure', () => {
            console.error('Authentication failed. Please check your credentials and session.');
        });

    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
