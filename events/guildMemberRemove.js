module.exports = {
  name: 'guildMemberRemove',
  async execute(mem) {
    mem.client.db.verifying.delete(mem.id);
    mem.client.cache.recentlyActive.delete(mem.id);
    mem.client.cache.failed.delete(mem.id);
  },
};
