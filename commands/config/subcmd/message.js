const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const settingsUtil = require('../../../util/settings');

const prettifySubcommand = {
  verification: 'Verification Message',
  welcome: 'Welcome Message',
  manualverification: 'Manual Verification Message',
};

module.exports.execute = async function (i) {
  const subcommand = i.options.getSubcommand();

  const modal = new ModalBuilder()
    .setTitle(prettifySubcommand[subcommand])
    .setCustomId(Date.now() + '.' + i.user.id)
    .addComponents(
      new ActionRowBuilder().setComponents(
        new TextInputBuilder()
          .setLabel('Message')
          .setCustomId('m-1')
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph)
      )
    );

  await i.showModal(modal);

  const submission = await i.awaitModalSubmit({ time: 600_000 });
  const message = submission.fields.getTextInputValue('m-1');

  await i.client.db.settings.set(`${subcommand}Message`, message);

  await submission.reply({
    content: `<a:success:998726784361173064> Your ${
      prettifySubcommand[subcommand]
    } has been set to the following: \`\`\`${
      message.length >= 1000 ? `${message.slice(0, 997)}...` : message
    }\`\`\``,
    ephemeral: true,
  });

  if (subcommand === 'verification')
    await settingsUtil.updateVerificationMessage(i.client.db, i.guild);
  else return;
};
