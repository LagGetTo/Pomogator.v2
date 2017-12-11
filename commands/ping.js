module.exports = {
	name: 'ping',
	description: 'Пенг, кэк',
	cooldown: 5,
	execute(message) {
		message.channel.send('Pong.');
	},
};