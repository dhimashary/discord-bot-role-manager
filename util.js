function getArgs(message, prefix) {
  try {
    const data = message.content.slice(prefix.length).trim().split(/ +/g);
    data.shift();
    return data;
  } catch (error) {
    throw error;
  }
}

function getCommand(message, prefix) {
  try {
    const data = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = data.shift().toLowerCase();
    return command;
  } catch (error) {
    throw error;
  }
}

async function getRoleId(guild, role) {
  try {
    const data = await guild.roles.cache.find((r) => r.name === role);
    if (!data) {
      throw {
        msg: "role not found",
      };
    }
    return data.id;
  } catch (error) {
    throw error;
  }
}

async function clear(message) {
  await message.delete();
  const list = await message.channel.messages.fetch({ limit: 99 });
  await message.channel.bulkDelete(list);
}

async function getMembersWithRole(guild, roleId) {
  try {
    const data = await guild.roles.cache.get(roleId).members;
    return data;
  } catch (error) {
    throw error;
  }
}

async function changeMembersRole(members, roleId, roleUpdateId) {
  try {
    members.forEach(async (member) => {
      await member.roles.remove(roleId);
      await member.roles.add(roleUpdateId);
    });
  } catch (error) {
    throw error;
  }
}

async function roleId(guild, status) {
  let realStatus;
  if (status === "p0") {
    realStatus = `student-phase0`;
  } else if (status === "p1") {
    realStatus = `student-phase1`;
  } else if (status === "p2") {
    realStatus = `student-phase2`;
  } else if (status === "p3") {
    realStatus = `student-phase3`;
  } else if (status === "alumni") {
    realStatus = `student-alumni`;
  }
  try {
    let id = await getRoleId(guild, realStatus);
    return id;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  clear,
  getArgs,
  getCommand,
  getRoleId,
  getMembersWithRole,
  changeMembersRole,
  roleId,
};
