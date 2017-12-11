const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands');
console.log('~~~~~~~~~~~');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
  console.log(`Команда ${command.name} успешно загружена!`);
}

const cooldowns = new Discord.Collection();

client.on('ready', () => { 
  console.log(`-------------------------------------`);
  console.log(`Pomogator v2 включен. Всего команд: ${commandFiles.length}`);
  client.user.setGame('Напиши !help');
});

client.on('guildMemberAdd',member =>{
  const channel = member.guild.channels.find('name', 'member-log');
  const puti = member.guild.roles.find('name', 'Пути');
  if (!puti) member.guild.createRole({name: 'Пути'});
    if (!channel) member.guild.createChannel('member-log','text');
    channel.send({embed:{
    color: 311111,
    description: `${member}`,
    timestamp: '2017-12-10T13:43:31.205Z',
    footer: {
      "text": 'Пользователь присоединился к серверу'
    }
  }});
  member.addRole(puti);  
});

client.on('guildMemberRemove',member =>{
  const channel = member.guild.channels.find('name', 'member-log');
  if(!channel) return;
    channel.send({embed:{
    color: 13333333,
    description: `${member}`,
    timestamp: '2017-12-10T19:42:55+03:00', 
    footer: {
      "text": 'Пользователь покинул сервер'
    }
  }});
});

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
      || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.args && !args.length) {
      let reply = `Ты просишь выполнить команду, но не указываешь аргументы, ${message.author}!`;

      if (command.usage) {
          reply += `\nПравильное использование будет: \`${prefix}${command.name} ${command.usage}\``;
      }

      return message.channel.send(reply);
  }

  if (!client.commands.has(commandName)) return;

  if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (!timestamps.has(message.author.id)) {
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }
  else {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(`Пожалуйста, погоди ещё ${timeLeft.toFixed(1)} секунд перед тем как снова использовать команду \`${command.name}\`.`);
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  try {
    command.execute(message, args);
  }
  catch (error) {
    console.error(error);
    message.reply('Произошла ошибка при попытке выполнить эту команду!');
  }
});

client.login(token);