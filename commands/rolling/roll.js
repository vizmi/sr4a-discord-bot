const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const localResponses = { 
	criticalGlitch: { en: 'critical glitch', hu: 'kritikus hiba' },
	glitch: { en: 'hit(s) with glitch', hu: 'találat hibával' },
	hits: { en: 'hit(s)', hu: 'találat' },
	reroll: { en: 'Reroll with Edge', hu: 'Újradobom Mázlival' },
	keep: { en: 'Keep', hu: 'Megtartom' }
}

const roll_die = (sixes) => {
	if (!sixes) return [ Math.floor(Math.random() * 6) + 1 ];
	const rolls = []
	let roll = Math.floor(Math.random() * 6) + 1;
	while (roll == 6) {
		rolls.push(roll);
		roll = Math.floor(Math.random() * 6) + 1;
	}
	rolls.push(roll);
	return rolls;
}

const roll = (dice, sixes) => {
	const rolls = []
	for (let i = 0; i < dice; i++) {
		rolls.push(...roll_die(sixes));
	}
	return rolls;
}

const respond = (dice, rolls, locale) => {
	// build text response
	let ones = rolls.reduce((c, r) => r === 1 ? c+1 : c, 0); 
	let hits = rolls.reduce((c, r) => r >= 5 ? c+1 : c, 0); 
	let resp = rolls.map(roll => `[${roll}]`).join(' ') + ' = ';

	// main SR4 logic
	if ((dice - ones) <= (dice / 2)) {
		if (hits == 0) resp += localResponses.criticalGlitch[locale];
		else resp += hits + ' ' + localResponses.glitch[locale];
	} else {
		resp += hits + ' ' + localResponses.hits[locale];
	}
	return resp;
}

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
		)
		.addBooleanOption(option =>
			option.setName('edge')
				.setNameLocalization('hu', 'mázli')
				.setRequired(false)
				.setDescription('Did you use Edge?')
				.setDescriptionLocalization('hu', 'Használtál Mázlit?')
		),
	async execute(interaction) {

		// roll dice, count hits and ones
		let dice = interaction.options.getInteger('dice');
		const edge = interaction.options.getBoolean('edge') || false;
		const rolls = roll(dice, edge);
		const locale = interaction.locale.substring(0,2);
		let resp = respond(dice, rolls, locale);

		// build reroll button if needed
		if (edge) {
			interaction.reply({ content: resp });
		} else {
			const reroll = new ButtonBuilder()
				.setCustomId('reroll')
				.setLabel(localResponses.reroll[locale])
				.setStyle(ButtonStyle.Primary);
			const keep = new ButtonBuilder()
				.setCustomId('keep')
				.setLabel(localResponses.keep[locale])
				.setStyle(ButtonStyle.Secondary);
			const row = new ActionRowBuilder().addComponents(reroll, keep);
			const response = await interaction.reply({ content: resp, components: [row] });

			// reacting the reroll/keep button
			const collectorFilter = i => i.user.id === interaction.user.id;
			try {
				const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 30_000 });
				if (confirmation.customId === 'reroll') {
					// rerolls start with the successes from the OG roll
					rerolls = rolls.filter(r => r >= 5);
					rerolls.push(...roll(rolls.length - rerolls.length, false));
					resp = respond(dice, rerolls, locale);
					await interaction.editReply({ content: resp, components: [] });
				} else if (confirmation.customId === 'keep') {
					await interaction.editReply({ content: resp, components: [] });
				}
			} catch (e) {
				await interaction.editReply({ content: resp, components: [] });
			}
		}

	},
};
