const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'Перечесление всех команд.',
	aliases: ['помощь'],
	usage: '[имя команды]',
	cooldown: 5,
	execute(message, args) {
		const { commands } = message.client;
		const data = [];

		if (!args.length) {
			data.push('Вот список всех доступных команд:');
			data.push(commands.map(command => command.name).join(' , '));
			data.push(`\nТы можешь написать \`${prefix}help [имя команды]\` чтобы получить информацию о команде!`);
		}
		else {
			if (!commands.has(args[0])) {
				return message.reply('Это недопустимая команда!');
			}

			const command = commands.get(args[0]);

			data.push(`**Название команды:** ${command.name}`);

			if (command.description) data.push(`**Описание:** ${command.description}`);
			//if (command.aliases) data.push(`**Псевдоним:** ${command.aliases.join(' , ')}`);
			if (command.usage) data.push(`**Использование:** ${prefix}${command.name} ${command.usage}`);

			data.push(`**Частота ипользования:** ${command.cooldown || 3} секунд.`);
		}

		message.author.send(data, { split: true })
			.then(() => {
				if (message.channel.type !== 'dm') {
					message.channel.send('Я тебе в лс всё кинул ;)');
				}
			})
			.catch(() => message.reply('Кажется, я не могу писать тебе в лс!'));
	},
};