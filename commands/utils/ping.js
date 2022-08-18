const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  Colors,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Gets the bot's latency")
    .setDMPermission(true)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i) {
    const sent = await i.deferReply({ fetchReply: true });
    const pingEmbed = new EmbedBuilder()
      .setColor(Colors.Yellow)
      .setTitle('🏓 Pong! 🏓')
      .addFields(
        {
          name: 'Roundtrip Latency',
          value: `\`\`\`${sent.createdTimestamp - i.createdTimestamp}ms\`\`\``,
        },
        {
          name: 'API Heartbeat',
          value: `\`\`\`${Math.round(i.client.ws.ping)}ms\`\`\``,
        }
      )
      .setTimestamp();
    i.editReply({ embeds: [pingEmbed], ephemeral: true });
  },
};
