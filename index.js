require("dotenv").config();
const Discord = require("discord.js");
let Intents = Discord.Intents;
let intents = new Intents(Intents.ALL);
const client = new Discord.Client({ ws: { intents } });
const BOT_TOKEN = process.env.BOT_TOKEN;
const fs = require("fs");
const axios = require("axios");
const requestConfig = require("./request-config.json");
const {
  clear,
  roleId,
  changeMembersRole,
  getArgs,
  getCommand,
  getRoleId,
  updatedRoleId,
  getMembersWithRole,
} = require("./util");

client.on("ready", () => {
  console.log("I am ready!");
});

const prefix = "!";

client.on("message", async (message) => {
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    message.author.username !== "Hary Dhimas Prakoso"
  )
    return;

  const args = getArgs(message, prefix);
  const command = getCommand(message, prefix);
  console.log(command, args);
  switch (command) {
    case "change":
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
    case "apusin":
      clear(message);
      break;
    case "change2":
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
        const username = args.join(" ");
        console.log(username, "<------");
        const member = await message.guild.members.fetch({
          query: "xabiwu",
          force: true,
        });
        console.log(member);
        //console.log(member.first().roles.add('773149870907326485'))
      } catch (error) {
        console.log(error);
      }
      break;
    case "uprole":
      message.channel.send("comming soon!");
      break;
    case "get":
      console.log("hey dhim");
      try {
        if (
          args[0] !== "p1" &&
          args[0] !== "p0" &&
          args[0] !== "p2" &&
          args[0] !== "p3" &&
          args[0] !== "alumni"
        ) {
          message.channel.send("invalid param");
        }
        const id = await roleId(message.guild, args[0]);
        const updateToId = await updatedRoleId(message.guild, args[0]);
        const { data } = await axios({
          method: "post",
          url: process.env.PIPEDREAM_URL,
          data: requestConfig[args[0]],
        });
        const members = await getMembersWithRole(message.guild, id);
        const validMember = [];
        const invalidMember = [];
        members.forEach((member) => {
          const isExist = data.result.filter(
            (student) => student.discordName.trim() === member.user.username
          );
          const memberData = {
            username: member.user.username,
            unique: member.user.discriminator,
            id: member.user.id,
            nickname: member.nickname,
            sheetData: isExist,
          };
          if (isExist.length === 1) {
            // remove role and add role here if student passed
            validMember.push(memberData);
          } else {
            invalidMember.push(memberData);
          }
        });
        fs.writeFileSync(
          `${args[0]}.json`,
          JSON.stringify(validMember, null, 2)
        );
        fs.writeFileSync(
          `${args[0]}-invalid.json`,
          JSON.stringify(invalidMember, null, 2)
        );
      } catch (error) {
        console.log(error);
      }
      // message.channel.send("fetch done");
      break;
    default:
      break;
  }
});

client.login(BOT_TOKEN);
