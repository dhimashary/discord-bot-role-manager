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
    const { id } = await guild.roles.cache.find((r) => r.name === role);
    return id;
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

module.exports = {
  clear,
  getArgs,
  getCommand,
  getRoleId,
  getMembersWithRole,
  changeMembersRole,
};
