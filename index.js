require('dotenv').config();
const client = require('./util/client');

async function initialize() {
  client.login(process.env.DISCORD_TOKEN);
  require('./web/app');
}

initialize();
