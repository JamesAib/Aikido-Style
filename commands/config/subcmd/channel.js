const settingsUtil = require('../../../util/settings');
const createLogger = require('../../../util/logger');

module.exports.execute = async function (i) {
  const subcommand = i.options.getSubcommand();
  const channel = i.options.getChannel('channel');
  if (subcommand === 'verify') {
    await i.client.db.settings.set('verifyChannel', channel.id);

    await i.reply({
      content: `<a:success:998726784361173064> Your Verification Channel has been set to ${channel}`,
      ephemeral: true,
    });

    await settingsUtil.updateVerificationMessage(i.client.db, i.guild);
  } else if (subcommand === 'log') {
    await createLogger(i.client, channel);
    await i.client.log({
      content: `<a:success:998726784361173064> Logger configured`,
    });
    await i.reply({
      content: `<a:success:998726784361173064> Logger created in ${channel}`,
      ephemeral: true,
    });
  } else {
    await i.client.db.settings.set('welcomeChannel', channel.id);

    await i.reply({
      content: `<a:success:998726784361173064> Your Welcome Channel has been set to ${channel}`,
      ephemeral: true,
    });
  }
};
