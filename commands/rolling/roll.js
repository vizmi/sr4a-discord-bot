const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { t } = require('../../locales');

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
		if (hits == 0) resp += t('criticalGlitch', locale);
		else resp += hits + ' ' + t('glitch', locale);
	} else {
		resp += hits + ' ' + t('hits', locale);
	}
	return resp;
}

module.exports = {
	// exposed for unit testing; not part of the command's public interface
	roll_die,
	roll,
	respond,
	// real public interface
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
				.setMinValue(1)
				.setMaxValue(100)
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
				.setLabel(t('reroll', locale))
				.setStyle(ButtonStyle.Primary);
			const keep = new ButtonBuilder()
				.setCustomId('keep')
				.setLabel(t('keep', locale))
				.setStyle(ButtonStyle.Secondary);
			const row = new ActionRowBuilder().addComponents(reroll, keep);
			const response = await interaction.reply({ content: resp, components: [row] });

			// reacting the reroll/keep button
			const collectorFilter = i => i.user.id === interaction.user.id;
			try {
				const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 30_000 });
				if (confirmation.customId === 'reroll') {
					// rerolls start with the successes from the OG roll
					const rerolls = rolls.filter(r => r >= 5);
					rerolls.push(...roll(rolls.length - rerolls.length, false));
					resp = respond(dice, rerolls, locale);
					await interaction.editReply({ content: resp, components: [] });
				} else if (confirmation.customId === 'keep') {
					await interaction.editReply({ content: resp, components: [] });
				}
			} catch {
				await interaction.editReply({ content: resp, components: [] });
			}
		}

	},
};
