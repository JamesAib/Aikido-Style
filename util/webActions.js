const { EmbedBuilder, Colors } = require('discord.js');
const client = require('./client');
const { getChannel } = require('./settings');

module.exports.kickUser = async function (id) {
  if (await client.db.immune.get(id)) return;

  const user = await client.guild.members.fetch(id).catch(() => null);
  if (!user) return;

  let couldKick = true;
  await user
    .kick('Automatic action; VPN usage')
    .catch(() => (couldKick = false));
  if (!couldKick) return;
  await client.log({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setAuthor({ name: 'Kick (VPN Usage)' })
        .setDescription(
          `${user.toString()} \`${user.user.tag}\` \`${user.id}\``
        ),
    ],
  });
  const failedLog = await client.cache.failed.get(id);
  if (failedLog) await client.cache.failed.set(id, failedLog + 1);
  else await client.cache.failed.set(id, 1);
};

module.exports.log500 = async function (err) {
  await client.log({ content: err.stack });
};

module.exports.verifyUser = async function (id) {
  const user = await client.guild.members.fetch(id).catch(() => null);
  if (!user) return;

  let { roles, manual } = await client.db.verifying.get(id);
  roles = new Set(roles);

  roles.delete(await client.db.settings.get('unverifiedRole'));
  roles.add(await client.db.settings.get('verifiedRole'));

  await user.roles.set([...roles], 'Automated action; passed verification');

  const welcomeInDms = await client.db.settings.get('usedm');
  const welcomeMessage = await client.db.settings.get('welcomeMessage');

  let couldMessage = true;
  if (welcomeMessage && !manual) {
    if (welcomeInDms) {
      await user
        .send({
          content: welcomeMessage
            .replace(/{mention}/g, user.toString())
            .replace(/{server}/g, user.guild.name),
        })
        .catch(() => (couldMessage = false));
    } else {
      const welcomeChannel = await getChannel(
        client.db,
        client.guild,
        'welcomeChannel'
      );
      if (welcomeChannel)
        await welcomeChannel.send({
          content: `${welcomeMessage
            .replace(/{mention}/g, user.toString())
            .replace(/{server}/g, user.guild.name)}`,
        });
    }
  }

  await client.db.verifying.delete(id);

  await client.log({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Purple)
        .setAuthor({ name: 'Verified' })
        .setDescription(
          `${user.toString()} \`${user.user.tag}\` \`${user.id}\`${
            welcomeMessage && welcomeInDms && !couldMessage
              ? '\n**Could not DM**'
              : ''
          }`
        )
        .addFields({
          name: 'Roles added',
          value: [...roles].map((id) => `<@&${id}> \`${id}\``).join('\n'),
        }),
    ],
  });
};
