// Import required modules
const fs = require('fs'); // Only import fs if you are absolutely sure you will not use it for file operations
const path = require('path');
const { readEnv } = require('../lib/database');   // Reads environment configuration
const { cmd, commands } = require('../command');  // Handles command functionality
const { fetchJson } = require('../lib/functions'); // Fetches JSON data from a URL
const sensitiveData = require('../dila_md_licence/a/b/c/d/dddamsbs');  // Ensure this path is correct

let listenerRegistered = false; // Flag to ensure the listener is registered only once

// Function to send welcome message to new members with "read more" functionality
const sendWelcomeMessage = async (conn, from, memberId, mek) => {
    const groupMetadata = await conn.groupMetadata(from);  // Get group metadata
    const groupName = groupMetadata.subject;  // Get the group name
    const groupDesc = groupMetadata.desc || "No description available.";  // Get group description or default text

    // Create a 'read more' effect using a large number of zero-width spaces
    let readmore = "\u200B".repeat(4000);  // Invisible characters to trigger "Read more"

    // Prepare the text that will be shown after clicking "Read more"
    let readmoreText = `\n\n*Name :*\n${groupName}\n\n*Description :*\n${groupDesc}\n\nᴍᴀᴅᴇ ʙʏ ᴍʀ ᴅɪʟᴀ ᴏꜰᴄ`;

    // Full message with "Read more" effect
    let replyText = `*Hey 🫂♥️*\n_@${memberId.split('@')[0]}_\n*Welcome to Group ⤵️*\n${readmore}${readmoreText}`;

    // Send the message with "Read more" functionality
    await conn.sendMessage(from, { text: replyText, mentions: [memberId] }, { quoted: mek });
};

// Event listener for new group participants
const registerGroupWelcomeListener = (conn) => {
    if (!listenerRegistered) {  // Check if the listener is already registered
        conn.ev.on('group-participants.update', async (update) => {
            const { id, participants, action } = update;  // id = group id, participants = new members, action = add/remove
            if (action === 'add') {  // Check if the action is a new member joining
                for (const participant of participants) {
                    await sendWelcomeMessage(conn, id, participant);  // Send welcome message to each new member
                }
            }
        });
        listenerRegistered = true;  // Set the flag to true after registering the listener
    }
};

// Main command handler
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    try {
        // Read the environment configuration without saving anything
        const config = await readEnv();
        
        // Check if the WELCOME feature is enabled
        if (config.WELCOME === 'true') {
            // If the user is the owner, do nothing
            if (isOwner) return;

            // Register the listener for welcoming new group participants
            registerGroupWelcomeListener(conn);
        }
    } catch (e) {
        // Log the error and send an error message to the user
        console.log(e);
        await m.reply(`Error: ${e.message}`);
    }
});
