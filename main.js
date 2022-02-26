const r = require('rethinkdb');
const Discord = require('discord.js')
const bot = new Discord.Client();
const hibp = require('hibp')
const serverdefault = {
    name: null,
    id: null,
    users: {},
    autoroles: [],
    mutes: [],
    settings: {
        modLog: null,
        announceChannel: null,
        welcomeChannel: null,
        reportChannel: null,
        welcomeMessage: 'Welcome {@user} to {server}!',
        farewellMessage: 'Goodbye {user} hope to see you again!',
        banMessage: '{user} was banned!',
    },
    AutoMod: {
        enabled: true,
        spamSensetivity: 5,
        antiKeyspam: false,
        VerbalWarnKeySpam: false,
        keyspamPrecent: .65,
        capsDetection: false,
        capsPercent: .65,
        VerbalWarnCaps: false,
        AlertMode: false,
    },
    prefix: '--',
    plannedAnnouncements: [],
    ModRoles: [],
    Shop: [],
    Orders: [],
}
const userdefault = {
    name: null,
    id: null,
    afk: {
        reason: null,
        afk: false,
        start: 0
    },
    reputation: 0
}
const goodColor = 0x05b200
const badColor = 0x770000
const neutralColor = 0x9cbf72

bot.on('warn', console.warn);
bot.on('error', console.error);
bot.on('disconnect', function (msg, code) {
    if (code === 0) return /*console.error(msg)*/;
});
bot.on('reconnecting', () => console.log('Reconnecting'));
bot.login('NDY3NTU3MTY1MzA2MjE2NDQ5.Dy_dyg.tiyMXrt_MsldWRHOqoPGVwS_3-8')
r.connect({ host: 'localhost', port: 28015, db: 'UtilBot' }, function (err, connection) {
    console.log('Connected')
    //----------Classes----------\\
    class Server {
        constructor(storedserver) {
            this.name = storedserver.name;
            this.id = storedserver.id;
            this.users = storedserver.users;
            this.autoroles = storedserver.autoroles;
            this.mutes = storedserver.mutes;
            this.settings = storedserver.settings;
            this.AutoMod = storedserver.AutoMod;
            this.prefix = storedserver.prefix;
            this.plannedAnnouncements = storedserver.plannedAnnouncements;
            this.ModRoles = storedserver.ModRoles;
            this.Shop = storedserver.Shop;
            this.Orders = storedserver.Orders;

            for (var i in this) if (this[i] == undefined) this[i] = serverdefault[i];
        };

        update() { r.table('Servers').get(this.id).update(this).run(connection) };
        fetchuser(id, message, skip) {
            if (id == undefined) return null;
            let user = this.users[id];
            if (user == null) user = undefined
            if (user == undefined && skip == undefined) {
                let roles = message.guild.member(message.author).roles.array()
                for (let i = 0; i < roles.length; i++) roles[i] = roles[i].id
                this.users[id] = {
                    Name: message.author.username,
                    Inventory: {},
                    Roles: roles,
                    recentMSGs: [],
                    Stage: 0,
                    Admin: message.guild.ownerID == message.author.id
                }
                user = this.users[id]
            }
            this.update()
            return user;
        }
        getAdmins() {
            let admins = this.admins;
            for (let i = 0; i < admins.length; i++) admins[i] = this.fetchuser(admins[i]);
            return admins;
        }
    };

    class User {
        constructor(storeduser) {
            this.name = storeduser.name;
            this.id = storeduser.id;
            this.afk = storeduser.afk;
            this.reputation = storeduser.reputation;

            for (var i in this) if (this[i] == undefined) this[i] = userdefault[i];
        };

        update() { r.table('Users').get(this.id).update(this).run(connection) };
    };
    bot.once('ready', () => {
        console.log('Ready')
        //----------Events----------\\
        bot.on('message', async message => {
            if (message.author.bot) return;
            let embed = new Discord.RichEmbed()
            let storeduser = await r.table('Users').get(message.author.id).run(connection);
            let storedserver = await r.table('Servers').get(message.guild.id).run(connection);
            //----------Setup---------\\
            let server, user
            if (storedserver == null) {
                storedserver = { name: message.guild.name, id: message.guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection)
            } else server = new Server(storedserver);
            if (storeduser == null) {
                storeduser = { name: message.author.username, id: message.author.id };
                user = new User(storeduser);
                r.table('Users').insert(user).run(connection)
            } else user = new User(storeduser);
            //----------Functions----------\\
            function isSpam(id) {
                let user = server.fetchuser(id, message), spam = false;
                if (user == null) return false;
                let recentMSGs = user.recentMSGs;
                if (recentMSGs == undefined) recentMSGs = [];
                //---Remove Old MSG Entries---\\
                if (recentMSGs.length > 0)
                    for (let i = recentMSGs.length - 1; i >= 0; i--) if (Date.now() - recentMSGs[i].time >= 5000) recentMSGs.splice(i, 1);
                //---Spam Detection---\\
                if (recentMSGs.length >= server.AutoMod.spamSensetivity) spam = true;
                //---KeySpam Detection---\\
                if (server.AutoMod.antiKeyspam) {
                    let text = {};
                    for (let i = 0; i < message.content.length; i++) if (text[message.content[i].toLowerCase()] == undefined) text[message.content[i].toLowerCase()] = 1; else text[message.content[i]]++;
                    for (let i in text) if (text[i] / message.content.length >= server.AutoMod.keyspamPrecent) {
                        if (server.AutoMod.VerbalWarnKeySpam) message.channel.send('Please avoid keyspamming.')
                        spam = true;
                        break;
                    }
                };
                //---Caps Detection---\\
                if (server.AutoMod.capsDetection) {
                    let diff = 0
                    for (let i = 0; i < message.content.length; i++) if (message.content[i].toLowerCase() !== message.content[i]) diff++
                    if (diff / message.content.length >= server.AutoMod.capsPercent) {
                        if (server.AutoMod.VerbalWarnCaps)
                            spam = true;
                    }
                };
                server.update()
                return spam;
            };
            function warn(id, punisher, reason) {
                let luser = server.fetchuser(id, message)
                if (luser == undefined) return null;
                if (luser.Admin) return 'Admin';
                if (luser.History == undefined) luser.History = [];
                luser.History.push({
                    caseid: `${message.author.id}${luser.History.length}`,
                    punisher: punisher,
                    type: 'Warning',
                    time: Date.now(),
                    reason: reason
                })
                server.update()
            };
            async function mute(id, punisher, reason, duration) {
                let luser = server.fetchuser(id, message, true)
                if (luser == undefined) return null;
                if (luser.Admin) return 'Admin';
                //---Record Event to History---\\
                if (message.guild.members.get(id).roles.find(val => val.name == 'Muted') !== null) return 'Already Had';
                if (luser.History == undefined) luser.History = [];
                luser.History.push({
                    caseid: `${message.author.id}${luser.History.length}`,
                    punisher: punisher,
                    type: 'Mute',
                    time: Date.now(),
                    reason: reason,
                    duration: duration
                });
                r.table('timedEvents').get('Mutes').run(connection, (err, mutes) => {
                    mutes.Array.push({
                        caseid: `${message.author.id}${luser.History.length}`,
                        punisher: punisher,
                        type: 'Mute',
                        time: Date.now(),
                        reason: reason,
                        duration: duration,
                        guild: message.guild.id,
                        id: id
                    })
                    r.table('timedEvents').get('Mutes').update({ Array: mutes.Array }).run(connection)
                });
                server.update()
                //---Mute User---\\
                let role = message.guild.roles.find(val => val.name == 'Muted')
                if (role == null) await message.guild.createRole({ name: 'Muted' });
                message.guild.members.get(id).addRole(message.guild.roles.find(val => val.name == 'Muted'));
                return true;
            };
            function ErrorManager(err) {
                message.channel.send('Sorry, but it seems an error occured. This has been reported to TheDeafCreeper, and will be fixed in the future.\nUntil then, if you want to go to the official discord at https://discord.gg/Tfxq7Uv, create a ticket and explain what you were doing, that would be quite helpful in fixing the error!');
                console.log(err)
            }
            //----------Main----------\\

            //---Auto Moderation---\\
            let luser = server.fetchuser(message.author.id, message);
            if (luser.recentMSGs[luser.recentMSGs.length - 1] != undefined)
                if (Date.now() - luser.recentMSGs[luser.recentMSGs.length - 1].time > 15000) luser.Stage = 0
            luser.recentMSGs.push({ content: message.content, time: Date.now(), id: message.id });
            if (isSpam(message.author.id) && !luser.Admin) {
                switch (luser.Stage) {
                    case 3:
                        if (!server.AutoMod.AlertMode) message.channel.send(`${message.author.username}, Please reduce your chat footprint or action will be taken.`);
                        else mute('UtilBot AutoMod', 'Many messages sent in rapid succession.', 10);
                        break;
                    case 6:
                        if (!server.AutoMod.AlertMode) {
                            warn('UtilBot AutoMod', 'Many messages sent in rapid succession.');
                            message.channel.send(`${message.author.username}, You have been automatically warned for spam; If you feel this is incorrect contact a moderator.`);
                        }
                        else mute('UtilBot AutoMod', 'Many messages sent in rapid succession.', 10);
                        break;
                    case 8: mute('UtilBot AutoMod', 'Many messages sent in rapid succession.', 10);
                        message.channel.send(`${message.author.username}, You have been automatically Muted for spam; If you feel this is incorrect contact a moderator.`); break;
                };
                luser.Stage++
            };
            server.update()

            //---Commands---\\
            let pre = server.prefix
            if (!message.content.startsWith(pre)) return;
            let args = message.content.slice(pre.length).trim().split(" ");
            let cmd = args.shift().toLowerCase(), CMD;
            console.log(`${message.author.username} ran ${cmd} in ${message.guild.name}`);
            class Help {
                constructor() { this.admin = false; };
                run() {
                    message.channel.send('Here you go!\nhttps://sites.google.com/view/utilbot/help')
                }
            };
            class Announce {
                constructor() { this.admin = true; };
                run() {
                    if (this.admin && !server.fetchuser(message.author.id).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                    let channel = server.settings.announceChannel, title = [], body = [], isTitle = false, isMessage = false, delayed = false;
                    if (channel == null) { message.channel.send(`There is no announcement channel set! Do ${pre}announcechannel to set one!`); return; }
                    for (let i = 0; i < args.length; i++) {
                        if (args[i].toLowerCase().startsWith('m:')) { args[i].trim(); isMessage = true; isTitle = false; };
                        if (args[i].toLowerCase().startsWith('t:')) { args[i].trim(); isTitle = true; isMessage = false; };
                        if (isMessage) body.push(args[i]);
                        if (isTitle) title.push(args[i]);
                        if (args[i].toLowerCase().endsWith('s') || args[i].toLowerCase().endsWith('m') ||
                            args[i].toLowerCase().endsWith('h') || args[i].toLowerCase().endsWith('d')) {
                            let word = args[i].split('');
                            let multi = word.pop().toLowerCase();
                            let s = multi;
                            if (multi == 's') multi = 1000;
                            if (multi == 'm') multi = 60000;
                            if (multi == 'h') multi = 3600000;
                            if (multi == 'd') multi = 86400000;
                            let time = word.join(''), delay = 0;
                            if (!isNaN(time * 1)) delay = Date.now() + (time * multi);
                            if (delay != 0) {
                                delayed = true;
                                isTitle = false;
                                isMessage = false;
                                r.table('plannedAnnouncements').insert({ guild: message.guild.id, time: delay }).run(connection);
                                if (body.join(' ').endsWith(`${time}${s}`)) body.pop();
                                if (title.join(' ').endsWith(`${time}${s}`)) title.pop();
                                server.plannedAnnouncements.push({ title: title.join(' ').slice(2), content: body.join(' ').slice(2), time: delay });
                                server.update();
                                message.channel.send('Announcement schedualed.')
                                break;
                            };
                        };
                    };
                    if (delayed) return;
                    embed.setTitle(title.join(' ').slice(2))
                    embed.setDescription(body.join(' ').slice(2))
                    message.channel.send(embed)
                };
            };
            class HaveIBeenPwned {
                constructor() { this.admin = false; };

                async run() {
                    let data = await hibp.search(args.join(' ').trim())
                    if (data.breaches || data.pastes) {
                        embed.setTitle('Oh no, you\'ve been pwned!')
                        for (let i = 0; i < data.breaches.length && i < 25; i++) {
                            let breach = data.breaches[i]
                            let desc = breach.Description
                            if (desc.length > 900) desc = 'The Desctiption was to long to fit here.'
                            embed.addField(`${breach.Title} (${breach.Domain})`, `Date: ${breach.BreachDate}\nPwned Count: ${breach.PwnCount} users.\nDesc:${desc}`)
                        }
                        message.channel.send(embed)
                    } else {
                        message.channel.send('Good news, you haven\'t been pwned!')
                    }
                }
            };
            class Announcechannel {
                constructor() { this.admin = true; };
                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; };
                        if (!message.mentions.channels.first()) { message.channel.send(`Improper synax, you need to mention a channel!`); return; };
                        let channel = message.mentions.channels.first();
                        server.settings.announceChannel = channel.id;
                        server.update();
                        message.channel.send(`Updated the announcement channel to <#${channel.id}>.`);
                    } catch (err) { ErrorManager(err); };
                };
            };
            class Prefix {
                constructor() { this.admin = true; };
                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        let prefix = args.join(' ')
                        if (prefix == undefined || prefix == '') message.channel.send('Invalid Prefix!');
                        else { server.prefix = prefix; server.update(); message.channel.send(`Updated the server's prefix to ${prefix}`) };
                    } catch (err) { ErrorManager(err); };
                };
            };
            class AutoRole {
                constructor() { this.admin = true; };
                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        let option = args[0], role = message.mentions.roles.first();
                        switch (option.toLowerCase()) {
                            case 'add': this.add(role); break;
                            case 'remove': this.remove(role); break;
                            case 'list': this.list(); break;
                            default: message.channel.send('Invalid choice, please do add, remove, or list.');
                        };
                    } catch (err) {
                        ErrorManager(err)
                    }
                };
                add(role) {
                    let roles = server.autoroles;
                    if (role == undefined) { message.channel.send('Invalid role! Make sure you enabled mentioning for that role (You only need it for a sec)!'); return; };
                    if (roles.indexOf(role.id) !== -1) { message.channel.send('This is already an auto role, no need to add it!'); return; };
                    roles.push(role.id);
                    server.update();
                    message.channel.send(`Added ${role.name} as an auto role.`);
                };
                remove(role) {
                    let roles = server.autoroles;
                    if (role == undefined) { message.channel.send('Invalid role! Make sure you enabled mentioning for that role (You only need it for a sec)!'); return; };
                    if (roles.indexOf(role.id) == -1) { message.channel.send('This is not an auto role, no need to remove it!'); return; };
                    roles.splice(roles.indexOf(role.id), 1);
                    server.update();
                    message.channel.send(`Removed ${role.name} from the auto roles.`);
                };
                list() {
                    let roles = server.autoroles, text = ''
                    for (let i = 0; i < roles.length; i++)
                        if (bot.roles.get(roles[i]) == undefined || bot.roles.get(roles[i]) == null) text += `Deleted Role\n`;
                        else text += `${bot.roles.get(roles[i]).name}\n`;
                    embed.setTitle(`All Auto Roles in ${message.guild.name}`);
                    embed.setDescription(text)
                    message.channel.send(embed)
                };
            };
            class AutoMod {
                constructor() { this.admin = true; };

                async run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        let text = ''
                        embed.setTitle(`${message.guild.name} Auto Moderation Control Panel.`);
                        embed.setDescription(`To select a section, use the reactions below (once they all appear).`);
                        if (server.AutoMod.enabled) {
                            text += `Enabled: ${server.AutoMod.enabled} | Sensetivity: ${server.AutoMod.spamSensetivity}\n`;
                            if (server.AutoMod.antiKeyspam) text += `KeySpam Detection: ${server.AutoMod.antiKeyspam} | Sensetivity: ${server.AutoMod.keyspamPrecent}\n`;
                            else text += `KeySpam Detection: ${server.AutoMod.antiKeyspam}\n`;

                            if (server.AutoMod.capsDetection) text += `Caps Detection: ${server.AutoMod.capsDetection} | Sensetivity: ${server.AutoMod.capsPercent}\n`;
                            else text += `Caps Detection: ${server.AutoMod.capsDetection}\n`;
                        } else text += `Enabled: ${server.AutoMod.enabled}\n`;
                        embed.addField(`Current Settings`, text);
                        embed.setFooter(`A: Toggle AutoMod | B: Change AM Sensetivity | C: Toggle AntiKeyspam | D: Change KS % | E: ToggleAntiCaps | F: Change Caps %`)
                        let msg = await message.channel.send(embed);
                        let reactions = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫']
                        for (let i = 0; i < 6; i++) {
                            if (!msg.deleted) await msg.react(reactions[i]);
                            else break;
                        }
                        msg.awaitReactions((reaction, user) => {
                            if (user.id === message.author.id) {
                                switch (reaction.emoji.name) {
                                    case '🇦':
                                        this.ToggleAutoMod()
                                        break;
                                    case '🇧':
                                        this.ChangeAutoMod()
                                        break;
                                    case '🇨':
                                        this.ToggleKeySpam()
                                        break;
                                    case '🇩':
                                        this.ChangeKeySpam()
                                        break;
                                    case '🇪':
                                        this.ToggleCaps()
                                        break;
                                    case '🇫':
                                        this.ChangeCaps()
                                        break;
                                    default: return false;
                                }
                                msg.delete()
                                return true;
                            } else return false;
                        }, { max: 1 })

                    } catch (err) { ErrorManager(err) };
                }
                async ToggleAutoMod() {
                    let automod = server.AutoMod
                    automod.enabled = !automod.enabled
                    r.table('Servers').get(message.guild.id).update({ AutoMod: automod }).run(connection)
                    if (automod.enabled) message.channel.send(`Auto Moderation is now enabled.`)
                    else message.channel.send(`Auto Moderation is now disabled.`)
                }
                async ChangeAutoMod() {
                    let msgs = await message.channel.send('Please type a number (Higher = less sensetive) or "cancel".')
                    msgs.channel.awaitMessages((msg) => {
                        if (msg.author.id == message.author.id) {
                            msgs.delete()
                            let num = Number(msg.content)
                            if (msg.content.toLowerCase().trim() == 'cancel') { message.channel.send('Canceled.'); return true; }
                            if (isNaN(num)) { message.channel.send('Invalid Number.'); this.ChangeAutoMod(); return true; }
                            server.AutoMod.spamSensetivity = num
                            let autoMod = server.AutoMod
                            message.channel.send(`Updated the sensetivity to ${num}`);
                            r.table('Servers').get(message.guild.id).update({ AutoMod: autoMod }).run(connection)
                            return true;
                        } else return false;
                    }, { max: 1 })
                }
                async ToggleKeySpam() {
                    let automod = server.AutoMod
                    automod.antiKeyspam = !automod.antiKeyspam
                    r.table('Servers').get(message.guild.id).update({ AutoMod: automod }).run(connection)
                    if (automod.antiKeyspam) message.channel.send(`KeySpam Detection is now enabled.`)
                    else message.channel.send(`KeySpam Detection is now disabled.`)
                }
                async ChangeKeySpam() {
                    let msgs = await message.channel.send('Please type a number between 1 and 100 (This is what % of a message a letter needs to take up.) or "cancel".')
                    msgs.channel.awaitMessages((msg) => {
                        if (msg.author.id == message.author.id) {
                            msgs.delete()
                            let num = Number(msg.content)
                            if (msg.content.toLowerCase().trim() == 'cancel') { message.channel.send('Canceled.'); return true; }
                            if (isNaN(num)) { message.channel.send('Invalid Number.'); this.ChangeKeySpam(); return true; }
                            if (num < 1 || num > 100) { message.channel.send('Invalid Number.'); this.ChangeKeySpam(); return true; }
                            server.AutoMod.keyspamPrecent = num / 100
                            let autoMod = server.AutoMod
                            message.channel.send(`Updated the percentage to ${num}%`);
                            r.table('Servers').get(message.guild.id).update({ AutoMod: autoMod }).run(connection)
                            return true;
                        } else return false;
                    }, { max: 1 })
                }
                async ToggleCaps() {
                    let automod = server.AutoMod
                    automod.capsDetection = !automod.capsDetection
                    r.table('Servers').get(message.guild.id).update({ AutoMod: automod }).run(connection)
                    if (automod.capsDetection) message.channel.send(`Caps Detection is now enabled.`)
                    else message.channel.send(`Caps Detection is now disabled.`)
                }
                async ChangeCaps() {
                    let msgs = await message.channel.send('Please type a number between 1 and 100 (This is what % of a message a letter needs to take up.) or "cancel".')
                    msgs.channel.awaitMessages((msg) => {
                        if (msg.author.id == message.author.id) {
                            msgs.delete()
                            let num = Number(msg.content)
                            if (msg.content.toLowerCase().trim() == 'cancel') { message.channel.send('Canceled.'); return true; }
                            if (isNaN(num)) { message.channel.send('Invalid Number.'); this.ChangeCaps(); return true; }
                            if (num < 1 || num > 100) { message.channel.send('Invalid Number.'); this.ChangeCaps(); return true; }
                            server.AutoMod.capsPercent = num / 100
                            let autoMod = server.AutoMod
                            message.channel.send(`Updated the percentage to ${num}%`);
                            r.table('Servers').get(message.guild.id).update({ AutoMod: autoMod }).run(connection)
                            return true;
                        } else return false;
                    }, { max: 1 })
                }
            };
            class ModLog {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; };
                        let channel = message.mentions.channels.first();
                        if (!channel) { message.channel.send('Please mention a channel!'); return; };
                        let settings = server.settings;
                        settings.modLog = channel.id;
                        r.table('Servers').get(message.guild.id).update({ settings: settings }).run(connection);
                        message.channel.send(`The modlog is now <#${channel.id}>`);
                    } catch (err) { ErrorManager(err) };
                }
            };
            class WelcomeChannel {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; };
                        let channel = message.mentions.channels.first();
                        if (!channel) { message.channel.send('Please mention a channel!'); return; };
                        let settings = server.settings;
                        settings.welcomeChannel = channel.id;
                        r.table('Servers').get(message.guild.id).update({ settings: settings }).run(connection);
                        message.channel.send(`The welcome channel is now <#${channel.id}>`);
                    } catch (err) { ErrorManager(err) };
                }
            };
            class ReportChannel {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; };
                        let channel = message.mentions.channels.first();
                        if (!channel) { message.channel.send('Please mention a channel!'); return; };
                        let settings = server.settings;
                        settings.reportChannel = channel.id;
                        r.table('Servers').get(message.guild.id).update({ settings: settings }).run(connection);
                        message.channel.send(`The report channel is now <#${channel.id}>`);
                    } catch (err) { ErrorManager(err) };
                }
            };
            class WelcomeMessage {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        if (args[0] == undefined) { message.channel.send('Invalid message!'); return; }
                        let msg = args.join(' ');
                        message.channel.send(`The welcome message is now ${msg}`)
                        let settings = server.settings
                        settings.welcomeMessage = msg
                        r.table('Servers').get(message.guild.id).update({ settings: settings }).run(connection)
                    } catch (err) { ErrorManager(err) };
                }
            };
            class FarewellMessage {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        if (args[0] == undefined) { message.channel.send('Invalid message!'); return; }
                        let msg = args.join(' ');
                        message.channel.send(`The farewell message is now ${msg}`)
                        let settings = server.settings
                        settings.farewellMessage = msg
                        r.table('Servers').get(message.guild.id).update({ settings: settings }).run(connection)
                    } catch (err) { ErrorManager(err) };
                }
            };
            class BanMessage {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        if (args[0] == undefined) { message.channel.send('Invalid message!'); return; }
                        let msg = args.join(' ');
                        message.channel.send(`The ban message is now ${msg}`)
                        let settings = server.settings
                        settings.banMessage = msg
                        r.table('Servers').get(message.guild.id).update({ settings: settings }).run(connection)
                    } catch (err) { ErrorManager(err) };
                }
            };
            class Warn {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        args.shift()
                        let user = message.mentions.users.first(), reason = args.join(' ');
                        if (user == undefined) { message.channel.send('Please @ a user to warn!'); return; }
                        if (reason == '' || reason == undefined) reason = 'No reason given';
                        let warntry = warn(user.id, message.author.username, reason);
                        if (warntry == null) message.channel.send(`Failed to warn ${user.username}.`);
                        else if (warntry == 'Admin') message.channel.send('I cannot warn this user as they are an admin.');
                        else message.channel.send(`${message.author.username} was warned for ${reason}.`);
                    } catch (err) { ErrorManager(err) };
                }
            };
            class UnWarn {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        let user = message.mentions.users.first()
                        if (user == undefined) { message.channel.send('You need to @ a user!'); return; }
                        let name = user.username
                        if (user.id == message.author.id) { message.channel.send('You cannot unwarn yourself!'); return; }
                        user = server.fetchuser(user.id)
                        if (user == undefined) { message.channel.send(`I could not find ${name}!`); return; }
                        let history = user.History
                        history.pop()
                        server.update()
                        message.channel.send(`${name} was successfully unwarned!`);

                    } catch (err) { ErrorManager(err) };
                }
            };
            class Mute {
                constructor() { this.admin = true; };

                async run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; };
                        let user = message.mentions.users.first();
                        if (user == undefined) { message.channel.send('Invalid User!'); return; }
                        args.shift();
                        let time = args.pop(), multiplyer;
                        let reason = args.join(' '), length;
                        if (time == undefined) { message.channel.send('Invalid duration format, dont include a space, and end with s, m, h, d, or mo (for example 10m).'); return; }
                        if (time.toLowerCase().endsWith('s')) { multiplyer = 1000; time = time.split(''); time.pop(); time = time.join(''); length = 'Second(s)'; }
                        else if (time.toLowerCase().endsWith('m')) { multiplyer = 60000; time = time.split(''); time.pop(); time = time.join(''); length = 'Minute(s)'; }
                        else if (time.toLowerCase().endsWith('h')) { multiplyer = 3600000; time = time.split(''); time.pop(); time = time.join(''); length = 'Hour(s)'; }
                        else if (time.toLowerCase().endsWith('d')) { multiplyer = 216000000; time = time.split(''); time.pop(); time = time.join(''); length = 'Day(s)'; }
                        else if (time.toLowerCase().endsWith('mo')) { multiplyer = 6480000000; time = time.split(''); time.pop(); time.pop(); time = time.join(''); length = 'Month(s)'; }
                        else { message.channel.send('Invalid duration format, dont include a space, and end with s, m, h, d, or mo (for example 10m).'); return; }
                        if (reason == '') reason = 'No Reason Given'
                        let result = await mute(user.id, message.author.id, reason, time * multiplyer);
                        switch (result) {
                            case 'Already Had':
                                message.channel.send(`${user.username} is already muted!`);
                                break;
                            case 'Admin':
                                message.channel.send(`${user.username} user is an admin, so I cannot mute them!`);
                                break;
                            case null:
                                message.channel.send(`I could not find that user!`);
                                break;
                            case true:
                                message.channel.send(`${user.username} was muted for ${time} ${length}!`);
                                break;
                            default:
                                message.channel.send(`For some reason a different message was not sent, it is likely that ${user.username} was muted.`)
                        }
                    } catch (err) { ErrorManager(err) };
                }
            };
            class UnMute {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        let user = message.mentions.users.first()
                        if (user == undefined) { message.channel.send('Please @ a user!'); return; }
                        let role = message.guild.roles.find(val => val.name == 'Muted')
                        if (role == null) { message.channel.send(`${user.username} is not currently muted.`); return; }
                        if (message.guild.members.get(message.author.id).roles.find(val => val.name == 'Muted') == null)
                            message.channel.send(`${user.username} is not currently muted.`);
                        else message.channel.send(`${user.username} was unmuted.`);
                        message.guild.members.get(message.author.id).removeRole(message.guild.roles.find(val => val.name == 'Muted'));
                    } catch (err) { ErrorManager(err) };
                }
            };
            class Kick {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        let user = message.mentions.members.first()
                        if (user == undefined) {message.channel.send('Please mention a user!'); return;}
                        user.kick()
                        message.channel.send(`${user.username} was kicked.`);
                    } catch (err) { ErrorManager(err) };
                }
            };
            class Ban {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        let user = message.mentions.members.first()
                        if (user == undefined) {message.channel.send('Please mention a user!'); return;}
                        user.ban()
                        message.channel.send(`${user.username} was banned.`);
                    } catch (err) { ErrorManager(err) };
                }
            };
            class TempBan {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                    } catch (err) { ErrorManager(err) };
                }
            };
            class SoftBan {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                    } catch (err) { ErrorManager(err) };
                }
            };
            class History {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                        let user = message.mentions.users.first()
                        if (user == undefined) { message.channel.send('You need to @ a user!'); return; }
                        let name = user.username
                        user = server.fetchuser(user.id)
                        if (user == undefined) { message.channel.send(`I could not find ${name}!`); return; }
                        let history = user.History, page = args.pop()
                        if (isNaN(page)) page = 0;
                        else page -= 1;
                        if (history == undefined) history = [];
                        for (let i = 0 + (25 * page); i < 25 + (25 * page) && i < history.length; i++) {
                            embed.addField(`Type: ${history[i].type}`, `Reason: ${history[i].reason}\nPunisher: ${bot.users.get(history[i].punisher).username}`, true)
                        }
                        embed.setTitle(`${name}'s History`)
                        message.channel.send(embed)
                    } catch (err) { ErrorManager(err) };
                }
            };
            class ModRoles {
                constructor() { this.admin = true; };

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }

                    } catch (err) { ErrorManager(err) };
                }
            };
            /*Class setup
                constructor() {this.admin = true;};

                run() {
                    try {
                        if (this.admin && !server.fetchuser(message.author.id, message).Admin) { message.channel.send('You dont have permission to run this command.'); return; }
                    } catch (err) {ErrorManager(err)};
                }
            */

            switch (cmd) {
                //Help\\
                case 'cmd': case 'cmds':
                case 'help': CMD = new Help(); CMD.run(); break;
                //Announce\\
                case 'broadcast':
                case 'announce': CMD = new Announce(); CMD.run(); break;
                //SetAnnounce\\
                case 'setannounce': case 'setannouncechannel':
                case 'announcechannel': CMD = new Announcechannel(); CMD.run(); break;
                //Prefix\\
                case 'pre': case 'prefix': CMD = new Prefix(); CMD.run(); break;
                //HIBP\\
                case 'haveibeenpwned': case 'hibp': CMD = new HaveIBeenPwned(); CMD.run(); break;
                //AutoRole\\
                case 'autoroles': case 'autorole': CMD = new AutoRole(); CMD.run(); break;
                //AutoMod\\
                case 'automod': case 'automoderation': CMD = new AutoMod(); CMD.run(); break;
                //modLog\\
                case 'modlog': CMD = new ModLog(); CMD.run(); break;
                //welcomeChannel\\
                case 'welcomechannel': CMD = new WelcomeChannel(); CMD.run(); break;
                //reportChannel\\
                case 'reportchannel': CMD = new ReportChannel(); CMD.run(); break;
                //welcomemessage\\
                case 'joinmessage': case 'welcomemessage': CMD = new WelcomeMessage(); CMD.run(); break;
                //farewellmessage\\
                case 'leavemessage': case 'farewellmessage': CMD = new FarewellMessage(); CMD.run(); break;
                //BanMessage\\
                case 'banmessage': CMD = new BanMessage(); CMD.run(); break;
                //Warn\\
                case 'warn': CMD = new Warn(); CMD.run(); break;
                //Unwarn\\
                case 'unwarn': CMD = new UnWarn(); CMD.run(); break;
                //Mute\\
                case 'mute': CMD = new Mute(); CMD.run(); break;
                //UnMute\\
                case 'unmute': CMD = new UnMute(); CMD.run(); break;
                //Kick\\
                case 'kick': CMD = new Kick(); CMD.run(); break;
                //Ban\\
                case 'ban': CMD = new Ban(); CMD.run(); break;
                //Tempban\\
                case 'tempban': CMD = new TempBan(); CMD.run(); break;
                //SoftBan\\
                case 'softban': CMD = new SoftBan(); CMD.run(); break;
                //History\\
                case 'history': CMD = new History(); CMD.run(); break;
                //Admin\\
                case 'roles': CMD = new ModRoles(); CMD.run(); break;
            };
        });
        //Channel Stuff\\
        bot.on('channelCreate', async (channel) => {
            let storedserver = await r.table('Servers').get(message.guild.id).run(connection), server;
            if (storedserver == null) {
                storedserver = { name: message.guild.name, id: message.guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection)
            } else server = new Server(storedserver);
            if (bot.channels.get(server.settings.modLog) == undefined || bot.channels.get(server.settings.modLog) == null) return;

            let embed = new Discord.RichEmbed()
            embed.setColor(goodColor)
            embed.setTitle('Channel Created')
            embed.setDescription(`<#${channel.id}> (${channel.name}) was created.`)
            embed.setFooter(channel.id)

        });
        bot.on('channelDelete', async (channel) => {
            let storedserver = await r.table('Servers').get(message.guild.id).run(connection), server;
            if (storedserver == null) {
                storedserver = { name: message.guild.name, id: message.guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection)
            } else server = new Server(storedserver);
            if (bot.channels.get(server.settings.modLog) == undefined || bot.channels.get(server.settings.modLog) == null) return;

            let embed = new Discord.RichEmbed()
            embed.setColor(badColor)
            embed.setTitle('Channel Deleted')
            embed.setDescription(`#${channel.name} was deleted.`)
            embed.setFooter(channel.id)
        });
        bot.on('channelUpdate', async (channelOld, channelNew) => {
            let storedserver = await r.table('Servers').get(channelOld.guild.id).run(connection), server;
            if (storedserver == null) {
                storedserver = { name: channelOld.guild.name, id: channelOld.guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection)
            } else server = new Server(storedserver);
            if (bot.channels.get(server.settings.modLog) == undefined || bot.channels.get(server.settings.modLog) == null) return;

            let embed = new Discord.RichEmbed()
            embed.setColor(neutralColor)
            embed.setTitle('Channel Created')
            embed.setDescription(`<#${channelOld.id}> (${channelOld.name}) was updated.`)
            embed.setFooter(channelOld.id)
        });
        //Bans\\
        bot.on('guildBanAdd', async (guild, member) => {
            let storedserver = await r.table('Servers').get(guild.id).run(connection);
            let server = new Server(storedserver)
            if (bot.channels.get(server.settings.welcomeChannel) == undefined) return;
            let channel = bot.channels.get(server.settings.welcomeChannel);
            let message = server.settings.banMessage
            while (message.indexOf('{@user}') != -1 || message.indexOf('{user}') != -1 || message.indexOf('{server}') != -1) {
                message = message.replace('{@user}', `<@!${member.id}>`);
                message = message.replace('{user}', member.username);
                message = message.replace('{server}', guild.name);
            }
            channel.send(message)
            //--ModLog--\\
            if (bot.channels.get(server.settings.modLog) == undefined || bot.channels.get(server.settings.modLog) == null) return;

            let embed = new Discord.RichEmbed()
            embed.setColor(badColor)
            embed.setTitle(`${member} was banned.`)
            embed.setDescription(`<#${channel.id}> (${channel.name}) was created.`)
            embed.setFooter(channel.id)
        });
        bot.on('guildBanRemove', async (guild, member) => {
            //--ModLog--\\
            let storedserver = await r.table('Servers').get(guild.id).run(connection), server;
            if (storedserver == null) {
                storedserver = { name: guild.name, id: guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection)
            } else server = new Server(storedserver);
            if (server.settings.modLog == undefined) return;
        });
        //Members Joining/Leaving\\
        bot.on('guildMemberAdd', async member => {
            let storedserver = await r.table('Servers').get(member.guild.id).run(connection);
            let server = new Server(storedserver)
            if (bot.channels.get(server.settings.welcomeChannel) == undefined) return;
            let channel = bot.channels.get(server.settings.welcomeChannel);
            let message = server.settings.welcomeMessage
            while (message.indexOf('{@user}') != -1 || message.indexOf('{user}') != -1 || message.indexOf('{server}') != -1) {
                message = message.replace('{@user}', `<@!${member.id}>`);
                message = message.replace('{user}', member.user.username);
                message = message.replace('{server}', member.guild.name);
            }

            channel.send(message)
            //--ModLog--\\
            if (server.settings.modLog == undefined) return;
        });
        bot.on('guildMemberRemove', async (member) => {
            let storedserver = await r.table('Servers').get(member.guild.id).run(connection);
            let server = new Server(storedserver)
            if (bot.channels.get(server.settings.welcomeChannel) == undefined) return;
            let bans = await member.guild.fetchBans()
            if (bans.has(member.user.id)) return;
            let channel = bot.channels.get(server.settings.welcomeChannel);
            let message = server.settings.farewellMessage
            while (message.indexOf('{@user}') != -1 || message.indexOf('{user}') != -1 || message.indexOf('{server}') != -1) {
                message = message.replace('{@user}', `<@!${member.id}>`);
                message = message.replace('{user}', member.user.username);
                message = message.replace('{server}', member.guild.name);
            }

            channel.send(message)
            //--ModLog--\\
            if (server.settings.modLog == undefined) return;
        });
        //Message Deletion Stuff\\
        bot.on('messageDelete', async (message) => {
            //--ModLog--\\
            let storedserver = await r.table('Servers').get(message.guild.id).run(connection), server;
            if (storedserver == null) {
                storedserver = { name: message.guild.name, id: message.guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection)
            } else server = new Server(storedserver);
            if (server.settings.modLog == undefined) return;
        });
        bot.on('messageDeleteBulk', async (messages) => {
            //--ModLog--\\
            let storedserver = await r.table('Servers').get(messages.first().guild.id).run(connection), server;
            if (storedserver == null) {
                storedserver = { name: messages.first().guild.name, id: messages.first().guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection)
            } else server = new Server(storedserver);
            if (server.settings.modLog == undefined) return;
        });
        //Role Stuff\\
        bot.on('roleCreate', async (role) => {
            //--ModLog--\\
            let storedserver = await r.table('Servers').get(role.guild.id).run(connection), server;
            if (storedserver == null) {
                storedserver = { name: role.guild.name, id: role.guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection)
            } else server = new Server(storedserver);
            if (server.settings.modLog == undefined) return;
            else {
                let embed = new Discord.RichEmbed();
                embed.setTitle('A role was created');
                embed.setDescription(`${role.name} was created.`);
                embed.setColor(goodColor)
                bot.channels.get(server.settings.modLog).send(embed);
            };
        });
        bot.on('roleDelete', async (role) => {
            //--ModLog--\\
            let storedserver = await r.table('Servers').get(role.guild.id).run(connection), server;
            if (storedserver == null) {
                storedserver = { name: message.guild.name, id: message.guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection)
            } else server = new Server(storedserver);
            if (server.settings.modLog == undefined) return;
            else {
                let embed = new Discord.RichEmbed();
                embed.setTitle('A role was deleted');
                embed.setColor(badColor)
                embed.description(`${role.name} was deleted.`)
                bot.channels.get(server.settings.modLog).send(embed);
            };
        });
        bot.on('roleUpdate', async (roleOld, roleNew) => {
            //--ModLog--\\
            let storedserver = await r.table('Servers').get(roleOld.guild.id).run(connection), server;
            if (storedserver == null) {
                storedserver = { name: message.guild.name, id: message.guild.id };
                server = new Server(storedserver);
                r.table('Servers').insert(server).run(connection);
            } else server = new Server(storedserver);
            if (server.settings.modLog == undefined) return;
            else {
                let embed = new Discord.RichEmbed(), different = [];
                embed.setTitle('A role was updated');
                embed.setDescription('Updated Settings:');
                embed.setColor(neutralColor)
                for (var i in roleOld)
                    if (roleOld[i] !== roleNew[i]) different.push({item: i, oldval: roleOld[i], newval: roleNew[i]});
                for (let i = 0; i < different.length && i < 25; i++)
                    embed.addField(different[i].item, `${different[i].oldval} >>> ${different[i].newval}`)
                if (different.length >= 25) embed.setFooter(`+ ${different-24} more.`)
                bot.channels.get(server.settings.modLog).send(embed);
            };
        });

        bot.setInterval(() => {
            r.table('timedEvents').get('Mutes').run(connection, async (err, mutes) => {
                for (let i = 0; i < mutes.Array.length; i++) {
                    if (mutes.Array[i].time + mutes.Array[i].duration > Date.now()) continue;
                    let mute = mutes.Array[i];
                    mutes.Array.splice(i, 1); i--;
                    let guild = bot.guilds.get(mute.guild);
                    if (guild == undefined) return;
                    let member = guild.members.get(mute.id);
                    if (member == undefined) return;
                    let roles = member.roles;
                    if (roles.find(val => val.name == 'Muted') == null) return;
                    member.removeRole(roles.find(val => val.name == 'Muted'));
                }
                r.table('timedEvents').get('Mutes').update({ Array: mutes.Array }).run(connection)
            })
            r.table('timedEvents').get('Announcements').run(connection, async (err, announcements) => {
                if (announcements == null) announcements = [];
                for (let i = 0; i < announcements.length; i++) {

                }
            })
        }, 5000);
    })
});