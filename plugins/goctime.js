const schedule = require('node-schedule');
const moment = require('moment-timezone');
const { readEnv } = require('../lib/database');

// Set timezone for calculations
const TIMEZONE = 'Asia/Colombo';

// Function to adjust the time by subtracting 5 hours and 30 minutes
function adjustTime(time) {
    const [hour, minute] = time.split(':').map(Number);
    return moment.tz({ hour, minute }, TIMEZONE).subtract(5, 'hours').subtract(30, 'minutes').format('HH:mm');
}

// Function to schedule open and close times for a group
function scheduleGroupTimes(conn, groupId, openTimes, closeTimes) {
    openTimes.forEach((openTime) => {
        const adjustedOpenTime = adjustTime(openTime);
        const [adjustedHour, adjustedMinute] = adjustedOpenTime.split(':').map(Number);
        const openCron = `0 ${adjustedMinute} ${adjustedHour} * * *`;

        schedule.scheduleJob(`${groupId}_openGroup_${openTime}`, openCron, async () => {
            await conn.groupSettingUpdate(groupId, 'not_announcement');  // Open the group
            await conn.sendMessage(groupId, { text: `*𝗚𝗿𝗼𝘂𝗽 𝗢𝗽𝗲𝗻𝗲𝗱 𝗮𝘁 ${openTime}. 🔓*\nᴍʀ ᴅɪʟᴀ ᴏꜰᴄ` });
        });
    });

    closeTimes.forEach((closeTime) => {
        const adjustedCloseTime = adjustTime(closeTime);
        const [adjustedHour, adjustedMinute] = adjustedCloseTime.split(':').map(Number);
        const closeCron = `0 ${adjustedMinute} ${adjustedHour} * * *`;

        schedule.scheduleJob(`${groupId}_closeGroup_${closeTime}`, closeCron, async () => {
            await conn.groupSettingUpdate(groupId, 'announcement');  // Close the group
            await conn.sendMessage(groupId, { text: `*𝗚𝗿𝗼𝘂𝗽 𝗖𝗹𝗼𝘀𝗲𝗱 𝗮𝘁 ${closeTime}. 🔒*\nᴍʀ ᴅɪʟᴀ ᴏꜰᴄ` });
        });
    });
}

// Function to parse and schedule group times
async function setupGroupSchedules(conn) {
    const config = await readEnv();
    const groupTimesConfig = config.GROUPS_TIMES;

    // Parse GROUPS_TIMES config
    const groups = groupTimesConfig.split('/').map(entry => {
        const parts = entry.match(/(.*?)/g).map(part => part.replace(/[()]/g, ''));
        return {
            groupId: parts[0],   // Extract group ID
            openTimes: parts[1].split(','),  // Extract open times
            closeTimes: parts[2].split(',')  // Extract close times
        };
    });

    // Schedule open and close times for each group
    groups.forEach(({ groupId, openTimes, closeTimes }) => {
        scheduleGroupTimes(conn, groupId, openTimes, closeTimes);
    });
}

// Execute the group schedule setup on bot startup
cmd({ on: 'ready' }, async (conn) => {
    try {
        // Set up schedules for groups when bot starts
        await setupGroupSchedules(conn);

        console.log('Group schedules have been set up successfully!');
    } catch (error) {
        console.error('Error setting up group schedules:', error);
    }
});
