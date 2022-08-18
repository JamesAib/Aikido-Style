const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} = require('discord.js');

module.exports.data = new SlashCommandBuilder()
  .setName('bypass')
  .setDescription('Select a member to prevent them from needing to verify')
  .addUserOption((o) =>
    o.setName('user').setDescription('The user to bypass').setRequired(true)
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions(
    PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers
  );

module.exports.execute = async function (i) {
  const member = await i.options.getMember('user');

  if (!member) {
    return await i.reply({
      content: '<:error:998451402810597426> Member not found!',
      ephemeral: true,
    });
  }
  await i.client.db.verifying.delete(member.id);

  const verifiedRole = await i.client.db.settings.get('verifiedRole');
  if (verifiedRole && !member.roles.cache.has(verifiedRole))
    await member.roles.add(
      verifiedRole,
      'Automated action; bypassed verification'
    );

  const unverifiedRole = await i.client.db.settings.get('unverifiedRole');
  if (unverifiedRole && member.roles.cache.has(unverifiedRole))
    await member.roles.remove(
      unverifiedRole,
      'Automated action; bypassed verification'
    );

  await i.reply({
    content: `<a:loading:998455943903850507> ${member} has bypassed verification!`,
    ephemeral: true,
  });

  await i.client.log({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setAuthor({ name: 'Bypass' })
        .setDescription(
          `${member.toString()} \`${member.user.tag}\` \`${
            member.id
          }\`\n**Bypassed by: **${i.member.toString()}`
        ),
    ],
  });
};
