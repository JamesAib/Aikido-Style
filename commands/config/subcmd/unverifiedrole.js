module.exports.execute = async function (i) {
  const role = i.options.getRole('role');

  await i.client.db.settings.set('unverifiedRole', role.id);

  await i.reply({
    content: `<a:success:998726784361173064> Your Unverified Role has been set to ${role}`,
    allowedMentions: { parse: [] },
    ephemeral: true,
  });
};
