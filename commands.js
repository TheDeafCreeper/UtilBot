const Discord = require('discord.js')
exports.run = (bot, message, args, r, connection, cmd, pre) => {
    let owners = ['213396745231532032']
    var embed = new Discord.RichEmbed()
        .setColor(0x4b4303)
    function find(command, commands) {
        for (let i = 0; i < commands.length; i++) {
            let found = false
            let command = new commands[i]()
            for (let l = 0; l < command.name.length; l++) {
                if (command.name[l].toLowerCase() == cmd.toLowerCase()) {
                    command.run()
                    found = true
                    break;
                }
            }
        }
    }
    r.table('Servers').get(message.guild.id).run(connection, function (err, server) {
        var commandfile = 3924
        var mainfile = 491
        const commands = [
            class help {
                constructor() {
                    this.name = ['Help', 'cmds', 'cmd']
                    this.desc = 'A basic help command'
                    this.use = `${pre}help (command/page)`
                    this.example = `${pre}help help`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (!isNaN(args[0]) || args[0] == undefined) {
                        embed.setTitle(`For more info on a command, do ${pre}help (command)! | (optional) <Required>
                            \nCommands Found: ${commands.length} | Server prefix __**${pre}**__`)
                        embed.addField(`Extra info:`, `Please keep in mind that some features (like the shop) utilize multiple commands and that some (like lists) utilize one command with multiple arguments needed.`)
                        if (args[0] == undefined) {
                            var page = 1
                        } else {
                            var page = args[0]
                        }
                        for (let i = 24 * (page - 1); i < commands.length && i < 24 * page; i++) {
                            if (commands[i] == undefined) continue;
                            let command = new commands[i]()
                            if (!command.admin) {
                                embed.addField(`__**${command.name.join(' | ')}**__`, command.desc, true)
                            } else {
                                if (command.admin && isadmin(message.author.id)) {
                                    embed.addField(`__**${command.name.join(' | ')}**__`, command.desc, true)
                                }
                            }
                        }
                        embed.setFooter(`Page ${page}/${Math.ceil(((commands.length) / 24))}`)
                        message.channel.send(embed).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(60000)
                                message.delete(5000)
                            }
                        })
                    }
                    else {
                        let found = false
                        for (let i = 0; i < commands.length; i++) {
                            let command = new commands[i]()
                            for (let l = 0; l < command.name.length; l++) {
                                if (command.name[l].toLowerCase() == args[0].toLowerCase()) {
                                    let names = command.name
                                    embed.setTitle(`Name: ${names[0]}`)
                                    names.shift()
                                    embed.setDescription(`Aliases: ${names.join(', ')}\n${command.desc}`)
                                    embed.addField(`Usage:`, command.use)
                                    embed.addField(`Example:`, command.example)
                                    found = true
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            message.channel.send('I could not find a command under this name or alias')
                        } else {
                            message.channel.send(embed).then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(30000)
                                    message.delete(5000)
                                }
                            })
                        }
                    }
                }
            },
            class prefix {
                constructor() {
                    this.name = ['Prefix', 'Pre']
                    this.desc = `**ADMIN COMMAND** Changes the server's prefix`
                    this.use = `${pre}prefix <new prefix>`
                    this.example = `${pre}prefix !?`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        if (args.length != 0) {
                            message.channel.send(`Changed the prefix from ${pre} to ${args.join(' ')}`)
                            r.table('Servers').get(message.guild.id).update({ prefix: args.join(' ') }).run(connection)
                        } else {
                            message.channel.send('Please define a prefix!')
                        }
                    } else {
                        message.channel.send(`Nice try, but you are not an admin!`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class afk {
                constructor() {
                    this.name = ['Afk']
                    this.desc = `Sets your **AFK** status.`
                    this.use = `${pre}afk (reason)`
                    this.example = `${pre}afk pool party`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        r.table('Profiles').get(message.author.id).run(connection, function (err, result) {
                            if (result.afk) {
                                message.channel.send(`Changed your **AFK** from **${result.reason}** to **${args.join(' ')}**`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                                if (args[0] != undefined) {
                                    r.table('Profiles').get(message.author.id).update({ reason: args.join(' ') }).run(connection)
                                }
                            } else {
                                if (args[0] != undefined) {
                                    message.channel.send(`I have set your **AFK** status ${message.author.username}! Reason: **${args.join(' ')}**`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                    r.table('Counters').get('AFK Count').run(connection, function (err, count) {
                                        r.table('Counters').get('AFK Count').update({ count: count.count + 1 }).run(connection)
                                    })
                                    r.table('Profiles').get(message.author.id).update({ reason: args.join(' ') }).run(connection)
                                } else {
                                    message.channel.send(`I have set your **AFK** status ${message.author.username}! Reason: **AFK**`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                                r.table('Profiles').get(message.author.id).update({ afk: true }).run(connection)
                            }
                        })
                    } else {
                        message.channel.send('This command is currently under maintinance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class list {
                constructor() {
                    this.name = ['List']
                    this.desc = `Interact with server lists.`
                    this.use = `${pre}list create <title>
                              \n${pre}list add <title> <text>
                              \n${pre}list remove <title> <text>
                              \n${pre}list reorder <title> <item pos1> <item pos2>
                              \n${pre}list view <title>
                              \n${pre}list toggleadmin <title>
                              \n${pre}list edit <spot#> <new text>`
                    this.example = `${pre}list create ToDo`
                    this.online = true
                    this.admin = false
                }
                run() {
                    let options = ['create', 'delete', 'add', 'remove', 'view', 'toggleadmin', 'reorder', 'edit']
                    let choice, name;
                    if (args[0] != undefined) {
                        choice = args[0].toLowerCase()
                    } else {
                        choice = ''
                    }
                    args.shift()
                    if (args[0] != undefined) {
                        name = args[0]
                    } else {
                        name = null
                    }
                    args.shift()
                    let lists = server.lists
                    let islist = false
                    for (let i = 0; i < options.length; i++) {
                        if (choice == options[i]) {
                            var isgood = true
                            break;
                        } else {
                            var isgood = false
                        }

                    }
                    if (!isgood) {
                        message.channel.send(`This is not a viable option, please do one of the following:\n${options.join(', ')}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        for (let i = 0; i < lists.length; i++) {
                            if (name == lists[i].name) {
                                islist = true
                                if (lists[i].level == 'Admin') {
                                    if (!isadmin(message.author.id)) {
                                        message.channel.send('Sorry, but you do no have permission to interact with this list.').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    }
                                } else {
                                    let listcmd = new commands[3]()
                                    try {
                                        listcmd[choice](name)
                                    } catch (err) {
                                        console.error(err)
                                    }
                                    break;
                                }
                            }
                        }
                        if (!islist && choice == 'create') {
                            let listcmd = new commands[3]()
                            listcmd.create(name)
                        }
                        if (!islist && choice == 'delete') {
                            let listcmd = new commands[3]()
                            listcmd.delete(name)
                        }
                    }
                }
                create(name) {
                    let lists = server.lists
                    let islist = false
                    for (let i = 0; i < lists.length; i++) {
                        if (lists[i].name == name) {
                            message.channel.send('This list already exists!')
                            islist = true
                        }
                    }
                    if (!islist) {
                        lists.push({ name: name, list: [], level: 'User' })
                        message.channel.send(`Created the list **${name}**`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                        r.table('Servers').get(message.guild.id).update({ lists: lists }).run(connection)
                    }
                }
                delete(name) {
                    let lists = server.lists
                    let islist = false
                    for (let i = 0; i < lists.length; i++) {
                        if (lists[i].name == name) {
                            message.channel.send(`Deleted the list **${name}**`)
                            lists.splice(i, 1)
                            islist = true
                            r.table('Servers').get(message.guild.id).update({ lists: lists }).run(connection)
                            break;
                        }
                    }
                    if (!islist) {
                        message.channel.send('Could not find that list! (Lists are case sensitive!)').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                add(name) {
                    let lists = server.lists
                    let islist = false
                    for (let i = 0; i < lists.length; i++) {
                        if (lists[i].name == name) {
                            islist = true
                            if (lists[i].list.length == 0) {
                                message.channel.send(`Added **${args.join(' ')}** to the list ${name}`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                                lists[i].list.push(args.join(' '))
                                islist = true
                                r.table('Servers').get(message.guild.id).update({ lists: lists }).run(connection)
                            } else {
                                for (let l = 0; l < lists[i].list.length; l++) {
                                    if (args.join(' ') == lists[i].list[l]) {
                                        message.channel.send('This is already on the list!').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    } else if (args.length == 0) {
                                        message.channel.send('Please include something to add to the list').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    } else {
                                        message.channel.send(`Added **${args.join(' ')}** to the list **${name}**`).then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                        lists[i].list.push(args.join(' '))
                                        islist = true
                                        r.table('Servers').get(message.guild.id).update({ lists: lists }).run(connection)
                                        break;
                                    }
                                }
                            }
                            break;
                        }

                    }
                    if (!islist) {
                        message.channel.send('Could not find that list! (Lists are case sensitive!)').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                view(name) {
                    let lists = server.lists
                    let islist = false
                    let page
                    if (args[0] != undefined && !isNaN(args[0])) {
                        page = args[0]
                    } else {
                        page = 1
                    }
                    for (let i = 0; i < lists.length; i++) {
                        let responses = [
                            'This list is empty',
                            'This is not the list you are looking for...',
                            'Error 404, items not found',
                            `*cough* | ${pre}list add ${name} items`
                        ]
                        if (lists[i].name == name) {
                            islist = true
                            if (lists[i].list[0] == undefined) {
                                message.channel.send(responses[Math.round(Math.random() * responses.length)]).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            } else {
                                for (let l = 6 * (page - 1); l < lists[i].list.length && l < 6 * page; l++) {
                                    embed.addField(`**${l + 1})**`, `**${lists[i].list[l]}**`)
                                }
                                embed.setTitle(`Items in **${lists[i].name}**. Items found *(${lists[i].list.length})*`)
                                embed.setFooter(`Page ${page}/${Math.ceil(((lists[i].list.length) / 6))}`)
                                message.channel.send(embed).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(10000)
                                        message.delete(5000)
                                    }
                                })
                            }
                            break;
                        }
                    }
                    if (!islist) {
                        message.channel.send('Could not find that list! (Lists are case sensitive!)').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                remove(name) {
                    let lists = server.lists
                    let islist = false
                    let onlist = false
                    for (let i = 0; i < lists.length; i++) {
                        if (lists[i].name == name) {
                            islist = true
                            for (let l = 0; l < lists[i].list.length; l++) {
                                if (args.join(' ') == lists[i].list[l]) {
                                    onlist = true
                                    lists[i].list.splice(l, 1)
                                    message.channel.send(`Removed **${args.join(' ')}** from the list ${name}`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                    r.table('Servers').get(message.guild.id).update({ lists: lists }).run(connection)
                                    break;
                                } else if (args == undefined) {
                                    message.channel.send('Please include something to remove from the list').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                            }
                            break;
                        }
                    }
                    if (!islist) {
                        message.channel.send('Could not find that list! (Lists are case sensitive!)').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                    if (!onlist && islist) {
                        message.channel.send(`Could not find that item on the list **${name}**! List names and items are case senstitive!`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                toggleadmin(name) {
                    let lists = server.lists
                    let islist = false
                    for (let i = 0; i < lists.length; i++) {
                        if (lists[i].name == name) {
                            let list = lists[i]
                            if (list.level == 'User') {
                                if (isadmin(message.author.id)) {
                                    list.level = 'Admin'
                                    message.channel.send(`**${name}** is now a Admin list!`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                            } else {
                                list.level = 'User'
                                message.channel.send(`**${name}** is now a public list!`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                            r.table('Servers').get(message.guild.id).update({ lists: lists }).run(connection)
                            islist = true
                        }
                    }
                    if (!islist) {
                        message.channel.send('That is not a list!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                reorder(name) {
                    let pos1 = args[0] - 1
                    let pos2 = args[1] - 1
                    let lists = server.lists
                    let islist = false
                    for (let i = 0; i < lists.length; i++) {
                        if (lists[i].name == name) {
                            let list = lists[i]
                            if (pos1 < list.list.length && pos2 < list.list.length && !isNaN(pos1) && !isNaN(pos2)) {
                                let postext1 = list.list[pos1]
                                let postext2 = list.list[pos2]
                                list.list[pos1] = postext2
                                list.list[pos2] = postext1
                                message.channel.send(`Swapped **${postext1}** and **${postext2}**`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                                r.table('Servers').get(message.guild.id).update({ lists: lists }).run(connection)
                            } else {
                                message.channel.send(`One or more of the values you put was not in the list or a number.`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                            islist = true
                        }
                    }
                    if (!islist) {
                        message.channel.send('That is not a list!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                edit(name) {
                    let lists = server.lists
                    let islist = false
                    let location = args[0] - 1
                    for (let i = 0; i < lists.length; i++) {
                        if (lists[i].name == name) {
                            islist = true
                            let list = lists[i].list
                            if (location < list.length && !isNaN(args[0])) {
                                args.shift()
                                message.channel.send(`Changed item in spot **${location + 1}** from **${list[location]}** to **${args.join(' ')}**`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                                list[location] = args.join(' ')
                                r.table('Servers').get(message.guild.id).update({ lists: lists }).run(connection)
                            } else {
                                message.channel.send(`The item slot you put down is either not a number or not on the list.`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        }
                    }

                    if (!islist) {
                        message.channel.send('That is not a list!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })

                    }
                }
            },
            class profile {
                constructor() {
                    this.name = ['Profile', 'SeeProfile']
                    this.desc = `Shows your or someone elses Profile.`
                    this.use = `${pre}profile (@user)`
                    this.example = `${pre}profile
                                    ${pre}profile @TheDeafCreeper`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        let users;
                        if (message.mentions.users.first() != undefined) {
                            users = message.mentions.users.first().id
                        } else {
                            users = message.author.id
                        }
                        r.table('Profiles').get(users).run(connection, function (err, user) {
                            if (user == null) {
                                message.channel.send('This user does not have a profile. Get them to talk to make one!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            } else {
                                if (user.color != null && user.color != undefined) {
                                    embed.setColor(user.color)
                                }
                                embed.setImage(user.profilepic)
                                embed.setTitle(`**${user.name}'s** profile`)
                                embed.addField(`Level:`, user.level)
                                if (user.currentmultiply == 1) {
                                    embed.addField(`XP:`, `${user.xp}/${user.level ** 2}`)
                                } else {
                                    embed.addField(`XP:`, `${user.xp}/${user.level ** 2} | Booster: __**x${user.currentmultiply}**__`)
                                }
                                embed.addField(`Profile color:`, user.color)
                                if (user.currentmultiplybal == 1) {
                                    embed.addField('Balance:', user.balance)
                                } else {
                                    embed.addField('Balance:', `${user.balance} | Booster: __**x${user.currentmultiplybal}**__`)
                                }
                                if (user.afk) { embed.addField(`${user.name} is AFK!`, `Reason: ${user.reason}`) }
                                message.channel.send(embed).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(60000)
                                        message.delete(5000)
                                    }
                                })
                            }
                        })
                    } else {
                        message.channel.send('This command is currently under maintinance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class profilecolor {
                constructor() {
                    this.name = ['ProfileColor', 'PColor', 'Color']
                    this.desc = `Changes your profile color.`
                    this.use = `${pre}profilecolor <discord role color code without "#" or a preset>`
                    this.example = `${pre}profilecolor 003b0e
                                    ${pre}profilecolor red`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        if (args[0] != undefined) {
                            args[0] = args[0].toLowerCase()
                            let color
                            if (args[0] == 'red') {
                                embed.setColor(`0xff0000`)
                                color = 'ff0000'
                            } else if (args[0] == 'green') {
                                embed.setColor(`0x03bb2a`)
                                color = '03bb2a'
                            } else if (args[0] == 'blue') {
                                embed.setColor(`0x000bff`)
                                color = '000bff'
                            } else if (args[0] == 'white') {
                                embed.setColor(`0xffffff`)
                                color = 'ffffff'
                            } else if (args[0] == 'yellow') {
                                embed.setColor(`0x$ffec00`)
                                color = '$ffec00'
                            } else if (args[0] == 'black') {
                                embed.setColor(`0x000000`)
                                color = '000000'
                            } else if (args[0] == 'orange') {
                                embed.setColor(`0xffa000`)
                                color = 'ffa000'
                            } else if (args[0] == 'pink') {
                                embed.setColor(`0xe800ff`)
                                color = 'e800ff'
                            } else {
                                embed.setColor(`0x${args[0]}`)
                                color = args[0]
                            }
                            embed.setTitle('Here is your new color!')
                            r.table('Profiles').get(message.author.id).update({ color: `0x${color}` }).run(connection)
                            message.channel.send(embed)
                        } else {
                            message.channel.send('Select a color!')
                        }
                    } else {
                        message.channel.send('This command is currently under maintinance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class seen {
                constructor() {
                    this.name = ['Seen']
                    this.desc = `Shows how long it has been since the user last sent a message.`
                    this.use = `${pre}seen <@user>`
                    this.example = `${pre}seen @TheDeafCreeper`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        r.table('Profiles').get(message.mentions.users.first().id).run(connection, function (err, result) {
                            if (result != null) {
                                var seconds = Math.floor((message.createdTimestamp - result.lastsend) / 1000)
                                var minutes = Math.floor(seconds / 60)
                                var hours = Math.floor(minutes / 60)
                                var days = Math.floor(hours / 24)
                                var months = Math.floor(days / 30)
                                seconds = (seconds - (60 * minutes))
                                minutes = (minutes - (60 * hours))
                                hours = (hours - (24 * days))
                                days = (days - (30 * months)) + Math.floor(months / 2)
                                months += Math.floor(months / 61)
                                embed.addField(`${message.mentions.users.first().username} last sent a message:`, `${months}Months|${days}Days|${hours}Hours|${minutes}Minutes|${seconds}Seconds ago`)
                                message.channel.send(embed).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            } else {
                                message.channel.send('I have never seen this user talk.').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        })
                    } else {
                        message.channel.send('This command is currently under maintinance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class admin {
                constructor() {
                    this.name = ['Admin']
                    this.desc = `**ADMIN COMMAND** Adds or removes a server admin to the bot.`
                    this.use = `${pre}admin add <@user>\n ${pre}admin remove <@user>`
                    this.example = `${pre}admin add @TheDeafCreeper
                                    ${pre}admin remove @TheDeafCreeper`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (args[0] != undefined) {
                        let action = args[0].toLowerCase();
                        args.shift()
                        let d = new commands[7]();
                        let options = ['add', 'remove', 'list']
                        let found = false
                        let admin = false
                        if (server.admins.length == 0 && message.member.hasPermission('ADMINISTRATOR')) {
                            for (let i = 0; i < options.length; i++) {
                                if (options[i] == action) {
                                    d[options[i]]()
                                    found = true
                                    break;
                                }
                            }
                            if (!found) {
                                message.channel.send(`Availible commands: ${options.join(', ')}`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        } else {
                            if (isadmin(message.author.id)) {
                                for (let i = 0; i < options.length; i++) {
                                    if (options[i] == action) {
                                        d[options[i]]()
                                        found = true
                                    }
                                    if (!found) {
                                        message.channel.send(`Availible commands: ${options.join(', ')}`).then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    }
                                }
                                if (!isadmin(message.author.id)) {
                                    message.channel.send('Nice try, but you are not an admin!').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                            }
                        }
                    }
                }
                add() {
                    let admins = server.admins
                    let alreadyadmin = false
                    if (isadmin(message.mentions.users.first().id)) {
                        alreadyadmin = true
                    }
                    if (!alreadyadmin) {
                        if (message.mentions.users.first() != undefined) {
                            admins.push(message.mentions.users.first().id)
                            message.channel.send(`Added **${message.mentions.users.first().username}** as admin.`)
                            r.table('Servers').get(message.guild.id).update({ admins: admins }).run(connection)
                        } else {
                            message.channel.send('Please specify someone to add.')
                        }
                    } else {
                        message.channel.send('This user is already an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                remove() {
                    let admins = server.admins
                    for (let i = 0; i < admins.length; i++) {
                        if (admins[i] == message.mentions.users.first().id) {
                            admins.splice(i, 1)
                            r.table('Servers').get(message.guild.id).update({ admins: admins }).run(connection)
                            break;
                        }
                    }
                    if (!isadmin(message.author.id)) {
                        message.channel.send('This user is not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send(`**${message.mentions.users.first().username}** is no longer an admin`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                list() {
                    let admins = server.admins
                    embed.setTitle(`Admins on ${message.guild.name}`)
                    if (args[0] == undefined || isNaN(args[0])) {
                        var page = 1
                    } else {
                        var page = args[0]
                    }
                    for (let i = 12 * (page - 1); i < admins.length && i < 12 * page; i++) {
                        embed.addField(i + 1 + ')', bot.users.get(`${admins[i]}`).username)
                    }
                    embed.setFooter(`Page ${page}/${Math.ceil(((admins.length) / 12))}`)
                    message.channel.send(embed).then(msg => {
                        if (server.deletemessages) {
                            msg.delete(server.messagetimeout)
                            message.delete(5000)
                        }
                    })
                }
            },
            class lists {
                constructor() {
                    this.name = ['Lists']
                    this.desc = `Shows a list of all lists.`
                    this.use = `${pre}lists`
                    this.example = `${pre}lists`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        let lists = server.lists
                        let name = args[0]
                        if (args[1] == NaN || args[1] == undefined) { var page = 1 } else { page = args[1] }
                        embed.setTitle(`__**${message.guild.name}**__ lists. Lists found: **${lists.length}**`)
                        for (let l = 6 * (page - 1); l < lists.length && l < 6 * page; l++) {
                            embed.addField(`${l + 1})`, lists[l].name)
                        }
                        embed.setFooter(`Page ${page}/${Math.ceil(((lists.length) / 6))}`)
                        message.channel.send(embed).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(30000)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('This command is currently under maintinance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class status {
                constructor() {
                    this.name = ['Status', 'Uptime', 'Ping']
                    this.desc = `Shows the status of the bot`
                    this.use = `${pre}stats`
                    this.example = `${pre}status`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        r.table('Profiles').count().run(connection, function (err, number) {
                            let seconds = Math.floor(bot.uptime / 1000)
                            let minutes = Math.floor(seconds / 60)
                            let hours = Math.floor(minutes / 60)
                            let days = Math.floor(hours / 24)
                            seconds = (seconds - (60 * minutes))
                            minutes = (minutes - (60 * hours))
                            hours = (hours - (24 * days))
                            let time = `${days}Days | ${hours}Hours | ${minutes}Minutes | ${seconds}Seconds`
                            let ping = `${Math.round(bot.ping)}ms`
                            let online = 0
                            for (let i = 0; i < commands.length; i++) {
                                let command = new commands[i]()
                                if (command.online) {
                                    online++
                                }
                            }
                            let stat;
                            if (online / commands.length <= .60 && bot.ping > 130) {
                                stat = 'Wow, slow and I have quite a few commands down?'
                            } else if (bot.ping > 130) {
                                stat = 'Wow, im slow today'
                            } else if (online / commands.length <= .60) {
                                stat = 'Quite a few commands down'
                            } else {
                                stat = 'Nothing much going on'
                            }
                            let status = `${stat}`
                            embed.setTitle(status + `\nMade by TheDeafCreeper#4727`)
                            embed.setDescription(`Server prefix: **${pre}**`)
                            embed.addField('Uptime:', time)
                            embed.addField('Ping:', ping)
                            embed.addField('Server count:', bot.guilds.array().length)
                            embed.addField('Number of profiles:', number)
                            embed.addField('Lines of code:', `${commandfile + mainfile}`)
                            message.channel.send(embed).then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(15000)
                                    message.delete(5000)
                                }
                            })
                        });
                    } else {
                        message.channel.send('This command is currently under maintinance! How Ironic.').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class randomnum {
                constructor() {
                    this.name = ['RandomNumber', 'rand']
                    this.desc = `Generates a random number between 0 and X`
                    this.use = `${pre}randomnum (number)`
                    this.example = `${pre}randomnum 23`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        let num
                        if (!isNaN(args[0])) {
                            if (args[0] > 100000000) {
                                num = 100000000
                                message.channel.send('Woah there, little large, I changed it to 100,000,000').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            } else {
                                num = args[0]
                            }
                        } else {
                            num = 10
                        }
                        let rannum = Math.round(Math.random() * num) + 1
                        message.channel.send(`Your number is ${rannum}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('This command is currently under maintenance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class isnumber {
                constructor() {
                    this.name = ['Isanumber']
                    this.desc = `Tells you if an input is a number`
                    this.use = `${pre}isnumber <anything>`
                    this.example = `${pre}isnumber e21`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        if (isNaN(args[0])) {
                            message.channel.send(`**${args[0]}** is not a number`)
                        } else {
                            message.channel.send(`**${args[0]}** is a number`)
                        }
                    } else {
                        message.channel.send('This command is currently under maintenance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class invite {
                constructor() {
                    this.name = ['Invite', 'Link']
                    this.desc = `Sends you a bot invite`
                    this.use = `${pre}invite`
                    this.example = `${pre}invite`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        message.author.send(`Here's an invite! https://goo.gl/nL4qgJ`)
                        message.channel.send('Check your DMs!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('Suprisingly, This command is currently under maintenance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class purge {
                constructor() {
                    this.name = ['Purge']
                    this.desc = `**ADMIN COMMAND** Purges X commands`
                    this.use = `${pre}purge <number>`
                    this.example = `${pre}purge 23`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (this.online) {
                        let remove, name;
                        if (isadmin(message.author.id)) {
                            async function purge() {
                                if (!isNaN(args[0])) {
                                    message.delete(0).then(async function () {
                                        if (args[0] > 100) {
                                            args[0] = 100
                                        }
                                        let fetched = await message.channel.fetchMessages({ limit: args[0] })
                                        message.channel.bulkDelete(fetched)
                                            .catch(err)
                                    })
                                } else {
                                    message.channel.send(`Please specify an ammount to remove!`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                            }
                            purge()
                        } else {
                            message.channel.send('Nice try, but you are not an admin!')
                        }
                    } else {
                        message.channel.send('This command is currently under maintenance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class network {
                constructor() {
                    this.name = ['Network', 'Net']
                    this.desc = `**ADMIN COMMAND** Allows you to do things with networks. A network is just a group of servers that share announcements.`
                    this.use = `${pre}network create <name>
                              \n${pre}network add <serverid>
                              \n${pre}network remove <serverid>
                              \n${pre}network delete`
                    this.example = `${pre}network create The best`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (this.online) {
                        let choices = ['create', 'add', 'remove', 'delete', 'view', 'announceadd', 'announceremove']
                        if (args[0] == undefined) {
                            args[0] = 'none'
                        }
                        let action = args[0].toLowerCase()
                        let found = false
                        let run;
                        for (let i = 0; i < choices.length; i++) {
                            if (choices[i] == action) {
                                run = action
                                found = true
                                break;
                            }
                        }
                        if (!found) {
                            message.channel.send(`That is not a viable option, please chose one of the following:\n${choices.join(', ')}`)
                        }
                        if (isadmin(message.author.id)) {
                            if (server.network == null || run == undefined) {
                                if (run != 'create') {
                                    message.channel.send('This channel is not in a network! Create one or get a server to add you to theirs!').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                } else {
                                    this[run]()
                                }
                            } else {
                                this[run]()
                            }
                        } else {
                            message.channel.send('Nice try, but you are not an admin!')
                        }
                    } else {
                        message.channel.send('This command is currently under maintenance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                create() {
                    let id
                    r.table('Networks').get('List').run(connection, function (err, list) {
                        for (let i = 0; i < 100; i++) {
                            id = Math.floor(Math.random() * 99999999)
                            if (list.list.filter(id) == -1) {
                                break;
                            }
                        }
                    })
                    args.shift()
                    if (server.network == null) {
                        let networkobj = {
                            hub: message.guild.id,
                            name: args.join(' '),
                            admins: server.admins,
                            servers: [
                                message.guild.id
                            ],
                            id: id
                        }
                        let ulist = list.list
                        ulist.push(id)
                        message.channel.send('Created the network **' + networkobj.name + '**').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                        r.table('Networks').insert(networkobj).run(connection)
                        r.table('Networks').get('List').update({ list: ulist }).run(connection)
                        r.table('Servers').get(message.guild.id).update({ network: networkobj.id }).run(connection)
                    } else {
                        message.channel.send('The server is already in a network!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
                add() {
                    r.table('Networks').get(server.network).run(connection, function (err, network) {
                        let servers = network.servers
                        args.shift()
                        if (!isNaN(args[0]) && args[0] != undefined) {
                            r.table('Servers').get(args[0]).run(connection, function (err, gotserver) {
                                if (gotserver != null) {
                                    if (gotserver.network == null) {
                                        servers.push(args[0])
                                        message.channel.send(`Added **${gotserver.name}** to the **${network.name}** network.`).then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                        r.table('Servers').get(args[0]).update({ network: server.network }).run(connection)
                                        r.table('Networks').get(server.network).update({ servers: servers }).run(connection)
                                    } else {
                                        message.channel.send('This server is already in a network').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    }
                                } else {
                                    message.channel.send('Please put a valid server id!').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                            })
                        } else {
                            message.channel.send('Please put a server id!')
                        }

                    })
                }
                remove() {
                    r.table('Networks').get(server.network).run(connection, function (err, network) {
                        args.shift()
                        if (network != null) {
                            if (network.hub == message.guild.id) {
                                let is = false
                                if (!isNaN(args[0]) && args[0] != undefined) {
                                    let remove = args[0]
                                    if (remove != message.guild.id) {
                                        for (let i = 0; i < network.servers.length; i++) {
                                            if (remove == network.servers[i]) {
                                                let servers = network.servers
                                                r.table('Servers').get(network.servers[i]).update({ network: null }).run(connection)
                                                servers.splice(i, 1)
                                                r.table('Networks').get(server.network).update({ servers: servers }).run(connection)
                                                r.table('Servers').get(remove).run(connection, function (err, gotserver) {
                                                    message.channel.send(`Removed **${gotserver.name}** from the network.`).then(msg => {
                                                        if (server.deletemessages) {
                                                            msg.delete(server.messagetimeout)
                                                            message.delete(5000)
                                                        }
                                                    })
                                                })
                                                is = true
                                            }
                                        }
                                        if (!is) {
                                            message.channel.send('That server is not in this network!').then(msg => {
                                                if (server.deletemessages) {
                                                    msg.delete(server.messagetimeout)
                                                    message.delete(5000)
                                                }
                                            })
                                        }
                                    } else {
                                        message.channel.send('The hub can not be removed from its network!').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    }
                                } else {
                                    message.channel.send('That is not a valid server id!').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                            } else {
                                message.channel.send('This is not the hub server!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }

                        } else {
                            message.channel.send('This server is not in a network!')
                        }
                    })
                }
                delete() {
                    r.table('Networks').get(server.network).run(connection, function (err, network) {
                        if (network != null) {
                            if (network.hub == message.guild.id) {
                                for (let i = 0; i < network.servers.length; i++) {
                                    r.table('Servers').get(network.servers[i]).update({ network: null }).run(connection)
                                }
                                message.channel.send(`Deleted the network ${network.name}`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                                r.table('Networks').get(server.network).delete().run(connection)
                                r.table('Servers').get(message.guild.id).update({ network: null }).run(connection)
                            } else {
                                message.channel.send('This is not the hub server!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        } else {
                            message.channel.send('This server is not in a network!')
                        }
                    })
                }
                view() {
                    r.table('Networks').get(server.network).run(connection, function (err, network) {
                        if (network != null) {
                            embed.setTitle(`The **${network.name}** Network`)
                            r.table('Servers').get(network.hub).run(connection, function (err, main) {
                                embed.addField(`Main Channel:`, main.name)
                                embed.addField('Number of servers:', network.servers.length)
                                message.channel.send(embed).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(10000)
                                        message.delete(5000)
                                    }
                                })

                            })
                        } else {
                            message.channel.send('This server is not in a network!')
                        }
                    })
                }
                announceadd() {
                    r.table('Networks').get(server.network).run(connection, function (err, server) {
                        let admins
                        if (network.admins === undefined) {
                            admins = []
                        } else {
                            admins = network.admins
                        }
                        let alreadyadmin = false
                        for (let i = 0; i < admins.length; i++) {
                            if (admins[i] == message.mentions.users.first().id) {
                                alreadyadmin = true
                                break;
                            }
                        }
                        if (!alreadyadmin) {
                            if (message.mentions.users.first() != undefined) {
                                admins.push(message.mentions.users.first().id)
                                message.channel.send(`Added **${message.mentions.users.first().username}** as admin.`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                                r.table('Network').get(server.network).update({ admins: admins }).run(connection)
                            } else {
                                message.channel.send('Please specify someone to add.').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        } else {
                            message.channel.send('This user is already an admin!')
                        }
                    })
                }
                announceremove() {
                    let admins = server.admins
                    let isadmin = false
                    for (let i = 0; i < admins.length; i++) {
                        if (admins[i] == message.mentions.users.first().id) {
                            admins.splice(i, 1)
                            isadmin = true
                            r.table('Servers').get(message.guild.id).update({ admins: admins }).run(connection)
                            break;
                        }
                    }
                    if (!isadmin(message.author.id)) {
                        message.channel.send('This user is not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send(`**${message.mentions.users.first().username}** is no longer an admin`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class restart {
                constructor() {
                    this.name = ['Restart']
                    this.desc = `**OWNER COMMAND** Restarts the bot`
                    this.use = `${pre}restart`
                    this.example = `${pre}restart`
                    this.online = true
                    this.admin = true
                }
                async run() {
                    let restarters = ['213396745231532032', '360253852936830988', '259847539619135488']
                    if (restarters.indexOf(message.author.id) == -1) message.channel.send('You do not have permission to do this!')
                    await message.channel.send('Restarting...')
                    process.exit();
                }
            },
            class setannouncement {
                constructor() {
                    this.name = ['Setannouncement', 'setannounce', 'announcechannel']
                    this.desc = `**ADMIN COMMAND** Sets the Announcement channel`
                    this.use = `${pre}setannouncement <#channel>`
                    this.example = `${pre}setannouncement #general`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        r.table('Servers').get(message.guild.id).update({ announce: message.mentions.channels.first().id }).run(connection)
                        message.channel.send(`Set the announcement channel to **${message.mentions.channels.first().name}**`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                    if (!isadmin(message.author.id)) {
                        message.channel.send('Nice try, but you are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class announce {
                constructor() {
                    this.name = ['Announce']
                    this.desc = `**ADMIN COMMAND** Sends an announcement to all servers on a network.`
                    this.use = `${pre}announce <title> "," <body> | Note, ,s are supported in the body!`
                    this.example = `${pre}announce Important! , Love me`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        let content = args.join(' ').split(',')
                        let title = content[0]
                        content.shift()
                        let body = content.join(',')
                        r.table('Networks').get(server.network).run(connection, function (err, network) {
                            if (network != null) {
                                for (let i = 0; i < network.servers.length; i++) {
                                    r.table('Servers').get(network.servers[i]).run(connection, function (err, gottenserver) {
                                        embed.setColor(0xffee00)
                                        embed.setTitle(title)
                                        embed.setDescription(body)
                                        embed.setFooter(`Announcement from ${message.author.username} in server ${message.guild.name}`)
                                        if (bot.channels.get(gottenserver.announce) != undefined) {
                                            bot.channels.get(gottenserver.announce).send(embed)
                                        }
                                    })
                                }
                            } else {
                                embed.setColor(0xffee00)
                                if (title.length >= 255) {
                                    message.channel.send('Woah there, your title is a little long, how about you put some of that in the body by using a ","').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                } else {
                                    embed.setTitle(title)
                                    embed.setDescription(body)
                                    embed.setFooter(`Announcement from ${message.author.username} in server ${message.guild.name}`)
                                    if (bot.channels.get(server.announce) != undefined) {
                                        bot.channels.get(server.announce).send(embed)
                                    } else {
                                        message.channel.send('There is no announcement channel set!').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    }
                                }
                            }
                        })
                    } else {
                        message.channel.send(`Nice try, but you're not an admin!`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class networkinvites {
                constructor() {
                    this.name = ['NetworkInvites']
                    this.desc = `Gets an invite for all servers on a network.`
                    this.use = `${pre}networkinvites`
                    this.example = `${pre}networkinvites`
                    this.online = true
                    this.admin = false
                }

                run() {
                    if (this.online) {
                        r.table('Networks').get(server.network).run(connection, function (err, network) {
                            if (network != null) {
                                let invit
                                let servers = network.servers
                                async function invite() {
                                    if (servers.length <= 25) {
                                        message.channel.send('Fetching invites (This may take a bit)').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                        for (let i = 0; i < servers.length; i++) {
                                            let channel = bot.guilds.get(servers[i]).channels.array()
                                            let thing;
                                            await channel[1].createInvite().then(invi => {
                                                embed.setTitle('Invites for all servers on the network!.')
                                                if (invi.guild.id !== message.guild.id) {
                                                    embed.addField(invi.guild.name, invi.url)
                                                } else {
                                                    embed.addField(`${invi.guild.name} **(You are here!)**`, invi.url)
                                                }
                                            })
                                        }
                                        message.channel.send(embed).then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(60000)
                                                message.delete(5000)
                                            }
                                        })
                                    } else {
                                        message.channel.send('Woah there, you have a lot of channels here and I did not set it up for this many, if you see this, contact TheDeafCreeper#4727!').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    }
                                }
                                invite()
                            } else {
                                message.channel.send(`This channel is not in a network! You can get one yourself or create a network with ${pre}network create <name>.`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        })
                    } else {
                        message.channel.send('Sorry, but this command is currently under maintenance.').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class setname {
                constructor() {
                    this.name = ['Setname', 'ign']
                    this.desc = `Sets your in-game name for the game your server is based around.`
                    this.use = `${pre}ingamename <name>`
                    this.example = `${pre}ingamename TheDeafCreeper`
                    this.online = true
                    this.admin = false
                }

                run() {
                    let name;
                    if (args[0] == undefined) {
                        name = undefined
                        message.channel.send('I have unset your in-game name.').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        name = args.join(' ')
                        message.channel.send(`Set your in-game name to **${name}**`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                    r.table('Profiles').get(message.author.id).update({ mcname: name }).run(connection)
                }
            },
            class seename {
                constructor() {
                    this.name = ['Seename']
                    this.desc = `Shows you the in-game name of a user or the discord name of an in-game name.`
                    this.use = `${pre}seename <name>
                              \n${pre}seename <@user>`
                    this.example = `${pre}seename TheDeafCreeper
                                  \n${pre}seename @TheDeafCreeper`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (this.online) {
                        let user, name = false;
                        if (message.mentions.users.first()) {
                            user = message.mentions.users.first()
                            name = true
                        } else if (args[0] != undefined) {
                            user = args.join(' ')
                            name = true
                        } else {
                            message.channel.send('Please either mention a user or put an in-game name!')
                        }
                        if (name) {
                            if (message.mentions.users.first()) {
                                r.table('Profiles').get(user.id).run(connection, function (err, profile) {
                                    if (profile != null) {
                                        let ign = profile.mcname;
                                        message.channel.send(`**${user.username}'s** IGN is **${ign}**`).then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    } else {
                                        message.channel.send('This user does not have a profile!').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    }
                                })
                            } else {
                                r.db('test').table('Profiles').filter({ mcname: user }).run(connection, function (err, profiles) {
                                    profiles.toArray(function (err, fin) {
                                        if (fin.length == 0 || fin == null) {
                                            message.channel.send('No one was found by this name!').then(msg => {
                                                if (server.deletemessages) {
                                                    msg.delete(server.messagetimeout)
                                                    message.delete(5000)
                                                }
                                            })
                                        } else if (fin.length == 1) {
                                            message.channel.send(`**${fin[0].mcname}** is the IGN of **${fin[0].name}!**`).then(msg => {
                                                if (server.deletemessages) {
                                                    msg.delete(server.messagetimeout)
                                                    message.delete(5000)
                                                }
                                            })
                                        } else {
                                            for (let i = 0; i < fin.length; i++) {
                                                embed.setTitle(`Here are the users I found with that IGN! Total(${fin.length})`)
                                                embed.addField(fin[i].name, fin[i].mcname)
                                            }
                                            message.channel.send(embed).then(msg => {
                                                if (server.deletemessages) {
                                                    msg.delete(server.messagetimeout)
                                                    message.delete(5000)
                                                }
                                            })
                                        }
                                    })
                                })
                            }
                        } else {
                        }

                    } else {
                        message.channel.send('This command is currently under maintenance!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class randomfact {
                constructor() {
                    this.name = ['randomfact', 'rf']
                    this.desc = `Shows you a random or specific fact.`
                    this.use = `${pre}ranodm fact (#)`
                    this.example = `${pre}randomfact 
                                  \n${pre}randomfact 3`
                    this.online = true
                    this.admin = false
                }
                run() {
                    async function thing() {
                        const url = "https://www.cs.cmu.edu/~bingbin/";

                        var responseRequest = await fetch.get(url);
                        var response = responseRequest.body.toString();

                        var startPos = response.indexOf("</center>") + 9;
                        var contentUntrimmed = response.substring(startPos);

                        var endPos = contentUntrimmed.indexOf("<center>");
                        var content = contentUntrimmed.substring(0, endPos);

                        var facts = content.split("<p>");

                        let random;
                        if (isNaN(args[0])) {
                            random = Math.floor(Math.random() * facts.length)
                        } else {
                            random = args[0]
                        }
                        embed.setTitle("Random Fact")
                        embed.setDescription(facts[random])
                        embed.setFooter(`(#${random}/${facts.length}) From ${url}`);
                        message.channel.send(embed).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                    thing()
                }
            },
            class ctf {
                constructor() {
                    this.name = ['CTF']
                    this.desc = `Converts between Celcius and Fahrenheit`
                    this.use = `${pre}ctf [value] ["c"/"f"]`
                    this.example = `${pre}ctf 26 c`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (args[1].toLowerCase().startsWith('c') && !isNaN(args[0])) {
                        let temp = args[0]
                        let temp2 = temp * 9 / 5 + 32
                        message.channel.send(`${temp} celcius is equal to ${temp2} fahrenheit`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else if (args[1].toLowerCase().startsWith('f') && !isNaN(args[0])) {
                        let temp = args[0]
                        let temp2 = (temp - 32) / (9 / 5)
                        message.channel.send(`**${temp}** fahrenheit is equal to **${temp2}** celcius`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('One of 2 things happened here, either you didnt put a number in for the temp, or you did not use "c" or "f" for the unit.').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class announcelevelup {
                constructor() {
                    this.name = ['Announcelevelup']
                    this.desc = `**ADMIN COMMAND** Toggles level up announcements`
                    this.use = `${pre}announcelevelup`
                    this.example = `${pre}announcelevelup`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        if (server.announcelevel) {
                            r.table('Servers').get(message.guild.id).update({ announcelevel: false }).run(connection)
                            message.channel.send('Level up announcements are now **off**.')
                        } else {
                            r.table('Servers').get(message.guild.id).update({ announcelevel: true }).run(connection)
                            message.channel.send('Level up announcements are now **on**.')
                        }
                    } else {
                        message.channel.send('You are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class warncount {
                constructor() {
                    this.name = ['warncount', 'flags']
                    this.desc = `**ADMIN COMMAND** Changes the ammount of spam flags needed to warn a user.`
                    this.use = `${pre}warncount [ammount]`
                    this.example = `${pre}warncount 3`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        if (!isNaN(args[0])) {
                            r.table('Servers').get(message.guild.id).update({ warncount: args[0] }).run(connection)
                            message.channel.send(`Set the warn count to ${args[0]}`)
                        } else {
                            message.channel.send('Please put in a number for the number of warnings!')
                        }
                    } else {
                        message.channel.send('Nice try, but you\'re not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class enablewarnings {
                constructor() {
                    this.name = ['enablewarnings', 'warnings', 'warnusers']
                    this.desc = `**ADMIN COMMAND** Change if warnings are enabled.`
                    this.use = `${pre}enablewarnings`
                    this.example = `${pre}enablewarnings`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        if (server.enablewarnings) {
                            r.table('Servers').get(message.guild.id).update({ enablewarnings: false }).run(connection)
                            message.channel.send('I will no longer warn spamers.')
                        } else {
                            r.table('Servers').get(message.guild.id).update({ enablewarnings: true }).run(connection)
                            message.channel.send('I am now warning spammers.')
                        }
                    } else {
                        message.channel.send('Nice try, but you\'re not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class inventory {
                constructor() {
                    this.name = ['inventory', 'seeinv', 'inv', 'seeinventory']
                    this.desc = `Opens your inventory`
                    this.use = `${pre}inventory (#)`
                    this.example = `${pre}inventory`
                    this.online = true
                    this.admin = false
                }
                run() {
                    r.table('Profiles').get(message.author.id).run(connection, function (err, user) {
                        let page
                        if (args[0] == undefined || isNaN(args[0])) {
                            page = 1
                        } else {
                            page = args[0]
                        }
                        if (user.inventory == undefined || user.inventory.length == 0) {
                            message.channel.send('Your inventory is empty!')
                            r.table('Profiles').get(message.author.id).update({ inventory: [] }).run(connection)
                        } else {
                            for (let i = 12 * (page - 1); i < user.inventory.length && i < 12 * page; i++) {
                                let inv = user.inventory
                                embed.setTitle(`${message.author.username}'s inventory | ${inv.length} items`)
                                embed.addField(`${i + 1} ---------------------`, `${inv[i].name} | ${inv[i].count}`)
                                embed.setFooter(`Page ${page}/${Math.ceil(((inv.length) / 12))}`)
                            }
                            message.channel.send(embed).then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(30000)
                                    message.delete(5000)
                                }
                            })
                        }
                    })
                }
            },
            class recievepm {
                constructor() {
                    this.name = ['recievepm', 'pms', 'levelup']
                    this.desc = `Toggles the recieving of level up PMs when the server has disabled them.`
                    this.use = `${pre}recievepm`
                    this.example = `${pre}recievepm`
                    this.online = true
                    this.admin = false
                }
                run() {
                    r.table('Profiles').get(message.author.id).run(connection, function (err, profile) {
                        if (profile.recievelevelpm) {
                            r.table('Profiles').get(message.author.id).update({ recievelevelpm: false }).run(connection)
                            message.channel.send('You will no longer recieve level up PMs.')
                        } else {
                            r.table('Profiles').get(message.author.id).update({ recievelevelpm: false }).run(connection)
                            message.channel.send('You will now receive level up PMs.')
                        }
                    })
                }
            },
            class discord {
                constructor() {
                    this.name = ['discord', 'discordinvite', 'od']
                    this.desc = `Sends you an invite to the official discord server`
                    this.use = `${pre}discord`
                    this.example = `${pre}discord`
                    this.online = true
                    this.admin = false
                }
                run() {
                    message.author.send('https://discord.gg/Tfxq7Uv')
                    message.channel.send('Check your PMs!').then(msg => {
                        if (server.deletemessages) {
                            msg.delete(server.messagetimeout)
                            message.delete(5000)
                        }
                    })
                }
            },
            class announcejoin {
                constructor() {
                    this.name = ['announcejoin', 'aj']
                    this.desc = `**ADMIN COMMAND** Toggles join announcements when a user joins.`
                    this.use = `${pre}announcejoin`
                    this.example = `${pre}announcejoin`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        r.table('Servers').get(message.guild.id).update({ announcejoin: !server.announcejoin }).run(connection)
                        message.channel.send(`Announcing when a player joins was set to ${!server.announcejoin}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('You are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class announceleave {
                constructor() {
                    this.name = ['announceleave', 'al']
                    this.desc = `**ADMIN COMMAND** Toggles leave announcements when a user leaves.`
                    this.use = `${pre}announceleave`
                    this.example = `${pre}announceleave`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        r.table('Servers').get(message.guild.id).update({ announceleave: !server.announceleave }).run(connection)
                        message.channel.send(`Announcing a user leaving was set to ${!server.announceleave}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('You are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class joinmessage {
                constructor() {
                    this.name = ['joinmessage', 'jm']
                    this.desc = `**ADMIN COMMAND** The message sent when a user joins if announcejoin is enabled.\nUse {user} for the user's name\nUse {@user} to mention the user\nUse {server} for the server's name.`
                    this.use = `${pre}joinmessage [message]`
                    this.example = `${pre}joinmessage Welcome {user}!!`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        let joinmessage = args.join(' ')
                        r.table('Servers').get(message.guild.id).update({ joinmessage: joinmessage }).run(connection)
                        message.channel.send(`The join message is now ${joinmessage}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('You are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class leavemessage {
                constructor() {
                    this.name = ['leavemessage', 'lm']
                    this.desc = `**ADMIN COMMAND** The message sent when a user leaves if announceleave is enabled.\nUse {user} for the user's name\nUse {@user} to mention the user\nUse {server} for the server's name.`
                    this.use = `${pre}leavemessage [message]`
                    this.example = `${pre}leavemessage Goodbye {user}, hope to see you again soon!`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        let leavemessage = args.join(' ')
                        message.channel.send(`The leave message is now ${leavemessage}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                        r.table('Servers').get(message.guild.id).update({ leavemessage: leavemessage }).run(connection)
                    } else {
                        message.channel.send('You are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class banmessage {
                constructor() {
                    this.name = ['banmessage', 'bm']
                    this.desc = `**ADMIN COMMAND** The message sent when a user is banned from the server if announceban is enabled.\nUse {user} for the user's name\nUse {@user} to mention the user\nUse {server} for the server's name.`
                    this.use = `${pre}banmessage [message]`
                    this.example = `${pre}banmessage {user} has been banned, what did they do now?`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        let banmessage = args.join(' ')
                        message.channel.send(`The ban message is now ${banmessage}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                        r.table('Servers').get(message.guild.id).update({ banmessage: banmessage }).run(connection)
                    } else {
                        message.channel.send('You are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class announceban {
                constructor() {
                    this.name = ['announceban', 'ab']
                    this.desc = `**ADMIN COMMAND** Toggles ban announcements when a user is banned.`
                    this.use = `${pre}announceban`
                    this.example = `${pre}announceban`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        r.table('Servers').get(message.guild.id).update({ announceban: !server.announceban }).run(connection)
                        message.channel.send(`Announcing bans was set to ${!server.announceban}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('You are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class allowcommands {
                constructor() {
                    this.name = ['allowcommands', 'blockcommands', 'commands']
                    this.desc = `**ADMIN COMMAND** Toggles between allowing people to use commands and blocking it.`
                    this.use = `${pre}allowcommands`
                    this.example = `${pre}allowcommands`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) {
                        message.channel.send("Nice try, but you're not an admin!").then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        r.table('Servers').get(message.guild.id).update({ allowcommands: !server.allowcommands }).run(connection)
                        message.channel.send(`Allowing non admins to use commands was set to ${!server.allowcommands}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class denyrepeat {
                constructor() {
                    this.name = ['denyrepeat', 'denyerpeats']
                    this.desc = `**ADMIN COMMAND** Prevents people sending the same message.`
                    this.use = `${pre}denyrepeat`
                    this.example = `${pre}denyrepeat`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) {
                        message.channel.send("Nice try, but you're not an admin!").then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        r.table('Servers').get(message.guild.id).update({ denyerpeat: !server.denyerpeat }).run(connection)
                        message.channel.send(`Stopping message repeating was set to ${!server.denyerpeat}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class serversettings {
                constructor() {
                    this.name = ['serversettings', 'settings']
                    this.desc = `**ADMIN COMMAND** Shows all the server's settings.`
                    this.use = `${pre}serversettings`
                    this.example = `${pre}serversettings`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        let joinmessage = server.joinmessage
                        let announcejoin = server.announcejoin
                        let announceleave = server.announceleave
                        let leavemessage = server.leavemessage
                        let announceban = server.announceban
                        let banmessage = server.banmessage
                        let denyerpeat = server.denyrepeat
                        let enablewarnings = server.enablewarnings
                        let warncount = server.warncount
                        let announcelevel = server.announcelevel
                        let allowcommands = server.allowcommands
                        let messagetimeout = server.messagetimeout
                        let deletemessages = server.deletemessages
                        let echoadmin = server.echoadmin
                        let commandlog = server.commandlog
                        let modlog = server.modlog
                        let autoroles = server.autoroles
                        let reportchannel = server.reportchannel

                        for (let i = 0; i < autoroles.length; i++) {
                            autoroles[i] == message.guild.roles.find({ 'id': autoroles[i] }).name
                        }
                        embed.setTitle(`${message.guild.name}'s Settings`)
                        embed.addField('Announce join', announcejoin)
                        if (joinmessage != '') {
                            embed.addField('Join message', joinmessage)
                        } else {
                            embed.addField('Join message', 'None')
                        }
                        embed.addField('Announce leave', announceleave)
                        if (leavemessage != '') {
                            embed.addField('Leave message', leavemessage)
                        } else {
                            embed.addField('Leave message', 'None')
                        }
                        embed.addField('Announce ban', announceban)
                        if (banmessage != '') {
                            embed.addField('Ban message', banmessage)
                        } else {
                            embed.addField('Ban message', 'None')
                        }
                        embed.addField('Allow commands', allowcommands)
                        embed.addField('Deny Repeat', denyerpeat)
                        embed.addField('Enable Warnings', enablewarnings)
                        embed.addField('Warn count before action', warncount)
                        embed.addField('Announce levelup', announcelevel)
                        embed.addField('Delete Replys', deletemessages)
                        if (messagetimeout) {
                            embed.addField('Reply Deletion delay', messagetimeout)
                        }
                        embed.addField('Admin only echo', echoadmin)
                        embed.addField('Command Log Channel id:', commandlog)
                        embed.addField('Mod Log Channel id:', modlog)
                        embed.addField('Auto Roles:', autoroles.join(', ') + '.')
                        embed.addField('Report Channel id', reportchannel)

                        message.channel.send(embed).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(30000)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send(`Nice try, but you're not an admin!`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class ban {
                constructor() {
                    this.name = ['ban']
                    this.desc = `**ADMIN COMMAND** Bans a user.`
                    this.use = `${pre}ban [@user]`
                    this.example = `${pre}ban @thatoneguy#4235`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) {
                        message.channel.send('Sorry, but you are not admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        if (message.mentions.users.first().id == message.author.id) {
                            message.channel.send('You can not ban yourself!')
                        } else if (isadmin(message.mentions.users.first().id)) {
                            message.channel.send('I cannot ban admins!')
                        } else {
                            try {
                                let user = message.mentions.users.first()
                                let member = message.guild.member(user);
                                args.shift()
                                let reason = args.join(' ')
                                r.table('Punishments').count().run(connection, function (err, count) {
                                    r.table('Punishments').insert({ id: count, user: { name: message.mentions.users.first().username, id: message.mentions.users.first().id }, reason: reason, type: 'Ban' }).run(connection)
                                    let serverwarnings = server.warnings
                                    serverwarnings.push({ id: count, user: message.mentions.users.first().id })
                                    r.table('Servers').get(message.guild.id).update({ warnings: serverwarnings }).run(connection)
                                    try {
                                        if (server.modlog != null) {
                                            embed.setTitle(`Case ID: ${count}`)
                                            embed.setDescription(`${message.mentions.users.first().username} was banned!`)
                                            embed.addField('Reason:', reason)
                                            embed.setColor(0xff0000)
                                            bot.channels.get(server.modlog).send(embed)
                                        }
                                    } catch (error) { }
                                })
                                member.ban(0, reason)
                            } catch (err) {
                                console.log(err)
                                message.channel.send('I dont have permission to do this!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        }
                    }
                }
            },
            class kick {
                constructor() {
                    this.name = ['kick']
                    this.desc = `**ADMIN COMMAND** kicks a user.`
                    this.use = `${pre}kick [@user]`
                    this.example = `${pre}kick @thatoneguy#4235`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) {
                        message.channel.send('Sorry, but you are not admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        if (message.mentions.users.first().id == message.author.id) {
                            message.channel.send('You can not kick yourself!')
                        } else if (isadmin(message.mentions.users.first().id)) {
                            message.channel.send('I cannot kick admins!')
                        } else {
                            try {
                                let user = message.mentions.users.first()
                                let member = message.guild.member(user);
                                args.shift()
                                let reason = args.join(' ')
                                r.table('Punishments').count().run(connection, function (err, count) {
                                    r.table('Punishments').insert({ id: count, user: { name: message.mentions.users.first().username, id: message.mentions.users.first().id }, reason: reason, type: 'Kick' }).run(connection)
                                    let serverwarnings = server.warnings
                                    serverwarnings.push({ id: count, user: message.mentions.users.first().id })
                                    r.table('Servers').get(message.guild.id).update({ warnings: serverwarnings }).run(connection)
                                    try {
                                        if (server.modlog != null) {
                                            embed.setTitle(`Case ID: ${count}`)
                                            embed.setDescription(`${message.mentions.users.first().username} was kicked!`)
                                            embed.addField('Reason:', reason)
                                            embed.setColor(0xff0000)
                                            bot.channels.get(server.modlog).send(embed)
                                        }
                                    } catch (error) { }
                                })
                                member.kick()
                            } catch (err) {
                                console.log(err)
                                message.channel.send('I dont have permission to do this!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        }
                    }
                }
            },
            class xpforlevel {
                constructor() {
                    this.name = ['xpforlevel', 'xfl', 'xpfl']
                    this.desc = `Shows you how much xp you need per level.`
                    this.use = `${pre}xpforlevel [level]`
                    this.example = `${pre}xpforlevel 2`
                    this.online = true
                    this.admin = false
                }
                run() {
                    let level, xp = 0
                    if (args[0] != undefined && !isNaN(args[0])) {
                        level = args[0]
                        if (level <= 20000) {
                            for (let i = 1; i < level; i++) {
                                xp += i ** 2
                            }
                            message.channel.send(`Total : ${xp} | For level ${level} : ${level ** 2}`)
                        } else {
                            message.channel.send(`For level ${level} : ${(level - 1) ** 2}`)
                        }
                    } else {
                        message.channel.send('Please put a level down!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class profilepicture {
                constructor() {
                    this.name = ['profilepicture', 'picture']
                    this.desc = `Changes your profile picture.`
                    this.use = `${pre}profilepicture [discord picture link]`
                    this.example = `${pre}profilepicture https://cdn.discordapp.com/attachments/403345572481990666/456502513890492416/Arrow.png`
                    this.online = true
                    this.admin = false
                }
                run() {
                    let link = `${args[0]}`
                    if (link.startsWith('https://cdn.discordapp.com/attachments/')) {
                        r.table("Profiles").get(message.author.id).update({ profilepic: link }).run(connection)
                        embed.setTitle('Set your profile picture!')
                        embed.setImage(link)
                        message.channel.send(embed).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('Please put a discord image link! It should start with https://cdn.discordapp.com/attachments/').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class deletemessages {
                constructor() {
                    this.name = ['deletemessages', 'delmessages', 'delmsgs']
                    this.desc = `**ADMIN COMMAND** Toggles the deletion of bot replys.`
                    this.use = `${pre}deletemessages`
                    this.example = `${pre}deletemessages`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        r.table('Servers').get(message.guild.id).update({ deletemessages: !server.deletemessages }).run(connection)
                        message.channel.send(`Deleting messages was set to ${!server.deletemessages}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send('Nice try, but you are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class deletedelay {
                constructor() {
                    this.name = ['deletedelay', 'deldelay']
                    this.desc = `**ADMIN COMMAND** How long a message remains in chat.(Does not effect all messages)`
                    this.use = `${pre}deletedelay [# of seconds]`
                    this.example = `${pre}deletedelay 5`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        if (args[0] != undefined && !isNaN(args[0])) {
                            r.table("Servers").get(message.guild.id).update({ messagetimeout: args[0] * 1000 }).run(connection)
                            message.channel.send(`The reply deletion delay is now ${args[0]} seconds.`)
                        }
                    } else {
                        message.channel.send('Nice try, but you are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            //----------------------------------------------------------------------------\\
            class shop {
                constructor() {
                    this.name = ['shop']
                    this.desc = `Shows items in the shop.`
                    this.use = `${pre}shop [page#]`
                    this.example = `${pre}shop 3`
                    this.online = true
                    this.admin = false
                }
                run() {
                    let shop = server.shop, page = 1
                    if (shop == undefined) shop = []
                    if (!isNaN(args[0]) || args[0] == undefined) page = 0;
                    else page = args[0] - 1;
                    for (let i = page * 21; i < 21 + (page * 21) && i < shop.length; i++) {
                        let item = shop[i];
                        if (item.stock < 0) item.stock = 'Infinite'
                        embed.addField(`${item.name}`, `Price: ${item.price}\nStock: ${item.stock}`, true);
                    }
                    embed.setTitle(`${message.guild.name}'s Shop`)
                    embed.setFooter(`Page ${page}/${Math.ceil(shop.length / 21)}`)
                    message.channel.send(embed).then(msg => {
                        if (server.deletemessages) {
                            msg.delete(30000)
                            message.delete(5000)
                        }
                    })
                }
            },
            class buy {
                constructor() {
                    this.name = ['buy']
                    this.desc = `Buys an item from the shop.`
                    this.use = `${pre}buy <item name> <amount>`
                    this.example = `${pre}buy Super OP Sword 1`
                    this.online = true
                    this.admin = false
                }
                run() {
                    r.table('Profiles').get(message.author.id).run(connection, function (err, profile) {
                        let shop = server.shop, item
                        let amount;
                        if (isNaN(args[args.length -1])) amount = 1;
                        else amount = args.pop();
                        if (profile == null) { message.channel.send('Something went wrong! Dont take it personally, probally just me.'); return; }
                        let name = args.join(' ').toLowerCase(), x = false, inventory = profile.inventory, y = false;
                        if (shop == undefined) shop = []
                        for (let i = 0; i < shop.length; i++) {
                            if (shop[i].name.toLowerCase() != name) continue;
                            x = true; item = shop[i];
                            if (isNaN(amount)) { message.channel.send('Invalid number for amount!'); return; }
                            if (profile.balance < item.price * amount) { message.channel.send('Insufficient balance!'); return; }
                            if ((item.stock == 0 || amount > item.stock) && item.stock >= 0) { message.channel.send('There\'s not enough of this item to buy!'); return; }
                            if (inventory == undefined) inventory = []
                            if (item.stock > 0) item.stock -= amount
                            profile.balance -= item.price * amount
                            for (let l = 0; l < profile.inventory.length; l++)
                                if (profile.inventory[l].name == item.name && profile.inventory[l].serverid == message.guild.id) { let num = (profile.inventory[l].count * 1); num += amount * 1; profile.inventory[l].count = num; y = true; break; }
                            if (!y)
                                profile.inventory.push({ name: item.name, count: amount, serverid: message.guild.id })
                            message.channel.send(`You've succesfully bought ${amount} ${item.name} for ${item.price * amount}`)
                            if (server.orders == undefined) server.orders = []
                            server.orders.push({ user: message.author.username, item: item.name, amount: amount })
                            r.table('Servers').get(message.guild.id).update(server).run(connection)
                            r.table('Profiles').get(message.author.id).update(profile).run(connection)
                            break;
                        }
                        if (!x) { message.channel.send('I could not find an item with this name; did you spell it correctly?'); return; }
                    })
                }
            },
            class topbalance {
                constructor() {
                    this.name = ['topbalance', 'baltop']
                    this.desc = `Shows the top 10 player's balances.`
                    this.use = `${pre}topbalance`
                    this.example = `${pre}topbalance`
                    this.online = true
                    this.admin = false
                }
                run() {
                    message.channel.startTyping(300)
                    r.table('Profiles').orderBy(r.desc('balance')).limit(10).run(connection, function (err, profilesraw) {
                        if (err) {
                            console.error(err);
                            message.channel.send('An error occured');
                            return;
                        }
                        profilesraw.toArray(function (err, profiles) {
                            embed.setTitle('Top 10 richest users.')
                            for (let i = 0; i < profiles.length; i++) {
                                embed.addField(`${i + 1} - ${profiles[i].name}`, `Balance: ${profiles[i].balance}`)
                            }
                            message.channel.send(embed).then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(20000)
                                    message.delete(5000)
                                }
                            })
                        })
                    })
                    message.channel.stopTyping(true)
                }
            },
            class toplevel {
                constructor() {
                    this.name = ['toplevel', 'leveltop']
                    this.desc = `Shows the 10 highest level users.`
                    this.use = `${pre}toplevel`
                    this.example = `${pre}toplevel`
                    this.online = true
                    this.admin = false
                }

                run() {
                    message.channel.startTyping(30000)
                    r.table('Profiles').orderBy(r.desc('level')).limit(10).run(connection, function (err, profilesraw) {
                        if (err) {
                            console.error(err);
                            message.channel.send('An error occured');
                            return;
                        }
                        profilesraw.toArray(function (err, profiles) {
                            embed.setTitle('Top 10 highest level users.')
                            for (let i = 0; i < profiles.length; i++) {
                                embed.addField(`${i + 1} - ${profiles[i].name}`, `Level: ${profiles[i].level}`)
                            }
                            message.channel.send(embed).then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(20000)
                                    message.delete(5000)
                                }
                            })
                        })
                    })
                    message.channel.stopTyping(true)
                }
            },
            class additem {
                constructor() {
                    this.name = ['additem', 'createitem']
                    this.desc = `Adds an item to the shop.`
                    this.use = `${pre}additem <Name> <Price> <Amount (-1 for infinate)>`
                    this.example = `${pre}additem Super OP Sword 100000 1`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) { message.channel.send('You dont have permission to run this command!'); return; }
                    if (server.shop == undefined) server.shop = []
                    let shop = server.shop, item, amount = args.pop();
                    let price = args.pop();
                    let name = args.join(' '), x = false;
                    for (let i = 0; i < shop.length; i++) {
                        if (shop[i].name.toLowerCase() == name.toLowerCase()) { message.channel.send('This item already exists! If you would like to edit it use edititem.'); x = true; break; }
                    }
                    if (x) return;
                    item = {}
                    if (isNaN(amount)) { message.channel.send('Invalid number for amount!'); return; }
                    if (isNaN(price)) { message.channel.send('Invalid number for price!'); return; }
                    if (name == '' || name == undefined) { message.channel.send('Invalid name!'); return; }
                    item.stock = amount
                    item.price = price
                    item.name = name
                    shop.push(item)
                    r.table('Servers').get(message.guild.id).update(server).run(connection)
                    message.channel.send(`Added ${item.name} to with ${item.stock} @ $${item.price} each.`)
                }
            },
            class removeitem {
                constructor() {
                    this.name = ['removeitem', 'deleteitem']
                    this.desc = `Removes an item from the shop.`
                    this.use = `${pre}removeitem <Name> <Price> <Amount (-1 for infinate)>`
                    this.example = `${pre}removeitem Spuer OP Sword`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) { message.channel.send('You dont have permission to run this command!'); return; }
                    let shop = server.shop, item, name = args.join(' '), x = false;
                    for (let i = 0; i < shop.length; i++) {
                        if (shop[i].name.toLowerCase() != name.toLowerCase()) continue;
                        message.channel.send(`Removed ${shop[i].name}.`)
                        x = true; shop.splice(i, 1);
                        r.table('Servers').get(message.guild.id).update(server).run(connection)
                        break;
                    }
                    if (!x) { message.channel.send('I could not find an item with this name; did you spell it correctly?'); return; }
                }
            },
            class edititem {
                constructor() {
                    this.name = ['edititem']
                    this.desc = `Edit an item in the shop.`
                    this.use = `${pre}edititem <Name> <Price> <Amount (-1 for infinate)>`
                    this.example = `${pre}edititem Super OP Sword 1000000 10`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) { message.channel.send('You dont have permission to run this command!'); return; }
                    if (server.shop == undefined) server.shop = []
                    let shop = server.shop, item, amount = args.pop();
                    let price = args.pop();
                    let name = args.join(' ').toLowerCase(), x = false;
                    for (let i = 0; i < shop.length; i++) {
                        if (shop[i].name.toLowerCase() != name) { continue; }
                        x = true; item = shop[i];
                        if (isNaN(amount)) { message.channel.send('Invalid number for amount!'); return; }
                        if (isNaN(price)) { message.channel.send('Invalid number for price!'); return; }
                        item.stock = amount
                        item.price = price
                        r.table('Servers').get(message.guild.id).update(server).run(connection)
                        message.channel.send(`Updated ${item.name} to a stock of ${item.stock} @ $${item.price} each.`)
                        break;
                    }
                    if (!x) { message.channel.send('I could not find an item with this name; did you spell it correctly?'); return; }
                }
            },
            class orders {
                constructor() {
                    this.name = ['orders']
                    this.desc = `Shows all purchased items.`
                    this.use = `${pre}orders [page#]`
                    this.example = `${pre}orders`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) { message.channel.send('You dont have permission to run this command!'); return; }
                    let orders = server.orders, page = 1
                    if (orders == undefined) orders = []
                    if (!isNaN(args[0]) || args[0] == undefined) page = 0;
                    else page = args[0] - 1;
                    for (let i = page * 21; i < 21 + (page * 21) && i < orders.length; i++) {
                        let order = orders[i];
                        embed.addField(`${i + 1}. ${order.user}`, `${order.amount} ${order.item}(s)`, true);
                    }
                    embed.setTitle(`${message.guild.name}'s Orders`)
                    embed.setFooter(`Page ${page}/${Math.ceil(orders.length / 21)}`)
                    message.channel.send(embed).then(msg => {
                        if (server.deletemessages) {
                            msg.delete(30000)
                            message.delete(5000)
                        }
                    })
                }
            },

            class clearorder {
                constructor() {
                    this.name = ['clearorder']
                    this.desc = `Clears an order from the orders list.`
                    this.use = `${pre}orders [order#]`
                    this.example = `${pre}orders`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) { message.channel.send('You dont have permission to run this command!'); return; }
                    let orders = server.orders, order;
                    if (orders == undefined) orders = []
                    if (isNaN(args[0]) || args[0] == undefined) { message.channel.send('You need to specify an order to clear!'); return; }
                    else order = args[0];

                    if (orders[order-1] == undefined) { message.channel.send('Invalid Order!'); return; }
                    
                    message.channel.send(`Cleared order ${order}, ${orders[order - 1].user}: ${orders[order - 1].amount} ${orders[order - 1].item}(s)`);
                    orders.splice(order-1, 1);
                    r.table('Servers').get(message.guild.id).update({orders: orders}).run(connection);
                }
            },
            //-------------------------------------------------------------------------------------------\\
            class pay {
                constructor() {
                    this.name = ['pay']
                    this.desc = `Pays another player.`
                    this.use = `${pre}pay [@user] [ammount]`
                    this.example = `${pre}pay @Bobthegreat 1999`
                    this.online = true
                    this.admin = false
                }
                run() {
                    r.table('Profiles').get(message.author.id).run(connection, function (err, profile) {
                        let user = message.mentions.users.first()
                        if (!isNaN(args[1]) && args[1] != undefined) {
                            let ammount = Math.abs(args[1])
                            if (ammount <= profile.balance) {
                                if (message.author.id != user.id) {
                                    r.table('Profiles').get(user.id).run(connection, function (err, profile2) {
                                        let balance2 = profile2.balance
                                        balance2 += ammount
                                        r.table('Profiles').get(user.id).update({ balance: balance2 }).run(connection)
                                    })
                                    let balance = profile.balance
                                    balance += ammount
                                    r.table('Profiles').get(message.author.id).update({ balance: balance }).run(connection)
                                }
                                message.channel.send(`Succsessfully transfered $${ammount} to ${user.username}`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            } else {
                                message.channel.send('You dont have enough money for this!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        }
                    })
                }
            },
            class createvote {
                constructor() {
                    this.name = ['createvote', 'votecreate']
                    this.desc = `Creates a vote.`
                    this.use = `${pre}createvote [title]"," [option1] [option2] (option3 - 25)`
                    this.example = `${pre}createvote Should we have some stuff?, Yes no sure nah nope.mp3`
                    this.online = true
                    this.admin = false
                }
                run() {
                    r.table('Votes').filter({ guild: message.guild.id }).run(connection, function (err, rawvotes) {
                        rawvotes.toArray(function (err, votes) {
                            let joinedarray = args.join(' ')
                            let name = joinedarray.split(',')
                            let choices = name[1]
                            name = name[0]
                            let taken = false
                            if (name != '' && choices != undefined && choices.length != 0) {
                                choices = choices.split(' ')
                                for (let i = choices.length - 1; i >= 0; i--) {
                                    if (choices[i] == '' || choices[i] == ' ') {
                                        choices.splice(i, 1)
                                    }
                                }
                                let id = 0
                                for (let i = 0; i <= votes.length; i++) {
                                    let validid = false
                                    r.table('Votes').get(`${i}`).run(connection, function (err, profile) {
                                        if (profile == null) {
                                            id = `${i}`
                                            validid = true
                                        }
                                    })
                                    if (validid) { break; } else { id = i + 1 }
                                }
                                for (let i = 0; i < choices.length && i < 25; i++) {
                                    choices[i] = { choice: choices[i], count: 0 }
                                }
                                if (choices.length > 25) {
                                    choices.splice(25, choices.length - 25)
                                }
                                for (let i = 0; i < votes.length; i++) {
                                    if (votes[i].title.toLowerCase() == name.toLowerCase()) {
                                        taken = true
                                        break;
                                    }
                                }
                                if (taken) {
                                    message.channel.send('There is already a vote with this name!').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                } else {
                                    let vote = {
                                        title: name,
                                        choices: choices,
                                        creator: message.author.id,
                                        guild: message.guild.id,
                                        voters: [],
                                        id: `${id}`
                                    }
                                    r.table('Votes').insert(vote).run(connection)
                                    message.channel.send(`successfully created the vote **${name}**`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                            } else {
                                message.channel.send('Please define a name and choices for the vote!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        })
                    })
                }
            },
            class deletevote {
                constructor() {
                    this.name = ['deletevote', 'votedelete', 'endvote', 'voteend']
                    this.desc = `Deletes a vote.`
                    this.use = `${pre}deletevote [title] #note, this only works if you made the vote!#`
                    this.example = `${pre}deletevote Should we have some stuff?`
                    this.online = true
                    this.admin = false
                }
                run() {
                    r.table('Votes').filter({ guild: message.guild.id }).run(connection, function (err, rawvotes) {
                        rawvotes.toArray(function (err, votes) {
                            let found = false
                            for (let i = 0; i < votes.length; i++) {
                                if (votes[i].title.toLowerCase().startsWith(args.join(' ').toLowerCase())) {
                                    if (message.author.id === votes[i].creator) {
                                        r.table('Votes').get(votes[i].id).delete().run(connection)
                                        message.channel.send(`Succsessfully deleted the vote **${votes[i].title}**!`).then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    } else {
                                        message.channel.send('You did not make this vote so you can not do that!').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                    }
                                    found = true
                                    break;
                                }
                            }
                            if (!found) {
                                message.channel.send('I could not find a vote with that name!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        })
                    })
                }
            },
            class vote {
                constructor() {
                    this.name = ['vote']
                    this.desc = `Lets you vote on a vote.`
                    this.use = `${pre}Vote [title #this does not need to be the full title, you can do only part of it#] [choice]`
                    this.example = `${pre}vote Should we have some stuff?, nope.mp3`
                    this.online = true
                    this.admin = false
                }
                run() {
                    r.table('Votes').filter({ guild: message.guild.id }).run(connection, function (err, rawvotes) {
                        rawvotes.toArray(function (err, votes) {
                            let found = false
                            let found2 = false
                            for (let i = 0; i < votes.length; i++) {
                                let choice = args.pop()
                                if (votes[i].title.toLowerCase().startsWith(args.join(' ').toLowerCase())) {
                                    found = true
                                    let alreadyvoted = false
                                    for (let l = 0; l < votes[i].voters.length; l++) {
                                        if (votes[i].voters[l] === message.author.id) {
                                            alreadyvoted = true
                                            message.channel.send('You have already voted on this vote!').then(msg => {
                                                if (server.deletemessages) {
                                                    msg.delete(server.messagetimeout)
                                                    message.delete(5000)
                                                }
                                            })
                                        }
                                    }
                                    if (!alreadyvoted) {
                                        let id = votes[i].id
                                        for (let l = 0; l < votes[i].choices.length; l++) {
                                            if (votes[i].choices[l].choice.toLowerCase().startsWith(choice.toLowerCase())) {
                                                message.channel.send(`You have voted **${votes[i].choices[l].choice}** on **${votes[i].title}**.`).then(msg => {
                                                    if (server.deletemessages) {
                                                        msg.delete(server.messagetimeout)
                                                        message.delete(5000)
                                                    }
                                                })
                                                let choices = votes[i].choices
                                                choices[l].count++
                                                let voters = votes[i].voters
                                                voters.push(message.author.id)
                                                r.table('Votes').get(id).update({ voters: voters, choices: choices }).run(connection)
                                            }
                                        }
                                        break;
                                    }
                                } else {
                                    if (!found)
                                        message.channel.send('There are no votes under that name!').then(msg => {
                                            if (server.deletemessages) {
                                                msg.delete(server.messagetimeout)
                                                message.delete(5000)
                                            }
                                        })
                                }
                            }

                        })
                    })
                }
            },
            class viewvote {
                constructor() {
                    this.name = ['viewvote', 'voteview']
                    this.desc = `Views a vote.`
                    this.use = `${pre}viewvote [title]`
                    this.example = `${pre}viewvote Should we have some stuff?`
                    this.online = true
                    this.admin = false
                }
                run() {
                    let found = false
                    r.table('Votes').filter({ guild: message.guild.id }).run(connection, function (err, rawvotes) {
                        rawvotes.toArray(function (err, votes) {
                            for (let i = 0; i < votes.length; i++) {
                                if (votes[i].title.toLowerCase().startsWith(args.join(' ').toLowerCase())) {
                                    let total = 0
                                    for (let l = 0; l < votes[i].choices.length; l++) {
                                        total += votes[i].choices[l].count
                                    }
                                    embed.setTitle(`The results for ${votes[i].title}. (${total} votes)`)
                                    for (let l = 0; l < votes[i].choices.length; l++) {
                                        let choices = votes[i].choices
                                        if (choices[l].count == 0) {
                                            embed.addField(choices[l].choice, `${choices[l].count} (${0})%`)
                                        } else {
                                            embed.addField(choices[l].choice, `${choices[l].count} (${Math.round((choices[l].count / total) * 100)})%`)
                                        }
                                    }
                                    message.channel.send(embed).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(30000)
                                            message.delete(5000)
                                        }
                                    })
                                    found = true
                                    break;
                                }

                            }
                            if (!found || votes.length == 0)
                                message.channel.send('There are no votes under that name!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                        })
                    })

                }
            },
            class listvotes {
                constructor() {
                    this.name = ['listvotes', 'voteslist']
                    this.desc = `Lists all votes on the server.`
                    this.use = `${pre}listvotes (page)`
                    this.example = `${pre}listvotes`
                    this.online = true
                    this.admin = false
                }
                run() {
                    r.table('Votes').filter({ guild: message.guild.id }).run(connection, function (err, rawvotes) {
                        rawvotes.toArray(function (err, votes) {
                            embed.setTitle(`All Votes on **${message.guild.name}**.`)
                            if (args[0] == undefined || isNaN(args[0])) {
                                var page = 1
                            } else {
                                var page = args[0]
                            }
                            for (let i = 12 * (page - 1); i < votes.length && i < 12 * page; i++) {
                                let command = new commands[i]()
                                embed.addField(`---------------------------`, votes[i].title)
                            }
                            embed.setFooter(`Page ${page}/${Math.ceil(((votes.length) / 12))}`)
                            message.channel.send(embed).then(msg => {
                                if (server.deletemessages) {
                                    msg.delete(20000)
                                    message.delete(5000)
                                }
                            })
                        })
                    })
                }
            },
            class addrule {
                constructor() {
                    this.name = ['addrule', 'ruleadd']
                    this.desc = `**ADMIN COMMAND** Adds a server rule.`
                    this.use = `${pre}addrule [rule]`
                    this.example = `${pre}addrule No Spamming`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        let found = false
                        let rule = args.join(' ')
                        if (rule.length != 0) {
                            let rules = server.rules
                            for (let i = 0; i < rules.length; i++) {
                                if (rules[i].toLowerCase().startsWith(rule.toLowerCase())) {
                                    found = true
                                    break;
                                }
                            }
                            if (found) {
                                message.channel.send('This is already a rule!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            } else {
                                rules.push(rule)
                                r.table('Servers').get(message.guild.id).update({ rules: rules }).run(connection)
                                message.channel.send(`Added **${rule}** to the rule list.`).then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        } else {
                            message.channel.send('Please put a rule to add!')
                        }
                    } else {
                        message.channel.send('Nice try, but you are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class removerule {
                constructor() {
                    this.name = ['removerule', 'ruleremove']
                    this.desc = `**ADMIN COMMAND** Removes a server rule.`
                    this.use = `${pre}removerule [rule]`
                    this.example = `${pre}removerule No Spamming`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        let found = false
                        let rule = args.join(' ')
                        if (rule.length != 0) {
                            let rules = server.rules
                            if (!isNaN(rule)) {
                                if (rule - 1 > rules.length || rule < 1) {
                                    message.channel.send('Invalid rule #!').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                } else {
                                    rules.splice(rule - 1, 1)
                                    message.channel.send(`Removed rule ${rule}`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                    r.table('Servers').get(message.guild.id).update({ rules: rules }).run(connection)
                                    return;
                                }
                            }
                            for (let i = 0; i < rules.length; i++) {
                                if (rules[i].toLowerCase() == rule.toLowerCase()) {
                                    found = true
                                    message.channel.send(`Removed **${rules[i]}** from the rule list.`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                    rules.splice(i, 1)
                                    r.table('Servers').get(message.guild.id).update({ rules: rules }).run(connection)
                                    break;
                                }
                            }
                            if (!found) {
                                message.channel.send('This is not a rule!').then(msg => {
                                    if (server.deletemessages) {
                                        msg.delete(server.messagetimeout)
                                        message.delete(5000)
                                    }
                                })
                            }
                        } else {
                            message.channel.send('Please put a rule to remove!')
                        }
                    }
                }
            },
            class rules {
                constructor() {
                    this.name = ['rules', 'viewrule']
                    this.desc = `Show's the server rules.`
                    this.use = `${pre}rules (page)`
                    this.example = `${pre}rules`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (args[0] == undefined) {
                        var page = 1
                    } else {
                        var page = args[0]
                    }
                    let rules = server.rules
                    embed.setTitle(`${message.guild.name}'s rules`)
                    for (let i = 12 * (page - 1); i < rules.length && i < 12 * page; i++) {
                        embed.addField(`${i + 1})`, rules[i])
                    }
                    embed.setFooter(`Page ${page}/${Math.ceil(((rules.length) / 12))}`)
                    message.channel.send(embed).then(msg => {
                        if (server.deletemessages) {
                            msg.delete(30000)
                            message.delete(5000)
                        }
                    })
                }
            },
            class ignorenextmessage {
                constructor() {
                    this.name = ['ignorenextcommand', 'ignorenext', 'ignorenextcmd']
                    this.desc = `**ADMIN COMMAND** Ignores the next command sent so that you can change another bot's prefix if there is a conflict.`
                    this.use = `${pre}ignorenextmessage`
                    this.example = `${pre}ignorenextmessage`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id) || server.admins.length == 0) {
                        r.table('Servers').get(message.guild.id).update({ ignorenext: true }).run(connection)
                        message.channel.send('I will now ignore the next command sent.').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class echo {
                constructor() {
                    this.name = ['echo', 'send', 'say']
                    this.desc = `**TOGGLEABLE ADMIN COMMAND** Sends a message as the bot.`
                    this.use = `${pre}echo [message]`
                    this.example = `${pre}echo Hello world`
                    this.online = true
                    this.admin = server.echoadmin
                }
                run() {
                    if (isadmin(message.author.id) || !server.echoadmin) {
                        if (args.join(' ') != undefined && args.join(' ') != '') {
                            message.channel.send(args.join(' ')).then(msg => {
                                message.delete(0)
                            })
                        } else {
                            message.channel.send('I cant send an empty message!')
                        }
                    } else {
                        message.channel.send(`Nice try, but this command is in admin only mode and you're not an admin!`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class echoadminonly {
                constructor() {
                    this.name = ['adminecho', 'echoadmin']
                    this.desc = `**ADMIN COMMAND** Toggles the echo command being admin only.`
                    this.use = `${pre}adminecho`
                    this.example = `${pre}adminecho`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        r.table('Servers').get(message.guild.id).update({ echoadmin: !server.echoadmin }).run(connection)
                        message.channel.send(`The echo command being admin only was set to ${!server.echoadmin}`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        message.channel.send(`Nice try, but you're not an admin!`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class warn {
                constructor() {
                    this.name = ['warn']
                    this.desc = `**ADMIN COMMAND** Warns a user.`
                    this.use = `${pre}warn [@user]`
                    this.example = `${pre}warn @BarneyTheDino123`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) {
                        message.channel.send('Nice try, but you\'re not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        }); return;
                    }
                    if (!message.mentions.users.first()) {
                        message.channel.send('Pick someone to warn!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else if (message.author.id == message.mentions.users.first().id) {
                        message.channel.send('You cant warn yourself!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        if (isadmin(message.mentions.users.first().id)) {
                            message.channel.send('I can not warn this user!')
                        } else {
                            args.shift()
                            let reason = args.join(' ')
                            message.mentions.users.first().send(`You were warned on ${message.guild.name} for ${reason}.`)
                            message.channel.send(`Warned ${message.mentions.users.first().username} for ${reason}`)
                            r.table('Punishments').count().run(connection, function (err, count) {
                                r.table('Punishments').insert({ id: count, user: { name: message.mentions.users.first().username, id: message.mentions.users.first().id }, reason: reason, type: 'Warn' }).run(connection)
                                let serverwarnings = server.warnings
                                serverwarnings.push({ id: count, user: message.mentions.users.first().id })
                                r.table('Servers').get(message.guild.id).update({ warnings: serverwarnings }).run(connection)
                                try {
                                    if (server.modlog != null) {
                                        embed.setTitle(`Case ID: ${count}`)
                                        embed.setDescription(`${message.mentions.users.first().username} was warned!`)
                                        if (reason != undefined && reason != '') {
                                            embed.addField('Reason:', reason)
                                        }
                                        embed.setColor(0xffa300)
                                        bot.channels.get(server.modlog).send(embed)
                                    }
                                } catch (error) { console.error(error) }
                            })
                        }
                    }
                }
            },
            class commandlog {
                constructor() {
                    this.name = ['commandlog', 'logcommand']
                    this.desc = `**ADMIN COMMAND** Sets the log channel for commands.`
                    this.use = `${pre}commandlog [#channel]`
                    this.example = `${pre}commandlog #bot-logs`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) {
                        message.channel.send('Nice try, but you are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        let channel = message.mentions.channels.first()
                        r.table('Servers').get(message.guild.id).update({ commandlog: channel.id }).run(connection)
                        message.channel.send(`Updated the command log to #${channel.name}!`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class modlog {
                constructor() {
                    this.name = ['modlog', 'logmod']
                    this.desc = `**ADMIN COMMAND** Sets the log channel for moderation.`
                    this.use = `${pre}modlog [#channel]`
                    this.example = `${pre}modlog #mod-logs`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) {
                        message.channel.send('Nice try, but you are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    } else {
                        let channel = message.mentions.channels.first()
                        r.table('Servers').get(message.guild.id).update({ modlog: channel.id }).run(connection)
                        message.channel.send(`Updated the moderation log to #${channel.name}!`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class evalcmd {
                constructor() {
                    this.name = ['eval']
                    this.desc = `**OWNER COMMAND** Evaluates code.`
                    this.use = `${pre}eval [anything]`
                    this.example = `${pre}eval message.channel.send('Test')`
                    this.online = true
                    this.admin = true
                }
                run() {
                    let isowner = false
                    for (let i = 0; i < owners.length; i++) {
                        if (message.author.id === owners[i]) {
                            isowner = true
                        }
                    }
                    if (isowner) {
                        const clean = text => {
                            if (typeof (text) === "string")
                                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                            else
                                return text;
                        }

                        try {
                            const code = args.join(" ");
                            let evaled = eval(code);

                            if (typeof evaled !== "string")
                                evaled = require("util").inspect(evaled);
                            if (evaled == bot.token) {
                                message.channel.send('Woah there, trying to show the bot token?')
                            } else {
                                message.channel.send(clean(evaled), { code: "xl" });
                            }
                        } catch (err) {
                            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
                        }
                    } else {
                        message.channel.send('Nice try, but you are not an owner of this bot.').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class testcmd {
                constructor() {
                    this.name = ['test', 'testcmd']
                    this.desc = `**OWNER COMMAND** For test reasons.`
                    this.use = `${pre}test`
                    this.example = `${pre}test`
                    this.online = true
                    this.admin = true
                }
                run() {
                    try {
                        let isowner = false
                        for (let i = 0; i < owners.length; i++) {
                            if (message.author.id === owners[i]) {
                                isowner = true
                            }
                        }
                        if (isowner) {
                            message.channel.send(isadmin(server, message.author.id))
                            message.channel.send('Something happened!')

                        } else {
                            message.channel.send('Nice try, but you are not a bot owner!')
                        }
                    } catch (err) {
                        message.channel.send(`ERROR ${clean(err)}`)
                    }
                }
            },
            class history {
                constructor() {
                    this.name = ['history']
                    this.desc = `**ADMIN COMMAND** Shows recent punishments.`
                    this.use = `${pre}history (@user)`
                    this.example = `${pre}history \n ${pre}history @TheDeafCreeper`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (message.mentions.users.first()) {
                        let serverpunish = server.warnings
                        if (args[1] == undefined) {
                            var page = 1
                        } else {
                            var page = args[1]
                        }
                        for (let i = 12 * (page - 1); i < serverpunish.length && embed.fields.length < 12; i++) {
                            r.table('Punishments').get(serverpunish[i].id).run(connection, function (err, case0) {
                                if (case0.user.id == message.mentions.users.first().id) {
                                    embed.addField(`Case id: ${case0.id} | User: ${case0.user.name}`, `Type: ${case0.type} | Reason: ${case0.reason}`)
                                }
                                if (i == serverpunish.length - 1 || i == (12 * page) - 1) {
                                    embed.setFooter(`Page ${page}/${Math.ceil(((embed.fields.length) / 12))}`)
                                    message.channel.send(embed).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                            })
                        }
                    } else {
                        let serverpunish = server.warnings
                        if (args[0] == undefined) {
                            var page = 1
                        } else {
                            var page = args[0]
                        }
                        for (let i = 12 * (page - 1); i < serverpunish.length && i < 12 * page; i++) {
                            r.table('Punishments').get(serverpunish[i].id).run(connection, function (err, case0) {
                                embed.addField(`Case id: ${case0.id} | User: ${case0.user.name}`, `Type: ${case0.type} | Reason: ${case0.reason}`)
                                if (i == serverpunish.length - 1 || i == (12 * page) - 1) {
                                    embed.setFooter(`Page ${page}/${Math.ceil(((serverpunish.length) / 12))}`)
                                    message.channel.send(embed).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                }
                            })
                        }
                    }
                }
            },
            class autorole {
                constructor() {
                    this.name = ['autorole']
                    this.desc = `**ADMIN COMMAND** Adds and removes auto roles.`
                    this.use = `${pre}autorole ['add/remove'] [@user]`
                    this.example = `${pre}autorole add @Member`
                    this.online = true
                    this.admin = true
                }
                run() {
                    let autoroles = server.autoroles
                    let option = args[0].toLowerCase()
                    let role = message.mentions.roles.first().id
                    if (option == 'add') {
                        autoroles.push(role)
                        message.channel.send(`Added ${message.mentions.roles.first().name} as an auto role.`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                        r.table('Servers').get(message.guild.id).update({ autoroles: autoroles }).run(connection)
                    } else if (option == 'remove') {
                        let location = autoroles.indexOf(role)
                        if (location != -1) {
                            autoroles.splice(location, 1)
                            message.channel.send(`Removed ${message.mentions.roles.first().name} as an auto role.`)
                            r.table('Servers').get(message.guild.id).update({ autoroles: autoroles }).run(connection)
                        } else {
                            message.channel.send('That is not a valid role!')
                        }
                    } else {
                        message.channel.send(`Invalid choice! Do ${pre} add @role or ${pre} remove @role`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class mute {
                constructor() {
                    this.name = ['mute']
                    this.desc = `**ADMIN COMMAND** Mutes a user.`
                    this.use = `${pre}mute [@user] [# (min/hours/days)] (reason)`
                    this.example = `${pre}mute @Rulebreaker 5 min Breaking rules\n
                                    ${pre}mute @Rulebreaker 0 minute Breaking rules #That does infinate#`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) {
                        message.channel.send('Nice try, but you\'re not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                        return;
                    }
                    if (args[0] == undefined || args[1] == undefined || args[2] == undefined) {
                        message.channel.send(`You dont have all the fields! Do ${pre}help mute if you need help!`)
                        return;
                    }
                    let user = message.mentions.users.first()
                    args.shift()
                    let multi, duration
                    let label = args[1].toLowerCase()
                    if ('hours'.startsWith(label)) {
                        multi = 60
                    } else if ('days'.startsWith(label)) {
                        multi = 60 * 24
                    } else {
                        multi = 1
                    }
                    if (isNaN(args[0])) {
                        message.channel.send('That is not a valid duration! If you want infinate put 0.')
                        return;
                    } else {
                        duration = args[0] * multi
                    }
                    args.shift()
                    args.shift()
                    let reason = args.join(' ')
                    if (message.guild.roles.find("name", "Muted") == undefined) {
                        message.guild.createRole({ name: 'Muted' }).then(role => {
                            r.table('Servers').get(message.guild.id).update({ mutedroleid: role.id })
                            message.guild.members.get(user.id).addRole(role)
                        })
                    } else {
                        if (!message.member.roles.find("name", "Muted")) {
                            let role = message.guild.roles.find("name", "Muted")
                            message.guild.members.get(user.id).addRole(role)
                        }
                    }
                    for (let i = 0; i < message.guild.channels.array().length; i++) {
                        let channels = message.guild.channels.array()
                        let role = message.guild.roles.find("name", "Muted")
                        if (channels[i].type == 'text') {
                            channels[i].overwritePermissions(role, { 'SEND_MESSAGES': false })
                        } else if (channels[i].type == 'voice') {
                            channels[i].overwritePermissions(role, { 'SPEAK': false })
                        }
                    }
                    if (duration < 1) {
                        duration = -5
                        message.channel.send(`Muted ${user.username} forever beacause ${reason}.`)
                    } else {
                        message.channel.send(`Muted ${user.username} for ${duration} minutes beacause ${reason}.`)
                    }
                    user.send(`You have been muted on ${message.guild.name} for ${duration} minutes.`)
                    r.table('Punishments').count().run(connection, function (err, count) {
                        r.table('Punishments').insert({ id: count, user: { name: message.mentions.users.first().username, id: message.mentions.users.first().id }, reason: reason, type: 'Mute', length: duration + 1, guild: message.guild.id }).run(connection)
                        let serverwarnings = server.warnings
                        serverwarnings.push({ id: count, name: user.username })
                        r.table('Servers').get(message.guild.id).update({ warnings: serverwarnings }).run(connection)
                        try {
                            if (server.modlog != null) {
                                embed.setTitle(`Case ID: ${count}`)
                                embed.setDescription(`${message.mentions.users.first().username} was muted! | Duration ${duration} minutes`)
                                if (reason != undefined && reason != '') {
                                    embed.addField('Reason:', reason)
                                }
                                embed.setColor(0xffa300)
                                bot.channels.get(server.modlog).send(embed)
                            }
                        } catch (error) { console.error(error) }
                    })
                }
            },
            class unmute {
                constructor() {
                    this.name = ['unmute']
                    this.desc = `**ADMIN COMMAND** Unmutes a user.`
                    this.use = `${pre}unmute [@user]`
                    this.example = `${pre}unmute @Rulebreaker`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (!isadmin(message.author.id)) {
                        message.channel.send('Nice try, but you\'re not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                        return;
                    }
                    let user = message.mentions.users.first()
                    if (server.modlog != null) {
                        embed.setTitle(`Unmuted ${user.username}`)
                        embed.setColor(0x09c001)
                        bot.channels.get(server.modlog).send(embed)
                    }
                    let role = message.guild.roles.find("name", "Muted")
                    message.guild.members.get(user.id).removeRole(role)
                    message.channel.send(`Unmuted ${user.username}`)

                }
            },
            class reportchannel {
                constructor() {
                    this.name = ['reportchannel', 'setreport', 'reportschannel']
                    this.desc = `**ADMIN COMMAND** Sets the report channel.`
                    this.use = `${pre}reportchannel [#channel]`
                    this.example = `${pre}reportchannel #reports`
                    this.online = true
                    this.admin = true
                }
                run() {
                    if (isadmin(message.author.id)) {
                        let channel = message.mentions.channels.first()
                        let rchannel = server.reportchannel
                        if (channel != undefined) {
                            message.channel.send(`Set the reports channel to ${channel.name}.`)
                            r.table('Servers').get(message.guild.id).update({ reportchannel: channel.id }).run(connection)
                        } else {
                            message.channel.send('Please define a channel!')
                        }
                    } else {
                        message.channel.send('Nice try, but you are not an admin!').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class report {
                constructor() {
                    this.name = ['report', 'reportuser']
                    this.desc = `Reports a user for breaking a rule.`
                    this.use = `${pre}report [@user] [rule#/reason]`
                    this.example = `${pre}report @RuleBreaker 1\n
                                    ${pre}report @RuleBreaker Malicious intent`
                    this.online = true
                    this.admin = false
                }
                run() {
                    if (server.reportchannel != null) {
                        embed.setColor(0xff0000)
                        if (args[1] == '') { args.splice(1, 1) }
                        let user = message.mentions.users.first()
                        if (user == undefined) {
                            message.channel.send('Define a user!')
                        } else {
                            if (isadmin(user.id)) {
                                embed.addField(`ADMIN REPORT`, 'The reported user is an admin.')
                            }
                            embed.setTitle(`Report by ${message.author.username} for ${user.username}.`)
                            if (isNaN(args[1]) || args[2] != undefined) {
                                args.shift()
                                let reason = args.join(' ')
                                if (reason == '') {
                                    message.channel.send('Please define a reason or rule.').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                } else {
                                    embed.addField('Reason for report:', reason)
                                    message.channel.send(`Reported ${user.username} for ${reason}`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                    r.table('Punishments').count().run(connection, function (err, count) {
                                        r.table('Punishments').insert({ id: count, user: { name: message.mentions.users.first().username, id: message.mentions.users.first().id }, reason: reason, type: 'Report' }).run(connection)
                                        let serverwarnings = server.warnings
                                        serverwarnings.push({ id: count, name: message.mentions.users.first().username })
                                        r.table('Servers').get(message.guild.id).update({ warnings: serverwarnings }).run(connection)
                                    })
                                }
                            } else {
                                let rule = Math.abs(args[1] - 1)
                                if (server.rules[rule] == undefined) {
                                    message.channel.send('This is not a valid rule!').then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                } else {
                                    embed.addField('Reported rule broken:', `Rule ${rule + 1}: ${server.rules[rule]}.`)
                                    message.channel.send(`Reported ${user.username} for breaking rule ${rule + 1}`).then(msg => {
                                        if (server.deletemessages) {
                                            msg.delete(server.messagetimeout)
                                            message.delete(5000)
                                        }
                                    })
                                    r.table('Punishments').count().run(connection, function (err, count) {
                                        r.table('Punishments').insert({ id: count, user: { name: message.mentions.users.first().username, id: message.mentions.users.first().id }, reason: `Breaking rule: ${server.rules[rule]}`, type: 'Report' }).run(connection)
                                        let serverwarnings = server.warnings
                                        serverwarnings.push({ id: count, name: message.mentions.users.first().username })
                                        r.table('Servers').get(message.guild.id).update({ warnings: serverwarnings }).run(connection)
                                    })
                                }
                            }
                        }
                        embed.setFooter('Once the report is reviewed this message can be deleted.')
                        if (embed.title != undefined) {
                            bot.channels.get(`${server.reportchannel}`).send(embed)
                        }
                    } else {
                        message.channel.send(`There is no report channel set so you can not use this command.`).then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class request {
                constructor() {
                    this.name = ['request', 'requestfeature']
                    this.desc = `Requests a feature for Util.`
                    this.use = `${pre}request [Feature]`
                    this.example = `${pre}request Everything`
                    this.online = true
                    this.admin = false
                }
                run() {
                    let banned = []
                    let user = message.author
                    let request = args.join(' ')
                    embed.setTitle(`New request by ${user.username}!`)
                    embed.setDescription(request)
                    embed.setFooter(`User ID: ${user.id}`)
                    if (banned.indexOf(user.id) == -1) {
                        bot.channels.get('443556582265978881').send(embed)
                    } else {
                        message.channel.send('Sorry, but you have been banned from requesting features through the request command.').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            },
            class bugreport {
                constructor() {
                    this.name = ['reportbug', 'bugreport']
                    this.desc = `Reports a bug with Util, this should never be used though because util is perfect.`
                    this.use = `${pre}reportbug [bug]`
                    this.example = `${pre}reportbug nothing, I just wanted to say how great this is`
                    this.online = true
                    this.admin = false
                }
                run() {
                    let banned = []
                    let user = message.author
                    let request = args.join(' ')
                    embed.setTitle(`New bug report by ${user.username}!`)
                    embed.setDescription(request)
                    embed.setFooter(`User ID: ${user.id}`)
                    if (banned.indexOf(user.id) == -1) {
                        bot.channels.get('443556526175682561').send(embed)
                    } else {
                        message.channel.send('Sorry, but you have been banned from reporting bugs through the bugreport command.').then(msg => {
                            if (server.deletemessages) {
                                msg.delete(server.messagetimeout)
                                message.delete(5000)
                            }
                        })
                    }
                }
            }
        ]
        find(cmd, commands)
        function isadmin(user) {
            if (message.guild.owner == user) return true
            for (let i = 0; i < server.admins.length; i++)
                if (server.admins[i] == user) return true;
            return false;
        }
    })
}