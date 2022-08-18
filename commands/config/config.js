const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionType,
  ChannelType,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

/*
 /config verifiedrole (role to assign)
 /config timeout (kick after timeout)
 /config logchannel
 /config welcomechannel (the channel to verify in. When set, send a link in that channel.)
 /config verifmessage (a message to send to users on join)
 /config welcomemessage (a message to send to users on verification)
 /config welcomelocation (choose between DMs and welcome channel. applies to both verif- and welcome- messages)
  (if "welcome channel" is chosen, append a button to properly verify.)
*/
module.exports.data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Configure the bot')
  .addSubcommandGroup((scg) =>
    scg
      .setName('message')
      .setDescription('Set an automatically sendable message')
      .addSubcommand((sc) =>
        sc
          .setName('verification')
          .setDescription('Set the message to post in the verification channel')
      )
      .addSubcommand((sc) =>
        sc
          .setName('manualverification')
          .setDescription(
            'Set the message to send to a member when asked to manually verify'
          )
      )
      .addSubcommand((sc) =>
        sc
          .setName('welcome')
          .setDescription(
            'Set the message to send to a successfully verified user'
          )
      )
  )
  .addSubcommandGroup((scg) =>
    scg
      .setName('channel')
      .setDescription("Set one of the bot's channels")
      .addSubcommand((sc) =>
        sc
          .setName('log')
          .setDescription("Set the channnel for the bot's logs")
          .addChannelOption((o) =>
            o
              .setName('channel')
              .setDescription('The channel to send logs in')
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true)
          )
      )
      .addSubcommand((sc) =>
        sc
          .setName('verify')
          .setDescription(
            'Set the channnel for the verification message to send in and members to verify in'
          )
          .addChannelOption((o) =>
            o
              .setName('channel')
              .setDescription('The channel to verify members in')
              .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
              .setRequired(true)
          )
      )
      .addSubcommand((sc) =>
        sc
          .setName('welcome')
          .setDescription('Set the channnel for the welcome message to send in')
          .addChannelOption((o) =>
            o
              .setName('channel')
              .setDescription('The channel to welcome members in')
              .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
              .setRequired(true)
          )
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName('welcomeindms')
      .setDescription(
        'Selects whether to DM or use the verification channel to welcome a member.'
      )
      .addBooleanOption((o) =>
        o
          .setName('usedm')
          .setDescription(
            'DMs a member the welcome message. If set to false, mentions the member in the verification channel.'
          )
          .setRequired(true)
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName('timeout')
      .setDescription('Sets the amount of time a member has to verify')
      .addIntegerOption((o) =>
        o
          .setName('timeout')
          .setDescription('The time a member has to verify')
          .setRequired(true)
          .setAutocomplete(true)
          .setMinValue(120)
          .setMaxValue(86400)
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName('verifiedrole')
      .setDescription('Sets the role a member will be given when they verify')
      .addRoleOption((o) =>
        o
          .setName('role')
          .setDescription('The role to assign upon verification')
          .setRequired(true)
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName('unverifiedrole')
      .setDescription('Sets the role a member will lose when they verify')
      .addRoleOption((o) =>
        o
          .setName('role')
          .setDescription('The role to deassign upon verification')
          .setRequired(true)
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName('list')
      .setDescription('Lists the current configuration of the bot')
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions('0');

let subcmds = {};
fs.readdirSync(path.join(__dirname, 'subcmd')).forEach((file) => {
  const cmd = require(path.join(__dirname, 'subcmd', file));
  subcmds[file.replace('.js', '')] = cmd.execute;
});
const timeout = require(path.join(__dirname, 'subcmd', 'timeout'));

module.exports.execute = async function (interaction) {
  if (
    interaction.options.getSubcommand() === 'timeout' &&
    interaction.type === InteractionType.ApplicationCommandAutocomplete
  ) {
    return await timeout.autocomplete(interaction);
  } else {
    const cmd =
      interaction.options.getSubcommandGroup() ??
      interaction.options.getSubcommand();

    return await subcmds[cmd](interaction);
  }
};
