const { RichEmbed } = require('discord.js');
const moment = require('moment');

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(oldMessage, newMessage) {
    if (oldMessage.author.bot) {
      return false;
    }
    
    if (!oldMessage.guild) {
      return false;
    }
    
    if (oldMessage.content == newMessage.content) {
      return false;
    }

    if (!oldMessage || !oldMessage.id || !oldMessage.content || !oldMessage.guild) return;
    const channel = oldMessage.guild.channels.find('name', 'raw-logs');
    if (!channel) return;
    channel.send(`\`[${moment(oldMessage.createdAt).format('h:mm:ss')}]\` 📝 ${oldMessage.author.tag} (\`${oldMessage.author.id}\`) Message Edited in **#${oldMessage.channel.name}**:\n**B**: ${oldMessage.cleanContent}\n**N**: ${newMessage.cleanContent}`);
  }
};