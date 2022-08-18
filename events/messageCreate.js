module.exports = {
  name: 'messageCreate',
  async execute(msg) {
    msg.client.cache.recentlyActive.set(msg.author.id, Date.now());
  },
};
