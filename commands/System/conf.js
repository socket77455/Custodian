const { inspect } = require('util');

/*
FOR GUILD SETTINGS SEE set.js !
This command is used to modify the bot's default configuration values, which affects all guilds. 
If a default setting is not specifically overwritten by a guild, changing a default here will
change it for that guild. The `add` action adds a key to the configuration of every guild in
your bot. The `del` action removes the key also from every guild, and loses its value forever.
*/
const Command = require('../../base/Command.js');

class Conf extends Command {
  constructor(client) {
    super(client, {
      name: 'conf',
      description: 'Modify the default configuration for all guilds.',
      category: 'System',
      usage: 'conf <view/get/edit> <key> <value>',
      guildOnly: true,
      aliases: ['defaults'],
      permLevel: 'Bot Admin'
    });
  }

  async run(message, [action, key, ...value], level) { // eslint-disable-line no-unused-vars
    
  // Retrieve Default Values from the default settings in the bot.
    const defaults = this.client.settings.get('default');
    const settings = this.client.settings.get(message.guild.id);
    const serverLang = `${settings.lang}`;
    const lang = require(`../../languages/${serverLang}/${this.help.category}/${this.help.category}.json`);
    const generalErr = require(`../../languages/${serverLang}/general.json`);
  
    // Adding a new key adds it to every guild (it will be visible to all of them)
    if (action === 'add') {
      if (!key) return message.reply(`${lang.settingsNoKeyAdd}`);
      if (defaults[key]) return message.reply(`${lang.settingsKeyAlrdyExist}`);
      if (value.length < 1) return message.reply(`${lang.settingsNoKeyValue}`);

      // `value` being an array, we need to join it first.
      defaults[key] = value.join(' ');
  
      // One the settings is modified, we write it back to the collection
      this.client.settings.set('default', defaults);
      message.reply(`${key} successfully added with the value of ${value.join(' ')}`);
    } else
  
    // Changing the default value of a key only modified it for guilds that did not change it to another value.
    if (action === 'edit') {
      if (!key) return message.reply(`${lang.settingsNoKeyEdit}`);
      if (defaults[key]) return message.reply(`${lang.settingsKeyAlrdyExist}`);
      if (value.length < 1) return message.reply(`${lang.settingsNoKeyValue}`);

      defaults[key] = value.join(' ');

      this.client.settings.set('default', defaults);
      message.reply(`${key} successfully edited to ${value.join(' ')}`);
    } else
  
    // WARNING: DELETING A KEY FROM THE DEFAULTS ALSO REMOVES IT FROM EVERY GUILD
    // MAKE SURE THAT KEY IS REALLY NO LONGER NEEDED!
    if (action === 'del') {
      if (!key) return message.reply(`${lang.settingsNoKeyDel}`);
      if (!defaults[key]) return message.reply(`${lang.settingsKeyNotExist}`);    
    
      // Throw the 'are you sure?' text at them.
      const response = await this.client.awaitReply(message, `Are you sure you want to permanently delete ${key} from all guilds? This **CANNOT** be undone.`);

      // If they respond with y or yes, continue.
      if (['y', 'yes'].includes(response)) {

      // We delete the default `key` here.
        delete defaults[key];
        this.client.settings.set('default', defaults);
      
        // then we loop on all the guilds and remove this key if it exists.
        // "if it exists" is done with the filter (if the key is present and it's not the default config!)
        for (const [guildid, conf] of this.client.settings.filter((setting, id) => setting[key] && id !== 'default')) {
          delete conf[key];
          this.client.settings.set(guildid, conf);
        }
      
        message.reply(`${key} was successfully deleted.`);
      } else
      // If they respond with n or no, we inform them that the action has been cancelled.
      if (['n','no','cancel'].includes(response)) {
        message.reply('Action cancelled.');
      }
    } else
  
    // Display a key's default value
    if (action === 'get') {
      if (!key) return message.reply(`${lang.settingsNoKeyView}`);
      if (!defaults[key]) return message.reply(`${lang.settingsKeyNotExist}`);
      message.reply(`The value of ${key} is currently ${defaults[key]}`);

      // Display all default settings.
    } else {
      const array = [];
      Object.entries(this.client.settings.get('default')).forEach(([key, value]) => {
        array.push(`${key}${' '.repeat(20 - key.length)}::  ${value}`); 
      });
      await message.channel.send(`= Bot Default Settings =
${array.join('\n')}`, {code: 'asciidoc'});    }
  }
}

module.exports = Conf;