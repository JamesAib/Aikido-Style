const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports.verificationButton = new ButtonBuilder()
  .setEmoji({ id: '998451071125028956' })
  .setLabel('Verify Here')
  .setStyle(ButtonStyle.Link)
  .setURL(process.env.VERIFICATION_URL);
