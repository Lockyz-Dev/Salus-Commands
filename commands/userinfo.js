const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const SQLite = require("better-sqlite3");
const sql = new SQLite('./databases/user.sqlite');
const sql1 = new SQLite('./databases/guild.sqlite');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Get user information.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user you want information on (Optional)')
                .setRequired(false)
        ),
	async execute(interaction) {
        const client = interaction.client
        var lan = 'en'
        client.getUsSett = sql.prepare("SELECT * FROM userSettings WHERE userID = ?");
        let userset = client.getUsSett.get(interaction.user.id)

        function nFormatter(num, digits) {
            const lookup = [
                { value: 1, symbol: "" },
                { value: 1e3, symbol: "k" },
                { value: 1e6, symbol: "M" },
                { value: 1e9, symbol: "G" },
                { value: 1e12, symbol: "T" },
                { value: 1e15, symbol: "P" },
                { value: 1e18, symbol: "E" }
            ];

            const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
              var item = lookup.slice().reverse().find(function(item) {
                return num >= item.value;
              });
              return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
        }

        if(userset) {
            if(userset.language) {
                lan = userset.language;
            }
        }
        const locale = require('../locale/'+lan+'.json')
        const membera = interaction.user
        const usra = interaction.options.getUser('user');
        var user
        var usAcc

        if(!usra) {
            user = membera
            usAcc = "true"
        } else {
            user = usra
            client.getUsSett = sql.prepare("SELECT * FROM userSettings WHERE userID = ?");
            let userset = client.getUsSett.get(user.id)

            if(userset.userAccess === "false") {
                usAcc = "false"
            } else {
                usAcc = "true"
            }
        }
        let usearset = client.getUsSett.get(user.id)
        const member = interaction.guild.members.cache.get(user.id);

        client.getGuSett = sql1.prepare("SELECT * FROM guildFeatures WHERE guildID = ?");
        let guildset = client.getGuSett.get(interaction.guild.id)

        client.getGuScore = sql.prepare("SELECT * FROM globalScore WHERE userid = ?");
        let guScore = client.getGuScore.get(user.id)

        client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
        let score = client.getScore.get(user.id, interaction.guild.id);

        client.getUsProf = sql.prepare("SELECT * FROM profile WHERE userID = ?");
        let userprof = client.getUsProf.get(interaction.user.id)

        if(userprof) {
            const embed = new MessageEmbed()
                .setTitle(user.username+' | User Info | BETA')
                .setThumbnail(user.avatarURL())
                if(userprof.description === 'false') {
                } else {
                    embed.setDescription(userprof.description);
                }
                if(userprof.showUsername === 'true') {
                    embed.addField('Username', user.username, true)
                }
                if(userprof.showNickname === 'true') {
                    if(member.nickname != null) {
                        embed.addField('Nickname', member.nickname, true)
                    }
                }
                if(userprof.showPresence === 'true') {
                    embed.addField('Presence Status', 'User Presence is being removed.', true)
                }
                embed.addField('Joined', '<t:'+Math.floor(new Date(member.joinedAt).getTime() / 1000)+'>', true)
                if(usearset) {
                    embed.addField('Language', usearset.language, true)
                }
                if(userprof.pronouns === 'false') {
                } else {
                    embed.addField('Pronouns', userprof.pronouns, true)
                }
                if(userprof.country === 'false') {
                } else {
                    embed.addField('Country', userprof.country, true)
                }
                embed.addField('\u200b', '\u200b', true)
                if(guildset.enableXP === 'true') {
                    if(userprof.showGuildScore === 'true') {
                        if(score) {
                            var pointsNeed = Math.floor(Math.pow(((score.level+1)/0.1), 2));
                            var nextLevel = Math.floor(score.level+1)
                            embed.addField('Guild Score', nFormatter(score.points, 2), true)
                            embed.addField('Guild Level', 'Level: '+nFormatter(score.level, 0)+' | Next Level: '+nFormatter(nextLevel, 0), true)
                            embed.addField("Points needed for Level "+nFormatter(nextLevel, 0), nFormatter(pointsNeed, 2)+' points', true)
                        }
                    }
                }
                if(userprof.showGlobalScore === 'true') {
                    if(guScore) {
                        var pointsNeed = Math.floor(Math.pow(((guScore.level+1)/0.1), 2));
                        var nextLevel = Math.floor(guScore.level+1)
                        embed.addField('Global Score', nFormatter(guScore.points, 2), true)
                        embed.addField('Global Level', 'Level: '+nFormatter(guScore.level, 0)+' | Next Level: '+nFormatter(nextLevel, 0), true)
                        embed.addField("Points needed for Level "+nFormatter(nextLevel, 0), nFormatter(pointsNeed, 2)+' points', true)
                    } else {
                        var pointsNeed = Math.floor(Math.pow((0.1), 2));
                        embed.addField('Global Score', 'Points: 0 | Level: 0 | Next Level: 1', true)
                    }
                }
                if(userprof.showRoles === 'true') {
                    embed.addField('Roles', member.roles.cache.map(r => r.toString()).join(' | '))
                }
                embed.setFooter({ text: 'ID: '+user.id+ ' | User Created: ' })
                embed.setTimestamp(user.createdTimestamp)
            interaction.reply({ embeds: [embed] });
        } else {
            const embed = new MessageEmbed()
                .setTitle('User Info')
                .setThumbnail(user.avatarURL())
                .addField('Username', user.username, true)
                if(member.nickname != null) {
                    embed.addField('Nickname', member.nickname, true)
                }
                embed.addField('Presence Status', 'User Presence is being removed.', true)
                embed.addField('\u200b', '\u200b', true)
                if(guildset.enableXP === 'true') {
                    if(score) {
                        var pointsNeed = Math.floor(Math.pow(((score.level+1)/0.1), 2));
                        var nextLevel = Math.floor(score.level+1)
                        embed.addField('Guild Score', nFormatter(score.points, 2), true)
                        embed.addField('Guild Level', 'Level: '+nFormatter(score.level, 0)+' | Next Level: '+nFormatter(nextLevel, 0), true)
                        embed.addField("Points needed for Level "+nFormatter(nextLevel, 0), nFormatter(pointsNeed, 2)+' points', true)
                    }
                }

                if(userset.globalXP === 'true') {
                    if(guScore) {
                        var pointsNeed = Math.floor(Math.pow(((guScore.level+1)/0.1), 2));
                        var nextLevel = Math.floor(guScore.level+1)
                        embed.addField('Global Score', nFormatter(guScore.points, 2), true)
                        embed.addField('Global Level', 'Level: '+nFormatter(guScore.level, 0)+' | Next Level: '+nFormatter(nextLevel, 0), true)
                        embed.addField("Points needed for Level "+nFormatter(nextLevel, 0), nFormatter(pointsNeed, 2)+' points', true)
                    } else {
                        var pointsNeed = Math.floor(Math.pow((0.1), 2));
                        embed.addField('Global Score', 'Points: 0 | Level: 0 | Next Level: 1', true)
                    }
                }
                embed.addField('Roles', member.roles.cache.map(r => r.toString()).join(' | '))
                embed.setFooter({ text: 'Information requiring user access has been removed.' })
                embed.setTimestamp()
            interaction.reply({ embeds: [embed] });
        }
	}
};
