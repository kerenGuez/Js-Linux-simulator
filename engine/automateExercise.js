const { server, baseUrl, apiRoutes } = require("../index");
const axios = require("axios");

function separateCommandArgs(command) {
  command = command.replace(/ +/, " "); // Remove redundant spaces
  [route, ...args] = command.split(" ");
  const flags = args.filter((v) => v.match(/^\-\w+$/));
  console.log("flags",flags)
  args = args.filter((v) => !v.match(/^\-\w+$/));

  return {
    route,
    flags,
    args
  }
}

async function computeCommand(command) {
  const {route, flags, args} = separateCommandArgs(command);
  if (!apiRoutes.includes(route)) throw new Error("Command doesn't exist.");

  try {
    const result = await axios.post(`${baseUrl}/${route}/keren/`, {
      params: args,
      flags: flags,
    });
    return result.data;
  } catch (error) {
    console.error(error);
  }
}

// command is string
async function automateCall(command) {
  if (!server.address) throw new Error("server is not running");

  const result = await computeCommand(command);
  console.log("result:", result);

  //   return computeCommand(command).then((a) => console.log(a.data));
}

automateCall("cat /root/file1.txt");
