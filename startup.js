const { ShardingManager } = require('discord.js');
const shard = new ShardingManager('./app.js', {
  token: 'NDY3NTU3MTY1MzA2MjE2NDQ5.DjwbrQ.JpByHrBB2ljfN4t2F5f96rl3pL8',
  autoSpawn: true
});

shard.spawn(2);

shard.on('launch', shard => console.log(`[SHARD] Shard ${shard.id}/${shard.totalShards}`));