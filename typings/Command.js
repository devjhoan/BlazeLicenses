class Command {
	/**
	 * @param {{
	 * 	run: (client: import('./Client').Blaze, interaction: import('discord.js').CommandInteraction, args: string[]) => void;
	 * } & import('discord.js').ChatInputApplicationCommandData } options
	 */
	constructor(options) {
		Object.assign(this, options);
	}
}

module.exports = { Command };