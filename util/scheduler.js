const { Colors, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const logger = require('../util/logger');

module.exports = async function (client) {
  console.log('initScheduler');
  // */20 * * * * * = 20s

  cron.schedule('*/5 * * * * *', async () => {
    console.log('running');
    const timeout =
      ((await client.db.settings.get('timeout')) ?? 1_200) * 1_000;
    const verifiedRole = await client.db.settings.get('verifiedRole');

    for await (const [id, { time }] of client.db.verifying.iterator()) {
      console.log(time, Date.now());
      if (time < Date.now() - timeout) {
        const member = await client.guild.members.fetch(id).catch(() => null);

        await client.db.verifying.delete(id);

        if (!member) return;
        if (await client.db.immune.get(member.id)) return;
        if (await member.roles.cache.has(verifiedRole)) return;

        let couldKick = true;
        await member
          .kick('Automatic action; Failed to verify before timeout')
          .catch(() => (couldKick = false));
      }
    }
  });

  cron.schedule('*/20 * * * * *', () => {
    client.cache.recentlyActive.filter((d) => d < Date.now() - 1200_000);
  });

  cron.schedule('* */6 * * *', async () => {
    client.cache.failed.forEach(async (qty, id) => {
      if (qty >= 3) {
        await client.guild.bans
          .create(id, {
            reason: `Automatic action; failed VPN test ${qty.toString()} times in 6 hours`,
          })
          .catch(() => null);
        await client.log({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setAuthor({ name: 'Ban (Failed verification spam)' })
              .setDescription(
                `${user.toString()} \`${user.user.tag}\` \`${
                  user.id
                }\`\n Spam instances: \`${qty.toString()}\``
              ),
          ],
        });
      }
    });
    client.cache.clear();
  });
};
