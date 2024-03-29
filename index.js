require("dotenv").config();
const Discord = require("discord.js");
let Intents = Discord.Intents;
let intents = new Intents(Intents.ALL);
const client = new Discord.Client({ ws: { intents } });
const BOT_TOKEN = process.env.BOT_TOKEN;
const {
  userAndPrefixAuthentication,
  findDiscordAndSheetMembersByPhase,
  validatePhaseTotalMemberByStatus,
  graduatePhaseThreeMembers,
  changeStudentRole,
  kickInvalidMembersOrAlumni,
} = require("./controllers/discordController");

const { removeFromOrganization } = require("./controllers/githubController");

const { getArgs, getCommand } = require("./util");

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", async (message) => {
  const prefix = "!";
  const isAuthenticated = userAndPrefixAuthentication(message, prefix);
  if (isAuthenticated) {
    const args = getArgs(message, prefix);
    const command = getCommand(message, prefix);
    switch (command) {
      case "validate":
        // make sure to run find command before running this command
        validatePhaseTotalMemberByStatus(message, args);
        break;
      case "find":
        findDiscordAndSheetMembersByPhase(message, args);
        break;
      case "graduate":
        graduatePhaseThreeMembers(message);
        break;
      case "execute":
        // make sure to run find command before running this command
        changeStudentRole(message, args);
        break;
      case "kick":
        // make sure to run find command before running this command
        kickInvalidMembersOrAlumni(message, args);
        break;
      case "git:rm":
        removeFromOrganization(message, args[0], args[1]);
        break;
      default:
        break;
    }
  }
});

client.login(BOT_TOKEN);
