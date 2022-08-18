const { Collection } = require('discord.js');
const { getChannel } = require('../util/settings');

module.exports = {
  name: 'guildMemberAdd',
  async execute(mem) {
    if (mem.bot) return;
    const verifyChannel = await getChannel(
      mem.client.db,
      mem.guild,
      'verifyChannel'
    );

    if (verifyChannel) {
      const ping = await verifyChannel.send({ content: mem.toString() });
      await ping.delete();
    }
    await mem.client.db.verifying.set(mem.id, {
      time: Date.now(),
      roles: [],
    });
  },
};
