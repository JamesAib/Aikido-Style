module.exports.execute = async function (i) {
  const val = i.options.getBoolean('usedm');

  await i.client.db.settings.set('usedm', val);

  await i.reply({
    content: `<a:success:998726784361173064> ${
      val
        ? 'Members will be DMed welcome messages from now on!'
        : 'Members will be mentioned in the welcome channel with welcome messages from now on!'
    }`,
    ephemeral: true,
  });
};
