module.exports = async function (client, channel = null) {
  if (channel) {
    client.logChannel = channel;
    return await client.db.settings.set('logChannel', channel.id);
  }

  const currentChannelId = await client.db.settings.get('logChannel');
  if (currentChannelId) {
    const currentChannel = await client.guild.channels.fetch(currentChannelId);
    if (currentChannel) client.logChannel = currentChannel;
    return;
  }
};
