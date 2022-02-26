const r = require('rethinkdb');
const Discord = require('discord.js')
const bot = new Discord.Client()
const backupfolder = 'E:/UtilBot Backups'
const fs = require('fs')
let d = new Date()
var queuedlogs = []
var contents = ''
const label = `Log ${d.toDateString()} ${Date.now()}`
bot.login('NDE0MjMwNTQzMjI0Mjc0OTQ0.Dj1GaA.dMpr0QCrl0qqLekqgI2jJ7NgkyE');
//-------------------------Functions-------------------------\\
async function log(item, type, event) {
    let d = new Date()
    console.log(`${d.getHours() + 1}:${d.getMinutes() + 1}:${d.getSeconds() + 1} [${item}: ${type}] ${event}`);
    queuedlogs.push(`${d.getHours() + 1}:${d.getMinutes() + 1}:${d.getSeconds() + 1} [${item}: ${type}] ${event}`)
    while (queuedlogs.length > 0) {
        await fs.writeFile(`./logs/${label}.txt`, `${contents}${queuedlogs[0]}\n`, () => { })
        contents += `${queuedlogs[0]}\n`
        queuedlogs.shift()
    }
}
function clean(text) {
    if (typeof (text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
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
function isspam(user, message, server) {
    //-----Keyspam-----\\
    let letters = {}, content = message.content.toLowerCase().split(' ')
    for (let i = 0; i < content.length; i++) if (letters[content[i]] == undefined) letters[content[i]] = 1; else letters[content[i]]++
    for (let i in letters) if (letters[i] / content.length > .60) return true;
    //-----Repeat-----\\
    if (user.lastmsg.content.toLowerCase() == message.content.toLowerCase()) return true;
    else if (user.lastmsg.content.toLowerCase().startsWith(message.content.toLowerCase())) return true;
    else if (message.content.toLowerCase().startsWith(user.lastmsg.content.toLowerCase())) return true;
    //-----Spam-----\\
    if (Date.now() - user.lastmsg.time < 5000) return true;
}
function generateID() {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    let id = []
    for (let i = 0; i < 16; i++) {
        id[i] = chars[Math.floor(Math.random * chars.length)]
    }
    id = id.join('')
    return id;
}

bot.on('warn', console.warn);
bot.on('error', console.error);
bot.on('disconnect', (msg, code) => { if (code === 0) log('UtilBot', 'Warn', 'Disconnected') });
bot.on('reconnecting', () => log('UtilBot', 'Warn', 'Reconnecting'));

r.connect({ host: 'localhost', port: 28015, db: 'test' }, (err, connection) => {
    if (err) {log('DataBase', 'Error', 'Failed to connect.'); return;}
    else log('DataBase', 'Info', 'Connected');
    bot.once('ready', () => {
        log('UtilBot', 'Info', 'Connected');
        //-------------------------Guild Join-------------------------\\
        bot.on('guildCreate', guild => {
            try {
                log('UtilBot', 'Info', `Joined Guild ${guild.name}`);
                let embed = new Discord.RichEmbed(), defaultChannel = "", newserver;
                embed.setColor(0x4b4303)
                guild.channels.forEach((channel) => { if (channel.type == "text" && defaultChannel == "") if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) defaultChannel = channel; })
                r.table('Servers').get(guild.id).run(connection, function (err, server) {
                    try {
                        if (err) log('DataBase', 'Error', `${clean(err)} (GuildCreate)`);
                        if (server == null) newserver = true;
                        else newserver = false;
                        embed.setTitle(`Hello there members of ${guild.name}!`);
                        if (newserver) {
                            embed.setDescription('As it is my first time here, lets get some of the basic out of the way.')
                            embed.addField('Admins:', 'In order to use admin commands you need to add some admins, if you have administrator privliges you can do this, the command is ,,admin add @user.')
                            embed.addField('Levelup:', 'By default I will say the levelup message in what ever channel the user levels up in, you can disable this with ,,announcelevelup.')
                            embed.addField('More commands', 'To view more commands, do ,,help (page/cmd), or watch my help playlist here: (Coming soon!).')
                            embed.addField('To finish up...', 'You can join my support server here: https://discord.gg/Tfxq7Uv. The support server is the best way to report bugs, request features, and get some extra help. See you there!')
                        } else {
                            embed.setDescription('Glad to see im back, you should have already completed setup, so i\'ll make this quick.')
                            embed.addField('Settings:', 'You can review your server settings with ,,settings, admins and auto roles should still be here.')
                            embed.addField('To finish up...', 'If you have not already, you can join my support server here: https://discord.gg/Tfxq7Uv. The support server is the best way to report bugs, request features, and get some extra help. See you there!')
                        }
                        defaultChannel.send(embed);
                    } catch (err) {
                        log('UtilBot', 'FatalError', `GuildcreateGotServer | ${clean(err)}`);
                    }
                })
            } catch (err) {
                log('UtilBot', 'FatalError', `GuildcreateMain | ${clean(err)}`);
            }
        })
        //-------------------------Message Recieved-------------------------\\
        bot.on('message', message => {
            try {
                let pre = ',,', guild = message.guild, author = message.author, args = message.content.slice(pre.length).trim().split(" ");
                let cmd = args.shift().toLowerCase();
                r.table('Servers').get(guild.id).run(connection, (err, storedserver) => {
                    function getuser(server, id) {
                        try {
                            let localprofs = server.localprofs[id]
                            if (localprofs == undefined) return null;
                            else return localprofs;
                        } catch (err) {
                            log('Function(GetUser)', 'FatalError', clean(err))
                        }
                    }
                    try {
                        //-----Server-----\\
                        if (err) { log('DataBase', 'Error', `${clean(err)} (Message/Server)`); return; }
                        let server;
                        if (storedserver !== null) server = storedserver; else {
                            server = {
                                id: guild.id,
                                name: guild.name,
                                lists: {},
                                admins: {},
                                ignore: false,
                                rules: [],
                                autoroles: [],
                                punishhistory: {},
                                localprofs: {},
                                settings: {
                                    announcements: {
                                        announcechannel: null,
                                        greetingchannel: null,
                                        farewellchannel: null,
                                        join: false,
                                        leave: false,
                                        ban: false,
                                        joinmsg: 'Welcome /@user',
                                        leavemsg: 'Farewell /user',
                                        banmsg: '/user was banned!'
                                    },
                                    automod: {
                                        automod: true,
                                        antigrief: true,
                                        keyspam: true,
                                        repeats: false,
                                        sensetivity: 10,
                                        automutelength: 10,
                                        muteroleid: null,
                                    },
                                    msgs: {
                                        announcelevelup: true,
                                        deletereplies: true,
                                        msgdeletedealy: 8000,
                                        commandlogchannel: null,
                                        modlogchannel: null,
                                        reportchannel: null,
                                    },
                                    other: {
                                        prefix: ',,',
                                        ignorebot: true,
                                        enablecommands: true,
                                    },
                                    antigrief: {
                                        records: {},
                                        settings: {
                                            roledeletes: 4,
                                            channeldeletes: 4,
                                            kicks: 3,
                                            bans: 2
                                        }
                                    }
                                }
                            }
                            r.table('Servers').insert(server).run(connection).catch(() => { log('DataBase', 'Error', `Failed to upload server | ${clean(err)}`); })
                        }
                        pre = server.settings.other.prefix
                        //-----User-----\\
                        r.table('Users').get(author.id).run(connection, (err, storeduser) => {
                            try {
                                if (err) { log('DataBase', 'Error', `${clean(err)} (Message/User)`); return; }
                                let user;
                                if (storeduser !== null) user = storeduser; else {
                                    user = {
                                        id: author.id,
                                        name: author.username,
                                        level: 0,
                                        xp: 0,
                                        balance: 0,
                                        afk: false,
                                        reason: 'AFK',
                                        color: 0x000000,
                                        ign: {},
                                        triggers: {},
                                        lastmsg: {
                                            content: "",
                                            time: Date.now()
                                        },
                                        inventory: [],
                                        leveluppm: true,
                                        reputation: 0
                                    }
                                    r.table('Users').insert(user).run(connection).catch(() => { log('DataBase', 'Error', `Failed to upload user | ${clean(err)}`); })
                                    let localprof = getuser(server, user.id)
                                    if (localprof == null) server.localprofs[user.id] = user; 
                                }

                                //-----Automod-----\\
                                if (server.settings.automod.automod && isspam(user, message, server)) {
                                    if (user.triggers[guild.id] == undefined) user.triggers[guild.id] = 1;
                                    else user.triggers[guild.id]++;

                                    if (user.triggers[guild.id] == server.automod.sensetivity - 2) message.channel.send('Please reduce your chat footprint.').then(msg => msg.delete(server.msgs.msgdeletedealy));
                                    else if (user.triggers[guild.id] == server.automod.sensetivity) warn(user, server);
                                    else if (user.triggers[guild.id] == server.automod.sensetivity + 2) mute(user, server);
                                } else user.triggers[guild.id] = 0;
                                r.table('Users').get(author.id).update({triggers: user.triggers}).run(connection)
                                //-----Levels-----\\
                                if (!isspam(user, message, server)) {
                                    let localprof = getuser(server, user.id), globalprof = user;
                                    localprof.xp++
                                    globalprof.xp++
                                    localprof.balance++
                                    globalprof.balance++
                                    //---Local---\\
                                    if (localprof.xp >= localprof.level ** 2) {
                                        localprof.level++;
                                        localprof.xp = 0;
                                        localprof.balance += (10 * Math.floor(localprof.level / 10)) + 20;
                                    }
                                    //---Global---\\
                                    if (globalprof.xp >= globalprof.level ** 2) {
                                        globalprof.level++;
                                        globalprof.xp = 0;
                                        globalprof.balance += (10 * Math.floor(globalprof.level / 10)) + 20;
                                        r.table('Users').get(author.id).update({ xp: globalprof.xp, level: globalprof.level, balance: globalprof.balance}).run(connection)
                                    }
                                }
                                r.table('Servers').get(guild.id).update({ localprofs: server.localprofs}).run(connection)
                            } catch (err) {
                                let id = generateID()
                                log('UtilBot', 'FatalError', `MessageGotUser | ${clean(err)} (${id})`);
                                fs.writeFile(`./errors/${id}.txt`, err, () => { })
                            }
                        })
                        //-----Run Commands-----\\
                        try {
                            let commandFile = require(`./commands.js`);
                            commandFile.run(bot, message, args, r, connection, cmd, pre, log);
                            log('UtilBot', 'Info', `${author.username} ran command ${cmd}.`)
                        } catch (err) {
                            let id = generateID()
                            log('UtilBot', 'Error', `Failed to run a command | ${clean(err)}`)
                            fs.writeFile(`./errors/${id}.txt`, err, () => { })
                        }
                    } catch (err) {
                        let id = generateID()
                        log('UtilBot', 'FatalError', `MessageGotServer | ${clean(err)}`);
                        fs.writeFile(`./errors/${id}.txt`, err, () => { })
                    }
                });
            } catch (err) {
                let id = generateID()
                log('UtilBot', 'FatalError', `MessageMain | ${clean(err)}`);
                fs.writeFile(`./errors/${id}.txt`, err, () => { })
            }
        });
    });
});