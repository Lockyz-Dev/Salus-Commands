const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions, version: discordVersion } = require('discord.js')
const moment = require('moment');
require('moment-duration-format');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./databases/user.sqlite');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Get advanced statistics from the bot.'),
	async execute(interaction) {
        const client = interaction.client
        var lan = 'en'
        client.getUsSett = sql.prepare("SELECT * FROM userSettings WHERE userID = ?");
        let userset = client.getUsSett.get(interaction.user.id)

        if(userset) {
            if(userset.language) {
                lan = userset.language;
            }
        }
        const locale = require('../locale/'+lan+'.json')

        interaction.reply({ content: "Moved all content to the /info command." })
	}
};