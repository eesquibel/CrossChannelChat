//Initial basic code for cross posting messages between 2 discord channels

const fs = require('fs'); //built in file system class

// Check if config.json exists
if (fs.existsSync('./config.json')) {
    const config = require('./config.json');
} else {
    const config = { }
}

// Get token from environment variable
const token = process.env.TOKEN ?? config.token;
const sourceChannelId = process.env.SOURCE_CHANNEL_ID ?? config.sourceChannelId;
const targetChannelId = process.env.TARGET_CHANNEL_ID ?? config.targetChannelId;
const errorLog = process.env.ERROR_LOG ?? config.errorLog ?? './error.log';

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [ 
                                GatewayIntentBits.DirectMessages,
                                GatewayIntentBits.Guilds,
                                GatewayIntentBits.GuildBans,
                                GatewayIntentBits.GuildMessages,
                                GatewayIntentBits.MessageContent,] });


    console.log(`discord.js version:  ${require("discord.js").version}`);


    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });


    client.on('messageCreate', (message) => {

        if (message.author.bot) return; // Ignore messages from bots

        let targetChannel;

        if (message.channel.id === sourceChannelId) {
            targetChannel = client.channels.cache.get(targetChannelId);
        } else if (message.channel.id === targetChannelId) {
            targetChannel = client.channels.cache.get(sourceChannelId);
        } else {
            return; // Ignore messages from other channels
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
            .setDescription(message.content)

        targetChannel.send({ embeds: [embed] });
    });

    client.login(token);
    
    
//writes the specified error to a log file
//no longer used
function logMessage(error) {
    const timestamp = new Date().toISOString();
    const message = `${timestamp} - ${error}\n`;

    if (errorLog == 'stderr') {
        console.error(message);
    } else if (errorLog == 'stdout') {
        console.log(message);
    } else {
        fs.appendFile('error.log', message, (err) => {
            if (err) {
                console.error(`Failed to write error to log file: ${err}`);
            }
        });
    }
}

//This kills the process by hitting Enter in the cmd window
process.stdin.on('data', (data) => {
    const input = data.toString().trim();
  
    if (input === '') {
        process.exit(0);    
    }
});
