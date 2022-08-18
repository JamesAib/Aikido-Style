const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  EmbedBuilder,
  Colors,
  RESTJSONErrorCodes,
} = require('discord.js');
const { verificationButton } = require('../../util/base');

module.exports.data = new SlashCommandBuilder()
  .setName('verify')
  .setDescription('Manually request a member to be reverified')
  .addUserOption((o) =>
    o.setName('user').setDescription('The user to verify').setRequired(true)
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

  if (await i.client.db.immune.get(member.id)) {
    return await i.reply({
      content:
        '<:error:998451402810597426> This member is in the Bypass list and does not need to verify!',
      ephemeral: true,
    });
  }

  if (await i.client.db.verifying.get(member.id)) {
    return await i.reply({
      content:
        '<:error:998451402810597426> This member is already in the verification process!',
      ephemeral: true,
    });
  }

  await member.user.send({
    content: (await i.client.db.settings.get('manualverificationMessage'))
      .replace(/{mention}/g, member.user.toString())
      .replace(/{server}/g, i.guild.name),
    components: [new ActionRowBuilder().addComponents([verificationButton])],
  });

  const unverifiedRole = await i.client.db.settings.get('unverifiedRole');
  let missingPermissions = false;
  if (unverifiedRole)
    await member.roles
      .set([unverifiedRole], 'Automated action; manually verifying')
      .catch((e) => {
        if (e.code === RESTJSONErrorCodes.MissingPermissions)
          missingPermissions = true;
        else throw e;
      });
  else
    await member.roles
      .set([], 'Automated action; manually verifying')
      .catch((e) => {
        if (e.code === RESTJSONErrorCodes.MissingPermissions)
          missingPermissions = true;
        else throw e;
      });

  await i.client.db.verifying.set(member.id, {
    time: Date.now(),
    roles: [...(await member.roles.cache.keys())],
    manual: true,
  });

  const removedRoles = missingPermissions
    ? null
    : [...(await member.roles.cache.keys())];
  console.log(removedRoles);
  await i.client.log({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.DarkGreen)
        .setAuthor({ name: 'Manual Verification' })
        .setDescription(
          `${member.toString()} \`${member.user.tag}\` \`${member.id}\`${
            missingPermissions ? '\n**Could not remove all roles**' : ''
          }\n**Initiated by: **${i.member.toString()}`
        )
        .addFields({
          name: 'Roles removed',
          value: removedRoles
            ? removedRoles.map((id) => `<@&${id}> \`${id}\``).join('\n')
            : '**None**',
        }),
    ],
  });

  await i.reply({
    content: '<a:loading:998455943903850507> Verifying member...',
  });
};
