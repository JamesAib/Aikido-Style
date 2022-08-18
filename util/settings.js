const { ActionRowBuilder } = require('discord.js');
const { verificationButton } = require('./base');

module.exports.getVerifiedRole = async function (db, guild) {
  const roleId = await db.settings.get('verifiedRole');

  let role;
  if (roleId) role = await guild.roles.fetch(roleId).catch(() => null);
  else role = null;

  return role;
};

module.exports.getChannel = async function (db, guild, type) {
  const channelId = await db.settings.get(type);

  let channel;
  if (channelId) {
    channel = await guild.channels.fetch(channelId).catch(() => null);
  } else channel = null;

  return channel;
};

module.exports.updateVerificationMessage = async function (db, guild) {
  const { verificationMessage, verificationChannel } =
    await module.exports.getVerificationData(db, guild);

  if (
    !(verificationMessage && verificationMessage.length && verificationChannel)
  )
    return;

  await verificationChannel.send({
    content: verificationMessage.replace(/{server}/g, guild.name),
    components: [new ActionRowBuilder().addComponents([verificationButton])],
  });
};

module.exports.getVerificationData = async function (db, guild) {
  const data = {};
  data.verificationMessage = await db.settings.get('verificationMessage');
  data.verificationChannelId = await db.settings.get('verifyChannel');

  data.verificationChannel = await exports.getChannel(
    db,
    guild,
    'verifyChannel'
  );

  return data;
};
