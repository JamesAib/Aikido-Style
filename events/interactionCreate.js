const { InteractionType, InteractionCollector } = require('discord.js');
const message = require('../commands/config/subcmd/message');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.client.ready)
      return await interaction.reply({
        content: 'The bot is not yet loaded. Please try again later.',
        ephemeral: true,
      });
    if (
      !(
        interaction.type === InteractionType.ApplicationCommand ||
        interaction.type === InteractionType.ApplicationCommandAutocomplete
      )
    )
      return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
    }
  },
};
