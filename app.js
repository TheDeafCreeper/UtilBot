const r = require('rethinkdb');
const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
 //NDE0MjMwNTQzMjI0Mjc0OTQ0.Dj1GaA.dMpr0QCrl0qqLekqgI2jJ7NgkyE
bot.login('NDE0MjMwNTQzMjI0Mjc0OTQ0.Dj1GaA.dMpr0QCrl0qqLekqgI2jJ7NgkyE');
let timing = fs.readFileSync('./timings.json', 'UTF8') , timingQueue = [], isRunning = false
const doTimings = false
function runTiming(start, end, name) {
    let time = end - start
    timingQueue.push({time: time, name: name});
    console.log(timingQueue)
    if (!isRunning) processQueue()
}

async function processQueue() {
    isRunning = true
    while (timingQueue.length > 0) {
        //console.log(timingQueue)
        let name = timingQueue[0].name, time = timingQueue[0].time
        let stored = timing[name]
        if (stored == undefined) stored = {time: 0, count: 0}
        stored.time += time
        stored.count += 1
        stored.avg = stored.time/stored.count
        timing[name] = stored
        await fs.writeFile('./timings.json', JSON.stringify(timing), 'UTF8', () => {});
        timingQueue.shift()
    }
    isRunning = false
}

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
        bot.on('message', async message => {
            if (message.author.bot && message.author.id != "398285806713831424") return;
            let InitilizeStart = Date.now()
            let defaultServer = {
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

            let defaultUser = {
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

            var embed = new Discord.RichEmbed()
            embed.setColor(0x4b4303)
            bot.user.setActivity(`@Utilbot | In ${bot.guilds.array().length} servers!`)
            if (message.guild == null) return;
            //Server\\
            let profile = r.table('Profiles').get(message.author.id).run(connection);
            let server = await r.table('Servers').get(message.guild.id).run(connection)
            if (server == null) {
                server = defaultServer;
                r.table('Servers').insert(server).run(connection);
            } else {
                for (let i in defaultServer) {
                    if (server[i] == undefined) server[i] = defaultServer[i];
                }
                r.table('Servers').get(message.guild.id).update(server).run(connection);
            }
            //User\\
            profile = await profile
            if (profile === null) {
                profile = defaultUser;
                r.table('Profiles').insert(profile).run(connection)
            } else {
                for (let i in defaultUser) {
                    if (profile[i] == undefined) profile[i] = defaultUser[i];
                }
                r.table("Profiles").get(message.author.id).update(profile).run(connection)
            }
            let pre = server.prefix
            let InitilizeEnd = Date.now();
            if (doTimings) runTiming(InitilizeStart, InitilizeEnd, 'Initilize');
            //warning
            let WarningStart = Date.now();
            if (!isadmin(message.author.id)) {
                if (server.enablewarnings && profile.warnings == server.warncount) {
                    let msg = await message.channel.send('Please reduce your chat footprint.')
                    if (server.deletemessages) msg.delete(server.messagetimeout)
                }
                if (server.enablewarnings && profile.warnings > server.warncount) {
                    let reason = 'Spamming chat'
                    message.author.send(`You were auto warned on ${message.guild.name} for ${reason}.`)
                    let count = await r.table('Punishments').count().run(connection)

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
                    let found = false
                    let automodvios = profile.automodvio
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
                }
                if (server.denyrepeat && profile.lastmessage.toLowerCase() == message.content.toLowerCase() && message.content.length > 3) {
                    message.delete(0)
                    message.channel.send('Please dont repeat things.').then(msg => {
                        if (server.deletemessages) {
                            msg.delete(server.messagetimeout)
                        }
                    })
                    return;
                }
            }
            let WarningEnd = Date.now();
            if (doTimings) runTiming(WarningStart, WarningEnd, 'Warning');
            //time check
            let TimeCheckStart = Date.now();
            if (profile.boostexpire <= message.createdTimestamp) {
                if (profile.boostexpire != 0) {
                    r.table("Profiles").get(message.author.id).update({ boostexpire: 0 }).run(connection)
                    r.table("Profiles").get(message.author.id).update({ currentmultiply: 1 }).run(connection)
                }
            }
            if (profile.boostexpirebal <= message.createdTimestamp) {
                if (profile.boostexpirebal != 0) {
                    r.table("Profiles").get(message.author.id).update({ boostexpirebal: 0 }).run(connection)
                    r.table("Profiles").get(message.author.id).update({ currentmultiplybal: 1 }).run(connection)
                }
            }
            let TimeCheckEnd = Date.now();
            if (doTimings) runTiming(TimeCheckStart, TimeCheckEnd, 'TimeCheck');
            //levels
            let LevelStart = Date.now();
            if (profile.lastmessage != undefined) {
                if (message.createdTimestamp - profile.lastsend >= 3000 && message.content != profile.lastmessage && message.content.length != profile.lastmessage.length) {
                    r.table("Profiles").get(message.author.id).update({ xp: profile.xp + (1 * profile.currentmultiply) }).run(connection)
                    r.table("Profiles").get(message.author.id).update({ balance: profile.balance + 1 * profile.currentmultiplybal }).run(connection)
                } else {
                    let warn = profile.warnings += 1
                    r.table("Profiles").get(message.author.id).update({ warnings: warn }).run(connection)
                }
                if (message.createdTimestamp - profile.lastsend >= 5000) {
                    r.table("Profiles").get(message.author.id).update({ warnings: 0 }).run(connection)
                }
                if (profile.xp >= profile.level ** 2) {
                    let level = profile.level

                    r.table("Profiles").get(message.author.id).update({ xp: 0 }).run(connection)
                    r.table("Profiles").get(message.author.id).update({ level: level += 1 }).run(connection)
                    r.table("Profiles").get(message.author.id).update({ balance: profile.balance += 50 + (10 * Math.floor((profile.level + 1) / 5)) }).run(connection)
                    r.table('Servers').get(message.guild.id).run(connection, function (err, server) {
                        console.log(`Announce levelups? ${server.announcelevel}`, `Server: ${message.guild.name}`)
                        /*if (server.announcelevel) {
                            console.log(`Levelup message in guild ${message.guild.name}`)
                            message.channel.send(`Congrats ${message.author.username}, you leveled up to level ${profile.level + 1} and recieved $${50 + (10 * Math.floor((profile.level + 1) / 5))} for it!`).then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(server.messagetimeout)
                                }
                            }).catch(console.log(''))
                        } else if (profile.recievepm) {
                            console.log('Levelup message in dms')
                            message.author.send(`Congrats, you have leveled up to level ${profile.level + 1}!
                                                  \n       __***${profile.level} >>> ${profile.level + 1}***__`).catch(console.error())
                            if (profile.firstpm) {
                                message.author.send(`As this is your first PM, you can disable this message by doing ${pre}recievepm in any server's chat. (I dont read DMs)`)
                                r.table("Profiles").get(message.author.id).update({ firstpm: false }).run(connection)
                            }
                        } else {
                            console.log('Levelup message not sent')
                        }*/
                    })
                }
            }
            let LevelEnd = Date.now();
            if (doTimings) runTiming(LevelStart, LevelEnd, 'Level');
            //remove afk
            let AFKStart = Date.now();
            if (!message.content.startsWith(`${pre}afk`)) {
                if (profile.afk) {
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
            let AFKEnd = Date.now();
            if (doTimings) runTiming(AFKStart, AFKEnd, 'AFK');
            //check mentions
            let MentionsStart = Date.now();
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
            let MentionsEnd = Date.now();
            if (doTimings) runTiming(MentionsStart, MentionsEnd, 'Mentions');
            //constant updates
            let UpdatesStart = Date.now();
            r.table('Profiles').get(message.author.id).update({ lastsend: message.createdTimestamp }).run(connection)
            r.table('Profiles').get(message.author.id).update({ name: message.author.username }).run(connection)
            r.table('Profiles').get(message.author.id).update({ lastmessage: message.content }).run(connection)
            r.table('Servers').get(message.guild.id).update({ name: message.guild.name }).run(connection)
            let UpdatesEnd = Date.now();
            if (doTimings) runTiming(UpdatesStart, UpdatesEnd, 'Updates');
            //handeler
            if (!message.content.startsWith(pre)) return;
            let HandlerStart = Date.now();
            if (server.ignorenext) {
                r.table('Servers').get(message.guild.id).update({ ignorenext: false }).run(connection);
                return;
            }

            if (!server.allowcommands && !isadmin(message.author.id)) {
                message.channel.send("Sorry, but commands are off here and you're not an admin!").then(msg => {
                    if (server.deletemessages) {
                        msg.delete(server.messagetimeout)
                        message.delete(5000)
                    }
                })
                return;
            }
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
                        try { bot.channels.get(`${server.commandlog}`).send(embed) } catch (err) { }
                    }
                }
            }
            let HandlerEnd = Date.now();
            if (doTimings) runTiming(HandlerStart, HandlerEnd, 'Handler');

            //
            function isadmin(user) {
                let isAdminFuncStart = Date.now();
                if (message.guild.ownerID == user) {
                    let isAdminFuncEnd = Date.now();
                    if (doTimings) runTiming(isAdminFuncStart, isAdminFuncEnd, 'isAdmin');
                    return true
                }
                for (let i = 0; i < server.admins.length; i++) {
                    if (server.admins[i] == user) {
                        let isAdminFuncEnd = Date.now();
                        if (doTimings) runTiming(isAdminFuncStart, isAdminFuncEnd, 'isAdmin');
                        return true;
                    }
                }

                let isAdminFuncEnd = Date.now();
                if (doTimings) runTiming(isAdminFuncStart, isAdminFuncEnd, 'isAdmin');
                return false;
            }
        })
    })

    //
    bot.on('guildMemberAdd', async member => {
        let GMAddStart = Date.now();
        let server = await r.table('Servers').get(member.guild.id).run(connection)
        if (server.announcejoin && server.joinmessage != undefined && bot.channels.get(server.announce) != undefined) {
            let message = server.joinmessage
            message = message.split(' ')
            for (let i = 0; i < message.length; i++)
                if (message[i] == '{user}') message[i] = member.user.username
                else if (message[i] == '{@user}') message[i] = `<@!${member.user.id}>`
                else if (message[i] == '{server}') message[i] = member.guild.name
            message = message.join(' ')
            for (let i = 0; i < server.autoroles.length; i++) member.addRole(server.autoroles[i])
            bot.channels.get(server.announce).send(message)
        }
        let GMAddEnd = Date.now();
        if (doTimings) runTiming(GMAddStart, GMAddEnd, 'GMAdd');
    })

    bot.on('guildMemberRemove', async member => {
        let GMRemStart = Date.now();
        let server = await r.table('Servers').get(member.guild.id).run(connection)
        if (server.announceleave && server.leavemessage != undefined && bot.channels.get(server.announce) != undefined) {
            let message = server.leavemessage
            message = message.split(' ')
            for (let i = 0; i < message.length; i++)
                if (message[i] == '{user}') message[i] = member.user.username
                else if (message[i] == '{@user}') message[i] = `<@!${member.user.id}>`
                else if (message[i] == '{server}') message[i] = member.guild.name

            message = message.join(' ')
            member.user.send(message)
            bot.channels.get(server.announce).send(message)
        }
        let GMRemEnd = Date.now();
        if (doTimings) runTiming(GMRemStart, GMRemEnd, 'GMRem');
    })

    bot.on('guildBanAdd', async function (guild, user) {
        let GBaddStart = Date.now();
        let server = await r.table('Servers').get(guild.id).run(connection)
        let network;
        if (server.network != null) network = await r.table('Networks').get(server.network).run(connection)
        if (server.announceban && server.banmessage != undefined && bot.channels.get(server.announce) != undefined) {
            let message = server.banmessage
            message = message.split(' ')
            for (let i = 0; i < message.length; i++)
                if (message[i] == '{user}') message[i] = user.username
                else if (message[i] == '{@user}') message[i] = `<@!${user.id}>`
                else if (message[i] == '{server}') message[i] = guild.name

            message = message.join(' ')
            user.send(`You have been banned from ${guild.name}`)
            bot.channels.get(server.announce).send(message)
        }
        if (network != null && network != undefined) {
            for (let i = 0; i < network.servers.length; i++) {
                let server = await r.table('Servers').get(network.servers[i]).run(connection)
                if (bot.channels.get(gottenserver.announce) != undefined && network.servers[i] != guild.id)
                    bot.channels.get(gottenserver.announce).send(`${user.username} was banned on another server in your network (${guild.name}). You may want to ban them here as well.`)
            }
        }
        let GBaddEnd = Date.now();
        if (doTimings) runTiming(GBaddStart, GBaddEnd, 'GBAdd');
    })

    bot.on('channelDelete', async channel => {
        let ChannelDeleteStart = Date.now();
        let server = await r.table('Servers').get(channel.guild.id).run(connection)
        if (channel.id == server.announce) r.table("Servers").get(channel.guild.id).update({ announce: null }).run(connection)
        if (channel.id == server.commandlog) r.table("Servers").get(channel.guild.id).update({ commandlog: null }).run(connection)
        if (channel.id == server.modlog) r.table("Servers").get(channel.guild.id).update({ modlog: null }).run(connection)
        if (channel.id == server.reportchannel) r.table("Servers").get(channel.guild.id).update({ reportchannel: null }).run(connection)

        let ChannelDeleteEnd = Date.now();
        if (doTimings) runTiming(ChannelDeleteStart, ChannelDeleteEnd, 'ChannelDelete');
    })

    setInterval(async function () {
        let PunishmentsStart = Date.now();
        let rawmutes = await r.table('Punishments').filter({ type: 'Mute' }).run(connection)
        let mutes = await rawmutes.toArray()
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
        let PunishmentsEnd = Date.now();
        if (doTimings) runTiming(PunishmentsStart, PunishmentsEnd, 'Punishments');
    }, 60000)
})
