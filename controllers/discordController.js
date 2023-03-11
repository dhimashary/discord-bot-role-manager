const axios = require("axios");
const requestConfig = require("../request-config.json");
const fs = require("fs");
const {
  roleId,
  changeMembersRole,
  getRoleId,
  kickMembers,
  updatedRoleId,
  getMembersWithRole,
} = require("../util");

module.exports = {
  userAndPrefixAuthentication(message, prefix) {
    if (
      !message.content.startsWith(prefix) ||
      message.author.bot ||
      message.author.username !== "Hary Dhimas Prakoso"
    ) {
      return false;
    } else {
      return true;
    }
  },
  async findDiscordAndSheetMembersByPhase(message, args) {
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
      const cutiMember = [];
      const uncompleteData = [];
      members.forEach(async (member) => {
        const isExist = data.result.filter(
          (student) => student.discordId.trim() === member.user.id
        );
        const memberData = {
          username: member.user.username,
          unique: member.user.discriminator,
          id: member.user.id,
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
          } else if (status === "cuti") {
            cutiMember.push(memberData);
          }

          if (
            !isExist[0].discordId ||
            !isExist[0].github ||
            !isExist[0].status ||
            !isExist[0].wakatime
          ) {
            uncompleteData.push(memberData);
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
        `${args[0]}/${args[0]}-uncomplete.json`,
        JSON.stringify(
          { data: uncompleteData, total: uncompleteData.length },
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
      fs.writeFileSync(
        `${args[0]}/${args[0]}-cuti.json`,
        JSON.stringify({ data: cutiMember, total: cutiMember.length }, null, 2)
      );
      return message.channel.send("request fetch done");
    } catch (error) {
      console.log(error);
      return message.channel.send(
        "an error occured please check your terminal"
      );
    }
  },
  validatePhaseTotalMemberByStatus(message, args) {
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
    if (args[1] === "failed" && args[0] !== "p0") {
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
      `request done, total on Discord: ${total}, expected: ${expectedData.length}, see terminal for complete log`
    );
  },
  async graduatePhaseThreeMembers(message) {
    try {
      message.channel.send("Wait a minute ...");
      const id = await getRoleId(message.guild, "student-phase3");
      const updateToId = await getRoleId(message.guild, "student-alumni");
      const members = await getMembersWithRole(message.guild, id);
      await changeMembersRole(members, id, updateToId);
      return message.channel.send("request done");
    } catch (error) {
      return message.channel.send("An error occured");
    }
  },
  async changeStudentRole(message, args) {
    try {
      if (
        args[0] !== "p1" &&
        args[0] !== "p0" &&
        args[0] !== "p2" &&
        args[0] !== "student-new"
      ) {
        message.channel.send("invalid param");
      } else if (args[1] !== "failed" && args[1] !== "passed") {
        return message.channel.send(
          "invalid second param only failed, passed is valid"
        );
      }
      message.channel.send("proccessing request ...");
      // student-new
      const id = await roleId(message.guild, args[0]);
      const updateToId = await updatedRoleId(message.guild, args[0]);
      const members = await getMembersWithRole(message.guild, id);
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
      let promisesStudent = [];
      members.forEach((member) => {
        const isExist = filteredStudent.filter(
          (student) => student.discordId.trim() === member.user.id
        );
        if (isExist.length === 1 || args[0] === "student-new") {
          promisesStudent.push(member);
        }
      });
      let promisesAction = [];
      if (
        args[1].toLowerCase() === "drop out" ||
        (args[1].toLowerCase() === "failed" && args[0] !== "student-new")
      ) {
        promisesAction = promisesStudent.map((student) => {
          return student.kick();
        });
      } else {
        for (let i = 0; i < promisesStudent.length; i++) {
          promisesAction.push(promisesStudent[i].roles.add(updateToId));
          promisesAction.push(promisesStudent[i].roles.remove(id));
        }
      }
      await Promise.all(promisesAction);
      message.channel.send("request done");
    } catch (error) {
      console.log(error);
      message.channel.send("error occured");
    }
  },
  async kickInvalidMembersOrAlumni(message, args) {
    try {
      if (args[0] !== "alumni" && args[0] !== "invalid") {
        message.channel.send("invalid param");
      } else if (args[0] === "invalid") {
        if (args[1] !== "p0" && args[1] !== "p1" && args[1] !== "p2") {
          return message.channel.send(
            "invalid second param  (option: invalid, p0, p1, p2)"
          );
        }
      }
      message.channel.send("Tunggu sebentar ya Oniichan~");
      if (args[0] === "alumni") {
        const id = await getRoleId(message.guild, "student-alumni");
        const members = await getMembersWithRole(message.guild, id);
        await kickMembers(members);
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
            (student) => student.discordId.trim() === member.user.id
          );
          if (!isExist.length) {
            invalidMembers.push(member);
          }
        });
        await kickMembers(invalidMembers);
        return message.channel.send("Request done");
      }
    } catch (error) {
      console.log(error);
      return message.channel.send("An error occured");
    }
  },
};
