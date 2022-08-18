const { EmbedBuilder } = require('discord.js');
const settingsUtil = require('../../../util/settings');
const ms = require('ms');

module.exports.execute = async function (i) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: 'Current Configuration' })
    .setColor(0xfff000);
  const verificationData = await settingsUtil.getVerificationData(
    i.client.db,
    i.guild
  );
  embed.addFields({
    name: 'Verification Channel',
    value: verificationData.verificationChannel
      ? verificationData.verificationChannel.toString()
      : verificationData.verificationChannelId
      ? `Deleted (${verificationData.verificationChannelId})`
      : 'Not set',
  });

  const logChannelId = await i.client.db.settings.get('logChannel');
  const logChannel = await settingsUtil.getChannel(
    i.client.db,
    i.guild,
    'logChannel'
  );

  embed.addFields({
    name: 'Logging Channel',
    value: logChannel
      ? logChannel.toString()
      : logChannelId
      ? `Deleted (${logChannelId})`
      : 'Not set',
  });

  const timeout = await i.client.db.settings.get('timeout');
  embed.addFields({
    name: 'Timeout Duration',
    value: timeout ? ms(timeout * 1000, { long: true }) : 'Not set',
  });

  const verifiedRoleId = await i.client.db.settings.get('verifiedRole');
  const verifiedRole = await settingsUtil.getVerifiedRole(i.client.db, i.guild);
  embed.addFields({
    name: 'Verified Role',
    value: verifiedRole
      ? verifiedRole.toString()
      : verifiedRoleId
      ? `Deleted (${verifiedRoleId})`
      : 'Not set',
  });

  const useDm = await i.client.db.settings.get('usedm');
  embed.addFields({
    name: 'Welcome Location',
    value: useDm ? 'Sent to DMs' : 'Mentioned in Welcome Channel',
  });

  embed.addFields({
    name: 'Verification Message',
    value: verificationData.verificationMessage
      ? verificationData.verificationMessage.length >= 512
        ? verificationData.verificationMessage.slice(0, 509) + '...'
        : verificationData.verificationMessage
      : 'Not set',
  });

  const welcomeMessage = await i.client.db.settings.get('welcomeMessage');
  embed.addFields({
    name: 'Welcome Message',
    value: welcomeMessage
      ? welcomeMessage.length >= 512
        ? welcomeMessage.slice(0, 509) + '...'
        : welcomeMessage
      : 'Not set',
  });

  await i.reply({
    embeds: [embed],
    ephemeral: true,
  });
};
