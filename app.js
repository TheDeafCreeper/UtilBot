const r = require('rethinkdb');
const Discord = require('discord.js')
const bot = new Discord.Client();
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
                    let serverr = {
                        id: message.guild.id,
                        lists: [],
                        admins: [],
                        announce: null,
                        prefix: ',,',
                        network: null,
                        name: message.guild.name,
                        ytlist: {
                            playing: false,
                            list: [],
                            connection: null
                        },
                        announcelevel: true,
                        warncount: 10,
                        enablewarnings: false,
                        denyrepeat: false,
                        deletemessages: true,
                        messagetimeout: 8000,
                        rules: [],
                        ignorenext: false,
                        echoadmin: true,
                        warnings: [],
                        commandlog: null,
                        modlog: null,
                        autoroles: [],
                        muteroleid: 0,
                        reportchannel: null
                    }
                    r.table('Servers').insert(serverr).run(connection)
                    var pre = ',,'
                    return;
                } else {
                    var pre = server.prefix
                }
                if (message.author.bot && message.author.id != 398285806713831424) return;
//user
                r.table('Profiles').get(message.author.id).run(connection, function (err, result) {
                    if (result == null) {
                        let user = {
                            id: message.author.id,
                            name: message.author.username,
                            lastsend: message.createdTimestamp,
                            level: 1,
                            xp: 0,
                            afk: false,
                            reason: 'AFK',
                            balance: 0,
                            color: 0x000000,
                            mcname: 'Not Set',
                            warnings: 0,
                            lastmessage: '',
                            inventory: [],
                            recievelevelpm: true,
                            profilepic: 'https://cdn.discordapp.com/attachments/403345572481990666/456508718809481217/download.png',
                            currentmultiply: 1,
                            boostexpire: 0,
                            currentmultiplybal: 1,
                            boostexpirebal: 0,
                            automodvio: []
                        }
                        r.table('Profiles').insert(user).run(connection)
                        return;
                    } else {
                    }
//verify integrity server
                    if (server.id == undefined) {
                        r.table('Servers').get(message.guild.id).update({ id: message.guild.id }).run(connection)
                    }
                    if (server.lists == undefined) {
                        r.table('Servers').get(message.guild.id).update({ lists: [] }).run(connection)
                    }
                    if (server.admins == undefined) {
                        r.table('Servers').get(message.guild.id).update({ admins: [] }).run(connection)
                    }
                    if (server.announce == undefined) {
                        r.table('Servers').get(message.guild.id).update({ announce: null }).run(connection)
                    }
                    if (server.prefix == undefined) {
                        r.table('Servers').get(message.guild.id).update({ prefix: ',,' }).run(connection)
                    }
                    if (server.network == undefined) {
                        r.table('Servers').get(message.guild.id).update({ network: null }).run(connection)
                    }
                    if (server.name == undefined) {
                        r.table('Servers').get(message.guild.id).update({ name: message.guild.name }).run(connection)
                    }
                    if (server.ytlist == undefined) {
                        r.table('Servers').get(message.guild.id).update({
                            ytlist: {
                                playing: false,
                                list: [],
                                connection: null
                            }
                        }).run(connection)
                    }
                    if (server.announcelevel == undefined) {
                        r.table('Servers').get(message.guild.id).update({ announcelevel: true }).run(connection)
                    }
                    if (server.warncount == undefined) {
                        r.table('Servers').get(message.guild.id).update({ warncount: 10 }).run(connection)
                    }
                    if (server.enablewarnings == undefined) {
                        r.table('Servers').get(message.guild.id).update({ enablewarnings: false }).run(connection)
                    }
                    if (server.denyrepeat == undefined) {
                        r.table('Servers').get(message.guild.id).update({ denyrepeat: false }).run(connection)
                    }
                    if (server.joinmessage == undefined) {
                        r.table('Servers').get(message.guild.id).update({ joinmessage: '' }).run(connection)
                    }
                    if (server.announcejoin == undefined) {
                        r.table('Servers').get(message.guild.id).update({ announcejoin: false }).run(connection)
                    }
                    if (server.leavemessage == undefined) {
                        r.table('Servers').get(message.guild.id).update({ leavemessage: '' }).run(connection)
                    }
                    if (server.announceleave == undefined) {
                        r.table('Servers').get(message.guild.id).update({ announceleave: false }).run(connection)
                    }
                    if (server.announceban == undefined) {
                        r.table('Servers').get(message.guild.id).update({ announceban: false }).run(connection)
                    }
                    if (server.banmessage == undefined) {
                        r.table('Servers').get(message.guild.id).update({ banmessage: '' }).run(connection)
                    }
                    if (server.allowcommands == undefined) {
                        r.table('Servers').get(message.guild.id).update({ allowcommands: true }).run(connection)
                    }
                    if (server.messagetimeout == undefined) {
                        r.table('Servers').get(message.guild.id).update({ messagetimeout: 8000 }).run(connection)
                    }
                    if (server.deletemessages == undefined) {
                        r.table('Servers').get(message.guild.id).update({ deletemessages: true }).run(connection)
                    }
                    if (server.rules == undefined) {
                        r.table('Servers').get(message.guild.id).update({ rules: [] }).run(connection)
                    }
                    if (server.ignorenext == undefined) {
                        r.table('Servers').get(message.guild.id).update({ ignorenext: false }).run(connection)
                    }
                    if (server.echoadmin == undefined) {
                        r.table('Servers').get(message.guild.id).update({ echoadmin: true }).run(connection)
                    }
                    if (server.warnings == undefined) {
                        r.table('Servers').get(message.guild.id).update({ warnings: [] }).run(connection)
                    }
                    if (server.commandlog == undefined) {
                        r.table('Servers').get(message.guild.id).update({ commandlog: null }).run(connection)
                    }
                    if (server.modlog == undefined) {
                        r.table('Servers').get(message.guild.id).update({ modlog: null }).run(connection)
                    }
                    if (server.autoroles == undefined) {
                        r.table("Servers").get(message.guild.id).update({ autoroles: [] }).run(connection)
                    }
                    if (server.muteroleid == undefined) {
                        r.table("Servers").get(message.guild.id).update({ muteroleid: 0 }).run(connection)
                    }
                    if (server.reportchannel == undefined) {
                        r.table("Servers").get(message.guild.id).update({ reportchannel: null }).run(connection)
                    }
//verify integrity user
                    if (result.id == undefined) {
                        r.table("Profiles").get(message.author.id).update({ id: message.author.id }).run(connection)
                    }
                    if (result.name == undefined) {
                        r.table("Profiles").get(message.author.id).update({ name: message.author.username }).run(connection)
                    }
                    if (result.lastsend == undefined) {
                        r.table("Profiles").get(message.author.id).update({ lastsend: message.createdTimestamp }).run(connection)
                    }
                    if (result.level == undefined) {
                        r.table("Profiles").get(message.author.id).update({ level: 1 }).run(connection)
                    }
                    if (result.xp == undefined) {
                        r.table("Profiles").get(message.author.id).update({ xp: 0 }).run(connection)
                    }
                    if (result.afk == undefined) {
                        r.table("Profiles").get(message.author.id).update({ afk: false }).run(connection)
                    }
                    if (result.reason == undefined) {
                        r.table("Profiles").get(message.author.id).update({ reason: 'AFK' }).run(connection)
                    }
                    if (result.balance == undefined) {
                        r.table("Profiles").get(message.author.id).update({ balance: 0 }).run(connection)
                    }
                    if (result.color == undefined) {
                        r.table("Profiles").get(message.author.id).update({ color: 0x000000 }).run(connection)
                    }
                    if (result.mcname == undefined) {
                        r.table("Profiles").get(message.author.id).update({ mcname: 'Not Set' }).run(connection)
                    }
                    if (result.warnings == undefined) {
                        r.table("Profiles").get(message.author.id).update({ warnings: 0 }).run(connection)
                    }
                    if (result.lastmessage == undefined) {
                        r.table("Profiles").get(message.author.id).update({ lastmessage: message.content }).run(connection)
                    }
                    if (result.inventory == undefined) {
                        r.table("Profiles").get(message.author.id).update({ inventory: [] }).run(connection)
                    }
                    if (result.recievelevelpm == undefined) {
                        r.table("Profiles").get(message.author.id).update({ recievelevelpm: true }).run(connection)
                    }
                    if (result.firstpm == undefined) {
                        r.table("Profiles").get(message.author.id).update({ firstpm: true }).run(connection)
                    }
                    if (result.profilepic == undefined || result.profilepic == null) {
                        r.table("Profiles").get(message.author.id).update({ profilepic: 'https://cdn.discordapp.com/attachments/403345572481990666/456508718809481217/download.png' }).run(connection)
                    }
                    if (result.currentmultiply == undefined) {
                        r.table("Profiles").get(message.author.id).update({ currentmultiply: 1 }).run(connection)
                    }
                    if (result.boostexpire == undefined) {
                        r.table("Profiles").get(message.author.id).update({ boostexpire: 0 }).run(connection)
                    }
                    if (result.currentmultiplybal == undefined) {
                        r.table("Profiles").get(message.author.id).update({ currentmultiplybal: 1 }).run(connection)
                    }
                    if (result.boostexpirebal == undefined) {
                        r.table("Profiles").get(message.author.id).update({ boostexpirebal: 0 }).run(connection)
                    }
                    if (result.automodvio == undefined) {
                        r.table("Profiles").get(message.author.id).update({ automodvio: [] }).run(connection)
                    }
//warning
                    if (!isadmin(message.author.id)) {
                        if (server.warncount == undefined || server.warncount == null) {
                            r.table('Servers').get(message.guild.id).update({ warncount: 10 }).run(connection)
                        }
                        if (server.enablewarnings && result.warnings == server.warncount && !isadmin(message.author.id)) {
                            message.channel.send('Please reduce your chat footprint.').then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(server.messagetimeout)
                                }
                            })
                        }
                        if (server.enablewarnings && result.warnings > server.warncount) {
                            let admin = false
                            for (let i = 0; i < server.admins.length; i++) {
                                if (server.admins[i] == message.mentions.users.first().id) {
                                    admin = true
                                    break;
                                }
                            }
                            if (!isadmin(message.author.id)) {
                                let reason = 'Spamming chat'
                                message.author.send(`You were auto warned on ${message.guild.name} for ${reason}.`)
                                r.table('Punishments').count().run(connection, function (err, count) {
                                    r.table('Punishments').insert({ id: count, user: { name: message.author.username, id: message.author.id }, reason: reason, type: 'Warn' }).run(connection)
                                    let serverwarnings = server.warnings
                                    serverwarnings.push({ id: count, user: message.author.id })
                                    r.table('Servers').get(message.guild.id).update({ warnings: serverwarnings }).run(connection)
                                    try {
                                        if (server.modlog != null) {
                                            embed.setTitle(`Case ID: ${count}`)
                                            embed.setDescription(`${message.author.username} was auto warned!`)
                                            if (reason != undefined && reason != '') {
                                                embed.addField('Reason:', reason)
                                            }
                                            embed.setColor(0xffa300)
                                            bot.channels.get(server.modlog.id).send(embed)
                                        }
                                    } catch (error) { console.error(error) }
                                    r.table('Profiles').get(message.author.id).run(connection, function(err, user) {
                                        let found = false
                                        let automodvios = user.automodvio
                                        for (let i = 0; i < automodvios.length; i++) {
                                            if (automodvios[i].guild == message.guild.id) {
                                                found = true
                                                let vios = automodvios[i].vios
                                                let newvio = {
                                                    case: count,
                                                    number: automodvios.length,
                                                    time: message.createdTimestamp
                                                }
                                                vios.push(newvio)
                                                r.table('Profiles').get(message.author.id).update({ automodvio: automodvios }).run(connection)
                                            }
                                        }
                                        if (!found) {
                                            let vios = {
                                                guild: message.guild.id,
                                                vios: [{
                                                    case: count,
                                                    number: 0,
                                                    time: message.createdTimestamp
                                                }]
                                            }
                                            automodvios.push(vios)
                                            r.table('Profiles').get(message.author.id).update({ automodvio: automodvios }).run(connection)
                                        }
                                    })
                                })
                            }
                            if (server.denyrepeat && result.lastmessage.toLowerCase() == message.content.toLowerCase()) {
                                message.delete(0)
                                message.channel.send('Please dont repeat things.').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                    }
                                })
                                return;
                            }
                        }
                    }
//time check
                    r.table('Profiles').get(message.author.id).run(connection, function (err, profile) {
                        if (profile.boostexpire <= message.createdTimestamp) {
                            r.table("Profiles").get(message.author.id).update({ boostexpire: 0 }).run(connection)
                            r.table("Profiles").get(message.author.id).update({ currentmultiply: 1 }).run(connection)
                        }
                        if (profile.boostexpirebal <= message.createdTimestamp) {
                            r.table("Profiles").get(message.author.id).update({ boostexpirebal: 0 }).run(connection)
                            r.table("Profiles").get(message.author.id).update({ currentmultiplybal: 1 }).run(connection)
                        }
                    })
//levels
                    if (result.lastmessage != undefined) {
                        if (message.createdTimestamp - result.lastsend >= 3000 && message.content != result.lastmessage && message.content.length != result.lastmessage.length) {
                            r.table("Profiles").get(message.author.id).update({ xp: result.xp + (1 * result.currentmultiply) }).run(connection)
                            r.table("Profiles").get(message.author.id).update({ balance: result.balance + 1 * result.currentmultiplybal }).run(connection)
                        } else {
                            let warn = result.warnings += 1
                            r.table("Profiles").get(message.author.id).update({ warnings: warn }).run(connection)
                        }
                        if (message.createdTimestamp - result.lastsend >= 5000) {
                            r.table("Profiles").get(message.author.id).update({ warnings: 0 }).run(connection)
                        }
                        if (result.xp >= result.level ** 2) {
                            let level = result.level

                            r.table("Profiles").get(message.author.id).update({ xp: 0 }).run(connection)
                            r.table("Profiles").get(message.author.id).update({ level: level += 1 }).run(connection)
                            r.table("Profiles").get(message.author.id).update({ balance: result.balance += 50 + (10 * Math.floor((result.level + 1) / 5)) }).run(connection)
                            r.table('Servers').get(message.guild.id).run(connection, function (err, server) {
                                if (server.announcelevel) {
                                    message.channel.send(`Congrats ${message.author.username}, you leveled up to level ${result.level + 1} and recieved $${50 + (10 * Math.floor((result.level + 1) / 5))} for it!`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                        }
                                    })
                                } else if (result.recievepm) {
                                    message.author.send(`Congrats, you have leveled up to level ${result.level + 1}!
                                                  \n       __***${result.level} >>> ${result.level + 1}***__`)
                                    if (result.firstpm) {
                                        message.author.send(`As this is your first PM, you can disable this message by doing ${pre}recievepm in any server's chat. (I dont read DMs)`)
                                        r.table("Profiles").get(message.author.id).update({ firstpm: false }).run(connection)
                                    }
                                }
                            })
                        }
                    }
//remove afk
                    if (!message.content.startsWith(`${pre}afk`)) {
                        if (result.afk) {
                            r.table('Profiles').get(message.author.id).update({ afk: false }).run(connection)
                            r.table('Profiles').get(message.author.id).update({ reason: 'AFK' }).run(connection)
                            message.channel.send(`Welcome back ${message.author.username}, I have removed your **AFK**!!`).then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(server.messagetimeout)
                                }
                            })
                            r.table('Counters').get("AFK Count").run(connection, function (err, count) {
                                r.table('Counters').get("AFK Count").update({ count: count.count - 1 }).run(connection)
                            })
                        }
                    }
//check mentions
                    if (message.mentions.users.first() != undefined) {
                        let mentions = message.mentions.users.array()
                        let embed = new Discord.RichEmbed()
                            .setTitle(`AFK users`)
                        isafk = false
                        for (let i = 0; i < mentions.length; i++) {
                            r.table('Profiles').get(mentions[i].id).run(connection, function (err, afk) {
                                if (afk != null) {
                                    if (afk.afk) {
                                        embed.addField(`**${afk.name}** is **AFK**!`, `Reason: **${afk.reason}**`)
                                        isafk = true
                                    }
                                }


                                if (isafk && i == (mentions.length - 1)) {
                                    message.channel.send(embed).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(5000)
                                        }
                                    })
                                }
                            })
                        }
                        if (message.mentions.users.first().id == '414230543224274944') {
                            embed.setTitle(`This server's prefix is ${pre}`)
                            embed.setDescription(`To view the help command, do ${pre}help, and to view the bot's status do ${pre}status.`)
                            message.channel.send(embed).then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(server.messagetimeout)
                                    message.delete(5000)
                                }
                            })
                        }
                    }
//constant updates 
                    r.table('Profiles').get(message.author.id).update({ lastsend: message.createdTimestamp }).run(connection)
                    r.table('Profiles').get(message.author.id).update({ name: message.author.username }).run(connection)
                    r.table('Profiles').get(message.author.id).update({ lastmessage: message.content }).run(connection)
                    r.table('Servers').get(message.guild.id).update({ name: message.guild.name }).run(connection)

//handeler
                    if (!server.ignorenext) {
                        let notadmin = true
                        if (server.admins.length == 0) {
                            notadmin = false
                        } else {
                            for (let i = 0; i < server.admins.length; i++) {
                                if (server.admins[i] == message.author.id) {
                                    notadmin = false
                                    break;
                                }
                            }
                        }
                        if (!server.allowcommands && notadmin) {
                            message.channel.send("Sorry, but commands are off here and you're not an admin!").then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(server.messagetimeout)
                                    message.delete(5000)
                                }
                            })
                        } else {
                            let msg = message.content.toUpperCase();
                            let sender = message.author;
                            let args = message.content.slice(pre.length).trim().split(" ");
                            let cmd = args.shift().toLowerCase();
                            if (message.content.startsWith(pre + 'restart')) {
                                let commandFile = require(`./commands.js`);
                                commandFile.run(bot, message, args, r, connection, cmd, pre);
                                console.error(err);
                                console.log(`${sender.username} ran the command: ${cmd} with arguments: ${args}`)
                            } else if (message.content.startsWith(pre)) {
                                try {
                                    let commandFile = require(`./commands.js`);
                                    commandFile.run(bot, message, args, r, connection, cmd, pre);
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    console.log(`${sender.username} ran the command: ${cmd} with arguments: ${args}`)
                                    if (server.commandlog != null) {
                                        embed.setTitle(`${message.author.username} used a command!`)
                                        embed.addField('Command:', cmd)
                                        embed.addField('Arguments:', args.join(' ') + '.')
                                        try{bot.channels.get(`${server.commandlog}`).send(embed)} catch (err) {}
                                    }
                                }
                            }
                        }
                    } else {
                        r.table('Servers').get(message.guild.id).update({ ignorenext: false }).run(connection)
                    }
//
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
                })
            })
        })
    })

//
    bot.on('guildMemberAdd', member => {
        r.table('Servers').get(member.guild.id).run(connection, function (err, server) {
            if (server.announcejoin && server.joinmessage != undefined && bot.channels.get(server.announce) != undefined) {
                let message = server.joinmessage
                message = message.split(' ')
                for (let i = 0; i < message.length; i++) {
                    if (message[i] == '{user}') {
                        message[i] = member.user.username
                    } else if (message[i] == '{@user}') {
                        message[i] = `<@!${member.user.id}>`
                    } else if (message[i] == '{server}') {
                        message[i] = member.guild.name
                    }
                }
                message = message.join(' ')
                member.addRoles(server.autoroles)
                bot.channels.get(server.announce).send(message)
            }
        })
    })

    bot.on('guildMemberRemove', member => {
        r.table('Servers').get(member.guild.id).run(connection, function (err, server) {
            if (server.announceleave && server.leavemessage != undefined && bot.channels.get(server.announce) != undefined) {
                let message = server.leavemessage
                message = message.split(' ')
                for (let i = 0; i < message.length; i++) {
                    if (message[i] == '{user}') {
                        message[i] = member.user.username
                    } else if (message[i] == '{@user}') {
                        message[i] = `<@!${member.user.id}>`
                    } else if (message[i] == '{server}') {
                        message[i] = member.guild.name
                    }
                }
                message = message.join(' ')
                member.user.send(message)
                bot.channels.get(server.announce).send(message)
            }
        })
    })

    bot.on('guildBanAdd', function (guild, user) {
        r.table('Servers').get(guild.id).run(connection, function (err, server) {
            r.table('Networks').get(server.network).run(connection, function (err, network) {
                if (server.announceban && server.banmessage != undefined && bot.channels.get(server.announce) != undefined) {
                    let message = server.banmessage
                    message = message.split(' ')
                    for (let i = 0; i < message.length; i++) {
                        if (message[i] == '{user}') {
                            message[i] = user.username
                        } else if (message[i] == '{@user}') {
                            message[i] = `<@!${user.id}>`
                        } else if (message[i] == '{server}') {
                            message[i] = guild.name
                        }
                    }
                    message = message.join(' ')
                    user.send(`You have been banned from ${guild.name}`)
                    bot.channels.get(server.announce).send(message)
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