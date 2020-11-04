require("dotenv").config();
const Discord = require("discord.js");
let Intents = Discord.Intents;
let intents = new Intents(Intents.ALL);
const client = new Discord.Client({ ws: { intents } });
const BOT_TOKEN = process.env.BOT_TOKEN;
const {
  clear,
  changeMembersRole,
  getArgs,
  getCommand,
  getRoleId,
  getMembersWithRole,
} = require("./util");

client.on("ready", () => {
  console.log("I am ready!");
});

const prefix = "!";

client.on("message", async (message) => {
  if (!message.content.startsWith(prefix)) return;

  const args = getArgs(message, prefix);
  const command = getCommand(message, prefix);

  switch (command) {
    case "change":
      // kekurangan cara ini members didapat dari hasil cache jadi bisa saja members yang di get belum terupdate
      try {
        if (args.length !== 2) {
          message.channel.send("invalid arguments");
          return console.log(`invalid arguments`);
        }
        const roleId = await getRoleId(message.guild, args[0]);
        const roleUpdateId = await getRoleId(message.guild, args[1]);
        const members = await getMembersWithRole(message.guild, roleId);
        await changeMembersRole(members, roleId, roleUpdateId);
        message.channel.send("done changing user roles");
      } catch (error) {
        console.log(error);
      }
      break;
    case "clear":
      clear(message);
      break;
    case "change2":
      // kelebihan cara ini members didapat dari hasil cache jadi members sudah paling terupdate
      // kekurangan tidak bisa findbyRole jadi musti satu2 di cek rolenya , members dapet semua members di guild
      try {
        if (args.length !== 2) {
          message.channel.send("invalid arguments");
          return console.log(`invalid arguments`);
        }
        const members = await message.guild.members.fetch({
          force: true,
        });
        const roleId = await getRoleId(message.guild, args[0]);
        const roleUpdateId = await getRoleId(message.guild, args[1]);
        members.forEach(async (member) => {
          let exist = false;
          member._roles.forEach((role) => {
            if (role === roleId) {
              exist = true;
            }
          });
          if (exist) {
            await member.roles.remove(roleId);
            await member.roles.add(roleUpdateId);
          }
        });
        message.channel.send("done changing user roles - 2");
      } catch (error) {
        console.log(error);
      }
      break;
    case "find":
      try {
        if (args.length === 0) {
          message.channel.send("invalid arguments");
          return console.log(`invalid arguments`);
        }
        const username = args.join(' ')
        console.log(username)
        const member = await message.guild.members.fetch({
          user: {
            username
          },
          force: true,
          limit: 1
        });
        console.log(member)
      } catch (error) {
        console.log(error);
      }
    break;
    default:
      break;
  }
});

client.login(BOT_TOKEN);
