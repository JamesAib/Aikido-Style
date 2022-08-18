const ms = require('ms');

module.exports.execute = async function (i) {
  const timeout = i.options.getInteger('timeout');
  await i.client.db.settings.set(`timeout`, timeout);

  await i.reply({
    content: `<a:success:998726784361173064> Members will now be kicked if they don\'t complete the verification in ${ms(
      timeout * 1000,
      { long: true }
    )}.`,
    ephemeral: true,
  });
};

module.exports.autocomplete = async function (i) {
  return await i.respond([
    { name: '2 minutes', value: 120 },
    { name: '5 minutes', value: 600 },
    { name: '10 minutes', value: 1_200 },
    { name: '30 minutes', value: 3_600 },
    { name: '1 hour', value: 7_200 },
    { name: '3 hours', value: 21_600 },
    { name: '6 hours', value: 43_200 },
    { name: '12 hours', value: 86_400 },
  ]);
};
