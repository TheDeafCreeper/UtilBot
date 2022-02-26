const r = require('rethinkdb');
const Discord = require('discord.js')
const bot = new Discord.Client()
bot.login('NDE0MjMwNTQzMjI0Mjc0OTQ0.Dj1GaA.dMpr0QCrl0qqLekqgI2jJ7NgkyE');

bot.on('warn', console.warn);
bot.on('error', console.error);
bot.on('disconnect', function (msg, code) {
    if (code === 0) return /*console.error(msg)*/;
});
bot.on('reconnecting', () => console.log('Reconnecting'));
bot.once('ready', () => {
    console.log('ready')
    bot.user.setActivity(`@Utilbot | In ${bot.guilds.array().length} servers!`)
    var connection = null;
    r.connect({ host: 'localhost', port: 28015, db: 'test' }, function (err, conn) {
        if (err) throw err;
        connection = conn;
        bot.on('guildCreate', guild => {
            let embed = new Discord.RichEmbed()
                .setColor(0x4b4303)
            let newserver
            let defaultChannel = "";
            guild.channels.forEach((channel) => {
                if (channel.type == "text" && defaultChannel == "") {
                    if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
                        defaultChannel = channel;
                    }
                }
            })
            r.table('Servers').get(guild.id).run(connection, function (err, server) {
                if (server == null) {
                    newserver = true
                } else {
                    newserver = false
                }
                embed.setTitle(`Hello there members of ${guild.name}!`)
                if (newserver) {
                    embed.setDescription('As it is my first time here, lets get some of the basic out of the way.')
                    embed.addField('Admins:', 'In order to use admin commands you need to add some admins, if you have administrator privliges you can do this, the command is ,,admin add @user.')
                    embed.addField('Levelup:', 'By default I will say the levelup message in what ever channel the user levels up in, you can disable this with ,,announcelevelup.')
                    embed.addField('More commands', 'To view more commands, do ,,help (page/cmd), or watch my help playlist here: (Coming soon!).')
                    embed.addField('To finish up...', 'You can join my support server here: https://discord.gg/Tfxq7Uv. The support server is the best way to report bugs, request features, and get some extra help. See you there!')
                } else {
                    embed.setDescription('Glad to see im back, you should have already completed setup, so ill make this quick.')
                    embed.addField('Settings:', 'You can review your server settings with ,,settings, admins and auto roles should still be here.')
                    embed.addField('To finish up...', 'If you have not already, you can join my support server here: https://discord.gg/Tfxq7Uv. The support server is the best way to report bugs, request features, and get some extra help. See you there!')
                }
                defaultChannel.send(embed)
            })
        })

        bot.on('message', message => {
            var embed = new Discord.RichEmbed()
            embed.setColor(0x4b4303)
            bot.user.setActivity(`@Utilbot | In ${bot.guilds.array().length} servers!`)
            if (message.guild == null) return;
            //server
            let newserver = false
            r.table('Servers').get(message.guild.id).run(connection, function (err, server) {
                if (server == null) {
                    newserver = true
                    let server0 = {
                        settings: {

                        },
                        network: {
                            id: null,
                            name: null,
                            servers: [],
                        }
                    }
                    r.table('Servers').insert(server0).run(connection)
                    var pre = ',,'
                    return;
                } else {
                    var pre = server.prefix
                }
                pre = '??'
                if (message.author.bot && server.settings.ignorebot) return;
                //user
                r.table('Profiles').get(message.author.id).run(connection, function (err, result) {
                    if (result == null) {
                        let user = {
                            id: message.author.id,
                            lastsend: message.createdTimestamp,
                            level: 1,
                            xp: 0,
                            afk: false,
                            reason: 'AFK',
                            balance: 0,
                            color: 0x000000,
                            ign: 'Not Set',
                            triggers: 0,
                            lastmessage: '',
                            inventory: [],
                            recievelevelpm: true,
                            automodvio: []
                        }
                        r.table('Profiles').insert(user).run(connection)
                        return;
                    }
                    automod()
                    levels()
                    manageafk()
                    constantupdate()
                    checkmentions()
                    //handeler
                    if (true) {
                        if (server.ignorenext) { r.table('Servers').get(message.guild.id).update({ ignorenext: false }).run(connection); return; }
                        if (!server.settings.enablecommands && !isadmin(message.author.id)) { send("Sorry, but commands are off here and you're not an admin!"); return; }
                        let sender = message.author;
                        let args = message.content.slice(pre.length).trim().split(" ");
                        let cmd = args.shift().toLowerCase();
                        if (message.content.startsWith(pre)) {
                            try {
                                let commandFile = require(`./commands.js`);
                                commandFile.run(bot, message, args, r, connection, cmd, pre);
                            } catch (err) {
                                console.error(err);
                            } finally {
                                console.log(`${sender.username} ran the command: ${cmd} with arguments: ${args}`)
                                if (server.settings.commandlogchannel != null) {
                                    embed.setTitle(`${message.author.username} used a command!`)
                                    embed.addField('Command:', cmd)
                                    embed.addField('Arguments:', args.join(' ') + '.')
                                    bot.channels.get(`${server.commandlog}`).send(embed).catch()
                                }
                            }
                        }
                    }
                    //---------
                    function warn(user1, reason, user2) {
                        let warnings = server.punishhistory[message.author.id]
                        let layout = {
                            time: Date.now(),
                            punisheduser: {
                                id: user1.id,
                                name: user1.username,
                            },
                            reason: reason,
                            punisher: {
                                id: user2.id,
                                name: user2.username,
                            },
                            caseid: generateID(),
                            type: 'Warning'
                        }
                        if (warnings == undefined) warnings = [];
                        warnings.push(layout);
                        r.table('Servers').get(message.guild.id).update({ punishhistory: server.punishhistory });
                        bot.users.get(user1.id).send(`You were warned in **${message.guild.name}** for \`${reason}\` by **${user2.username}**.`);
                        embed.setTitle(`${user1.username} was Warned.`)
                        embed.addField(`Warned by`, user2.username, true)
                        embed.addField('Reason for warning:', reason, true)
                        embed.setFooter(`Case ID: ${layout.caseid}`)
                        if (server.settings.modlogchannel !== null) bot.channels.get(server.settings.modlogchannel).send(embed);
                    }
                    function mute(user1, reason, user2) {
                        let warnings = server.punishhistory[message.author.id]
                        let layout = {
                            time: Date.now(),
                            punisheduser: {
                                id: user1.id,
                                name: user1.username,
                            },
                            reason: reason,
                            punisher: {
                                id: user2.id,
                                name: user2.username,
                            },
                            caseid: generateID(),
                            type: 'Mute'
                        }
                        if (warnings == undefined) warnings = [];
                        warnings.push(layout);
                        r.table('Servers').get(message.guild.id).update({ punishhistory: server.punishhistory });
                        bot.users.get(user1.id).send(`You were muted in **${message.guild.name}** for \`${reason}\` by **${user2.username}**.`);
                        embed.setTitle(`${user1.username} was Muted.`)
                        embed.addField(`Muted by`, user2.username, true)
                        embed.addField('Reason for mute:', reason, true)
                        embed.setFooter(`Case ID: ${layout.caseid}`)
                        if (server.settings.modlogchannel !== null) bot.channels.get(server.settings.modlogchannel).send(embed);
                    }
                    function automod() {
                        if (!isspam()) return;
                        r.table('Profiles').get(message.author.id).update({ triggers: result.triggers + 1 }).run(connection);
                        if (isadmin(message.author.id) || !server.settings.automod) return;
                        if (server.settings.sensetivity == undefined || server.settings.sensetivity == null) r.table('Servers').get(message.guild.id).update({ settings: { sensetivity: 10 } }).run(connection);
                        if (result.triggers == server.settings.sensetivity) send('Please reduce your chat footprint', undefined, true);
                        if (result.warnings == server.settings.sensetivity + 1) warn(message.author, 'Spam', { name: 'UtilBot Auto Moderation', id: bot.id });
                        if (result.warnings == server.settings.sensetivity + 4) mute(message.author, 'Spam', { name: 'UtilBot Auto Moderation', id: bot.id });
                        if (server.settings.detectrepeat && result.lastmessage.toLowerCase() == message.content.toLowerCase()) send('Please don\'t repeat things.', undefined, true);
                    }
                    function levels() {
                        if (isspam()) return;
                        if (result.lastmessage != undefined) {
                            r.table("Profiles").get(message.author.id).update({ xp: result.xp + 1, balance: result.balance + 1 }).run(connection)
                            if (result.xp >= result.level ** 2) {
                                let level = result.level
                                r.table("Profiles").get(message.author.id).update({
                                    xp: 0, level: level += 1,
                                    balance: result.balance += 50 + (10 * Math.floor((result.level + 1) / 10))
                                }).run(connection)
                                if (server.settings.announcelevelup) send(`Congrats ${message.author.username}, you leveled up to level ${result.level + 1} and recieved $${50 + (10 * Math.floor((result.level + 1) / 10))} for it!`, undefined, true)
                                else if (result.recievepm) {
                                    message.author.send(`Congrats ${message.author.username}, you leveled up to level ${result.level + 1} and recieved $${50 + (10 * Math.floor((result.level + 1) / 10))} for it!`)
                                    if (result.firstpm) {
                                        message.author.send(`As this is your first PM, you can disable this message by doing ${pre}recievepm in any server's chat. (I dont read DMs)`)
                                        r.table("Profiles").get(message.author.id).update({ firstpm: false }).run(connection)
                                    }
                                }
                            }
                        }
                    }
                    function manageafk() {
                        if (message.content.startsWith(`${pre}afk`) || !result.afk) return;
                        r.table('Profiles').get(message.author.id).update({ afk: false }).run(connection)
                        r.table('Profiles').get(message.author.id).update({ reason: 'AFK' }).run(connection)
                        send(`Welcome back ${message.author.username}, I have removed your **AFK**!!`, undefined, true)
                    }
                    function constantupdate() {
                        r.table('Profiles').get(message.author.id).update({
                            lastsend: message.createdTimestamp, name: message.author.username,
                            lastmessage: message.content
                        }).run(connection)
                        r.table('Servers').get(message.guild.id).update({ name: message.guild.name }).run(connection)
                    }
                    function checkmentions() {
                        if (message.mentions.users.first() != undefined) {
                            let mentions = message.mentions.users.array()
                            let embed = new Discord.RichEmbed()
                                .setTitle(`AFK users`)
                            let oneafk = false
                            for (let i = 0; i < mentions.length; i++) {
                                r.table('Profiles').get(mentions[i].id).run(connection, function (err, afk) {
                                    if (afk == null) return;
                                    if (afk.afk) {
                                        embed.addField(`**${afk.name}** is **AFK**!`, `Reason: **${afk.reason}**`)
                                        oneafk = true
                                    }
                                })
                            }
                            if (oneafk) send(embed, 3000, true)
                            if (message.content == `<@!${bot.id}>` || message.content == `<@${bot.id}>`) {
                                embed.setTitle(`This server's prefix is ${pre}`)
                                embed.setDescription(`To view the help command, do ${pre}help, and to view the bot's status do ${pre}status.`)
                                send(embed, 5000, true)
                            }
                        }
                    }
                    function isadmin(user) {
                        if (message.guild.owner == user) {
                            return true
                        }
                        for (let i = 0; i < server.admins.length; i++) {
                            if (server.admins[i] == user) {
                                return true;
                            }
                        }
                        return false;
                    }
                    function send(msg, delay, ignoresent) {
                        message.channel.send(msg).then(msg2 => {
                            if (server.settings.deletereplies) {
                                if (!ignoresent) {
                                    if (delay != undefined) {
                                        msg2.delete(delay)
                                        message.delete(delay)
                                    } else {
                                        msg2.delete(server.settings.msgdeletedealy)
                                        message.delete(server.settings.msgdeletedealy)
                                    }
                                } else {
                                    if (delay != undefined) {
                                        msg2.delete(delay)
                                    } else {
                                        msg2.delete(server.settings.msgdeletedealy)
                                    }
                                }
                            }
                        })
                    }
                    function sendelse(msg, id, delay, ignoresent) {
                        bot.channels.get(id).send(msg).then(msg2 => {
                            if (server.settings.deletereplies) {
                                if (!ignoresent) {
                                    if (delay != undefined) {
                                        msg2.delete(delay)
                                        message.delete(delay)
                                    } else {
                                        msg2.delete(server.settings.msgdeletedealy)
                                        message.delete(server.settings.msgdeletedealy)
                                    }
                                } else {
                                    if (delay != undefined) {
                                        msg2.delete(delay)
                                    } else {
                                        msg2.delete(server.settings.msgdeletedealy)
                                    }
                                }
                            }
                        }).catch()
                    }
                    function isspam() {
                        let lastmessage = {
                            content: result.lastmessage,
                            sent: result.lastsend
                        }
                        if (message.createdTimestamp - lastmessage.sent > 5000) {
                            r.table('Profiles').get(message.author.id).update({ triggers: 0 }).run(connection);
                            return false;
                        }
                        let chars = {}
                        if (lastmessage.content.toLowerCase() == message.content.toLowerCase() ||
                            lastmessage.content.toLowerCase().startsWith(message.content.toLowerCase()) ||
                            message.content.toLowerCase().startsWith(lastmessage.content.toLowerCase())) return true;
                        if (message.content.length < 5) return true;
                        for (let i = 0; i < message.content.length; i++) {
                            if (chars[message.content[i].toLowerCase()] == undefined) chars[message.content[i].toLowerCase()] = 0
                            chars[message.content[i].toLowerCase()]++
                        }
                        for (let char in chars) {
                            if (chars[char] / message.content.length > .7) return true;
                        }
                        if (message.createdTimestamp - lastmessage.sent >= 2000) return true;
                        return false;
                    }
                    function generateID() {
                        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-=_+'
                        let id = []
                        for (let i = 0; i < 16; i++) {
                            id[i] = chars[Math.floor(Math.random * chars.length)]
                        }
                        id = id.join('')
                        return id;
                    }
                    function parse(text, user) {
                        text = text.trim().split(' ')
                        for (let i = 0; i < text.length; i++) {
                            if (text[i].trim().toLowerCase().startsWith('{user}')) {
                                let temp = text[i].split('')
                                temp.splice(0, 6)
                                temp = temp.join('')
                                text[i] = `${user.username}${temp}`
                            } else if (text[i].trim().toLowerCase().endsWith('{user}')) {
                                let temp = text[i].split('')
                                temp.splice(text[i].length - 6, 6)
                                temp = temp.join('')
                                text[i] = `${temp}${user.username}`
                            } else if (text[i].trim().toLowerCase().startsWith('{@user}')) {
                                let temp = text[i].split('')
                                temp.splice(0, 7)
                                temp = temp.join('')
                                text[i] = `<@!${user.id}>${temp}`
                            } else if (text[i].trim().toLowerCase().endsWith('{user}')) {
                                let temp = text[i].split('')
                                temp.splice(text[i].length - 7, 7)
                                temp = temp.join('')
                                text[i] = `${temp}<@!${user.id}>`
                            } else if (text[i].trim().toLowerCase().startsWith('{server}')) {
                                let temp = text[i].split('')
                                temp.splice(0, 8)
                                temp = temp.join('')
                                text[i] = `${message.guild.name}${temp}`
                            } else if (text[i].trim().toLowerCase().endsWith('{server}')) {
                                let temp = text[i].split('')
                                temp.splice(text[i].length - 8, 8)
                                temp = temp.join('')
                                text[i] = `${temp}${message.guild.name}`
                            }
                        }
                        text = text.join(' ')
                        return text;
                    }
                })
            })
        })
    })

    //
    bot.on('guildMemberAdd', member => {
        r.table('Servers').get(member.guild.id).run(connection, function (err, server) {
            if (server.settings.announcejoin && server.joinmessage != '' && bot.channels.get(server.settings.joinleavechannel) != undefined) {
                let message = server.settings.joinmessage
                parse(message, member)
                for (let i = 0; i < server.autoroles.length; i++) {
                    member.addRole(server.autoroles[i])
                }
                bot.channels.get(server.settings.joinleavechannel).send(message)
            }
        })
    })

    bot.on('guildMemberRemove', member => {
        r.table('Servers').get(member.guild.id).run(connection, function (err, server) {
            if (server.settings.announceleave && server.leavemessage != '' && bot.channels.get(server.settings.joinleavechannel) != undefined) {
                let message = server.settings.leavemessage
                parse(message, member)
                for (let i = 0; i < server.autoroles.length; i++) {
                    member.addRole(server.autoroles[i])
                }
                bot.channels.get(server.settings.joinleavechannel).send(message)
            }
        })
    })

    bot.on('guildBanAdd', function (guild, user) {
        r.table('Servers').get(guild.id).run(connection, function (err, server) {
            r.table('Networks').get(server.network).run(connection, function (err, network) {
                if (server.settings.announceban && server.banmessage != '' && bot.channels.get(server.settings.joinleavechannel) != undefined) {
                    let message = server.settings.banmessage
                    parse(message, member)
                    for (let i = 0; i < server.autoroles.length; i++) {
                        member.addRole(server.autoroles[i])
                    }
                    bot.channels.get(server.settings.joinleavechannel).send(message)
                }
                if (network != null) {
                    for (let i = 0; i < network.servers.length; i++) {
                        r.table('Servers').get(network.servers[i]).run(connection, function (err, gottenserver) {
                            if (bot.channels.get(gottenserver.announce) != undefined && network.servers[i] != guild.id) {
                                bot.channels.get(gottenserver.announce).send(`${user.username} was banned on another server in your network (${guild.name}). You may want to ban them here as well.`)
                            }
                        })
                    }
                }
            })
        })
    })

    bot.on('channelDelete', channel => {
        r.table('Servers').get(channel.guild.id).run(connection, function (err, server) {
            if (channel.id == server.announce) {
                r.table("Servers").get(channel.guild.id).update({ announce: null }).run(connection)
            }
            if (channel.id == server.commandlog) {
                r.table("Servers").get(channel.guild.id).update({ commandlog: null }).run(connection)
            }
            if (channel.id == server.modlog) {
                r.table("Servers").get(channel.guild.id).update({ modlog: null }).run(connection)
            }
            if (channel.id == server.reportchannel) {
                r.table("Servers").get(channel.guild.id).update({ reportchannel: null }).run(connection)
            }
        })
    })

    setInterval(function () {
        r.table('Punishments').filter({ type: 'Mute' }).run(connection, function (err, rawmutes) {
            rawmutes.toArray(function (err, mutes) {
                for (let i = 0; i < mutes.length; i++) {
                    let duration = mutes[i].length
                    duration--
                    if (duration >= 0) {
                        if (duration == 0) {
                            r.table('Punishments').get(mutes[i].id).update({ length: -1 }).run(connection)
                            if (mutes[i].guild != undefined) {
                                let role = bot.guilds.get(mutes[i].guild).roles.find("name", "Muted")
                                bot.guilds.get(mutes[i].guild).members.get(mutes[i].user.id).removeRole(role)
                            }
                        } else {
                            r.table('Punishments').get(mutes[i].id).update({ length: duration }).run(connection)
                        }
                    }
                }
            })
        })
    }, 60000)
})