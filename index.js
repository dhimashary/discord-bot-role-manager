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
  kickMembers,
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
  console.log("test");
  const args = getArgs(message, prefix);
  const command = getCommand(message, prefix);
  switch (command) {
    case "validate":
      // make sure to run find command before running this command
      if (args[0] !== "p1" && args[0] !== "p0" && args[0] !== "p2") {
        return message.channel.send(
          "invalid first param only p0, p1, p2 is valid"
        );
      } else if (
        args[1] !== "failed" &&
        args[1] !== "passed" &&
        args[1] !== "repeat"
      ) {
        return message.channel.send(
          "invalid second param only failed, passed, repeat is valid"
        );
      }
      const { data } = JSON.parse(
        fs.readFileSync(`${args[0]}/${args[0]}-${args[1]}.json`, "utf-8")
      );
      const sheet = JSON.parse(
        fs.readFileSync(`${args[0]}/${args[0]}-sheet.json`, "utf-8")
      );
      if (args[1] === "failed") {
        args[1] = "drop out";
      }
      const expectedData = sheet.data.filter(
        (item) => item.status.toLowerCase() === args[1]
      );
      const missingPerson = [];
      let total = 0;
      expectedData.forEach((student, i) => {
        const isExist = data.filter(
          (item) => student.name === item.sheetData[0].name
        );
        if (!isExist.length) {
          missingPerson.push(student);
        } else {
          total++;
        }
      });
      console.log(missingPerson, total, expectedData.length);
      return message.channel.send(
        `request done, total: ${total}, expected: ${expectedData.length}`
      );
      break;
    case "find":
      try {
        if (
          args[0] !== "p1" &&
          args[0] !== "p0" &&
          args[0] !== "p2" &&
          args[0] !== "p3" &&
          args[0] !== "alumni"
        ) {
          return message.channel.send("invalid param");
        }
        const id = await roleId(message.guild, args[0]);
        const { data } = await axios({
          method: "post",
          url: process.env.PIPEDREAM_URL,
          data: requestConfig[args[0]],
        });
        const members = await getMembersWithRole(message.guild, id);
        const validMember = [];
        const invalidMember = [];
        const passingMember = [];
        const failedMember = [];
        const repeatMember = [];
        const withdrawMember = [];
        members.forEach(async (member) => {
          const isExist = data.result.filter(
            (student) => student.discordName.trim() === member.user.id
          );
          const memberData = {
            username: member.user.username,
            unique: member.user.discriminator,
            id: member.user.id,
            nickname: member.nickname,
            sheetData: isExist,
          };
          if (isExist.length > 0) {
            const status = isExist[0].status.toLowerCase();
            if (status === "passed") {
              passingMember.push(memberData);
            } else if (status === "repeat") {
              repeatMember.push(memberData);
            } else if (status === "failed" || status === "drop out") {
              failedMember.push(memberData);
            } else if (status === "withdraw") {
              withdrawMember.push(memberData);
            }
            validMember.push(memberData);
          } else {
            invalidMember.push(memberData);
          }
        });
        fs.writeFileSync(
          `${args[0]}/${args[0]}.json`,
          JSON.stringify(
            { data: validMember, total: validMember.length },
            null,
            2
          )
        );
        fs.writeFileSync(
          `${args[0]}/${args[0]}-sheet.json`,
          JSON.stringify(
            { data: data.result, total: data.result.length },
            null,
            2
          )
        );
        fs.writeFileSync(
          `${args[0]}/${args[0]}-invalid.json`,
          JSON.stringify(
            { data: invalidMember, total: invalidMember.length },
            null,
            2
          )
        );
        fs.writeFileSync(
          `${args[0]}/${args[0]}-repeat.json`,
          JSON.stringify(
            { data: repeatMember, total: repeatMember.length },
            null,
            2
          )
        );
        fs.writeFileSync(
          `${args[0]}/${args[0]}-failed.json`,
          JSON.stringify(
            { data: failedMember, total: failedMember.length },
            null,
            2
          )
        );
        fs.writeFileSync(
          `${args[0]}/${args[0]}-passed.json`,
          JSON.stringify(
            { data: passingMember, total: passingMember.length },
            null,
            2
          )
        );
        fs.writeFileSync(
          `${args[0]}/${args[0]}-withdraw.json`,
          JSON.stringify(
            { data: withdrawMember, total: withdrawMember.length },
            null,
            2
          )
        );
        return message.channel.send("request done");
      } catch (error) {
        console.log(error);
      }
      break;
    case "graduate":
      try {
        const id = await getRoleId(message.guild, "student-phase3");
        console.log(id, "<<<<<<");
        const updateToId = await getRoleId(message.guild, "student-alumni");
        console.log(updateToId, "<---------------------");
        const members = await getMembersWithRole(message.guild, id);
        await changeMembersRole(members, id, updateToId);
        console.log("done");
        return message.channel.send(
          "request done"
        );
      } catch (error) {
        console.log(error, "xxxxx");
        return message.channel.send(
          "An error occured"
        );
      }
      break;
    case "execute":
      try {
        if (args[0] !== "p1" && args[0] !== "p0" && args[0] !== "p2") {
          message.channel.send("invalid param");
        } else if (args[1] !== "failed" && args[1] !== "passed") {
          return message.channel.send(
            "invalid second param only failed, passed, repeat is valid"
          );
        }
        message.channel.send("proccessing request");
        const id = await roleId(message.guild, args[0]);
        const updateToId = await updatedRoleId(message.guild, args[0]);
        const { data } = await axios({
          method: "post",
          url: process.env.PIPEDREAM_URL,
          data: requestConfig[args[0]],
        });
        if (args[0] !== "p0" && args[1] === "failed") {
          args[1] = "drop out";
        }
        const filteredStudent = data.result.filter(
          (student) => student.status.toLowerCase() === args[1].toLowerCase()
        );
        const promiseMembers = filteredStudent.map((student) => {
          return message.guild.members.fetch(student.discordName);
        });
        const members = await Promise.all(promiseMembers);
        let promisesAction = [];
        if (
          args[1].toLowerCase() === "drop out" ||
          args[1].toLowerCase() === "failed"
        ) {
          promisesAction = members.map((student) => {
            return student.kick();
          });
        } else {
          for (let i = 0; i < members.length; i++) {
            promisesAction.push(members[i].roles.add(updateToId));
            promisesAction.push(members[i].roles.remove(id));
          }
        }
        await Promise.all(promisesAction);
        message.channel.send("request done");
      } catch (error) {
        console.log(error);
      }
      break;
    case "tendang":
      // make sure to run find command before running this command
      try {
        if (args[0] !== "alumni" && args[0] !== "invalid") {
          message.channel.send("invalid param");
        } else if (
          args[0] === "invalid"
        ) {
          if (args[1] !== "p0" &&
          args[1] !== "p1" &&
          args[1] !== "p2") {
            return message.channel.send(
              "invalid second param  (option: invalid, p0, p1, p2)"
            );
          }
        }

        if (args[0] === "alumni") {
          const id = await getRoleId(message.guild, "student-alumni");
          const members = await getMembersWithRole(message.guild, id);
          console.log(members)
          // await kickMembers(members);
          return message.channel.send("Request done");
        } else {
          const { data } = await axios({
            method: "post",
            url: process.env.PIPEDREAM_URL,
            data: requestConfig[args[1]],
          });
          const id = await roleId(message.guild, args[1]);
          const members = await getMembersWithRole(message.guild, id);
          const invalidMembers = [];
          members.forEach((member) => {
            const isExist = data.result.filter(
              (student) => student.discordName.trim() === member.user.id
            );
            if (!isExist.length) {
              console.log(member, "<-----");
              invalidMembers.push(member);
            }
          });
          console.log(invalidMembers.length);
          // await kickMembers(invalidMembers)
          return message.channel.send("Request done");
        }
      } catch (error) {
        console.log(error);
        return message.channel.send("An error occured");
      }
      break;
    default:
      break;
  }
});

client.login(BOT_TOKEN);
