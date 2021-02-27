const axios = require("axios");
const requestConfig = require("../request-config.json");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  userAgent: "github_remove_invite_org",
});
module.exports = {
  async removeFromOrganization(message, phase, organizationName) {
    try {
      if (phase !== "p1" && phase !== "p0" && phase !== "p2" || !organizationName) {
        return message.channel.send("invalid param");
      }
      console.log(phase, organizationName);
      message.channel.send(
        "Getting all github username to remove. Please wait ..."
      );
      const { data: sheetData } = await axios({
        method: "post",
        url: process.env.PIPEDREAM_URL,
        data: requestConfig[phase],
      });
      let removedMember = sheetData.result
        .filter((student) => student.status.toUpperCase() !== "PASSED")
      // console.log(removedMember, removedMember.length)
      removedMember = removedMember.map((student) => student.github);
      removedMember.forEach((username, i) =>
        octokit.orgs
          .removeMember({
            org: organizationName,
            username,
          })
          .then((_) => {
            console.log("success kick " + username);
            if (i === removedMember.length - 1) {
              return message.channel.send("proses done");
            }
          })
          .catch((err) => {
            console.log(err)
          })
      );
    } catch (error) {
      console.log(error);
      message.channel.send("An error occured, please check terminal ..");
    }
  },
};
