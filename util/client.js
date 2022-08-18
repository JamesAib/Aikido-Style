const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.ready = false;
client.commands = new Collection();
client.cache = { recentlyActive: new Collection(), failed: new Collection() };

const commandFolder = fs.readdirSync('./commands');
for (const folder of commandFolder) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith('.js') && !file.startsWith('-'));
  for (const file of commandFiles) {
    const command = require(`../commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

const eventFiles = fs
  .readdirSync('./events')
  .filter((file) => file.endsWith('.js') && !file.startsWith('-'));

for (const file of eventFiles) {
  const event = require(`../events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

module.exports = client;
