const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setNameLocalization('hu', 'dobj')
		.setDescription('Rolls Shadowrun 4 Anniversary Edition dice pools')
		.setDescriptionLocalization('hu', 'kocka dobó a Shadowrun 4 Anniversary Edition szabályai szerint')
		.addIntegerOption(option => 
			option.setName('dice')
				.setNameLocalization('hu', 'kockák')
				.setRequired(true)
				.setDescription('The number of dice')
				.setDescriptionLocalization('hu', 'A kockák száma')
	),
	async execute(interaction) {
		const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
		const dice = interaction.options.getInteger('dice');
		const rolls = [];
		let ones = 0, hits = 0;
		for (let i = 0; i < dice; i++) {
			const roll = Math.floor(Math.random() * 6) + 1;
			if (roll === 1) ones++;
			if (roll >= 5) hits++;
    		rolls.push(diceFaces[roll-1]);
  		}
		var resp = rolls.join(' ') + ' = ';
		const localResponses = { 
			criticalGlitch: { en: 'critical glitch', hu: 'kritikus hiba' },
			glitch: { en: `glitch with ${hits} hit(s)`, hu: `hiba ${hits} találattal` },
			hits: { en: `${hits} hit(s)`, hu: `${hits} találat(ok)` }
		}
		locale = interaction.locale.substring(0,2);
		if ((dice - ones) <= (dice / 2)) {
			if (hits == 0) resp += localResponses.criticalGlitch[locale];
			else resp += localResponses.glitch[locale];
		} else {
			resp += localResponses.hits[locale];
		}
		interaction.reply(resp);
	},
};
