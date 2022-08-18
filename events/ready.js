const fs = require('fs');
const Keyv = require('keyv');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    await client.application.commands.set(getCommands(), process.env.GUILD_ID);
    console.log(`Commands loaded in guild ${process.env.GUILD_ID}`);

    await loadDatabase(client);
    console.log('Connected to database.');

    client.guild = await client.guilds.fetch(process.env.GUILD_ID);

    await require('../util/logger')(client);
    client.log = async function (params) {
      if (!client.logChannel) return;
      await client.logChannel.send(params);
    };

    require('../util/scheduler')(client);

    client.ready = true;
    console.log('Client ready.');
  },
};

function getCommands() {
  const commands = [];

  const commandFolder = fs.readdirSync('./commands');
  for (const folder of commandFolder) {
    const commandFiles = fs
      .readdirSync(`./commands/${folder}`)
      .filter((file) => file.endsWith('.js') && !file.startsWith('-'));
    for (const file of commandFiles) {
      const command = require(`../commands/${folder}/${file}`);
      commands.push(command.data.toJSON());
    }
  }

  return commands;
}

async function loadDatabase(client) {
  client.db = {};

  client.db.settings = new Keyv('sqlite://data/database.sqlite', {
    namespace: 'settings',
  });
  client.db.settings.on('error', (err) =>
    console.error('Database (settings) connection error:', err)
  );

  client.db.verifying = new Keyv('sqlite://data/database.sqlite', {
    namespace: 'verifying',
  });
  client.db.verifying.on('error', (err) =>
    console.error('Database (verifying) connection error:', err)
  );

  client.db.immune = new Keyv('sqlite://data/database.sqlite', {
    namespace: 'immuneMembers',
  });
  client.db.immune.on('error', (err) =>
    console.error('Database (immuneMembers) connection error:', err)
  );
}
