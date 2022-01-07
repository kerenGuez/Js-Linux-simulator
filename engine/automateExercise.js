const { server, baseUrl, apiRoutes } = require("../index");
const axios = require("axios");

// Receive a single command and separate the it to the route, flags and given arguments
function separateCommandArgs(command) {
  [route, ...args] = command.split(" ");
  const flags = args.filter((v) => v.match(/^\-\w+$/));
  args = args.filter((v) => !v.match(/^\-\w+$/));

  return {
    route,
    flags,
    args,
  };
}

async function computeCommand(command, stdin) {
  if (!apiRoutes.includes(route)) throw new Error("Command doesn't exist.");

  const { route, flags, args } = separateCommandArgs(command);
  try {
    const result = await axios.post(`${baseUrl}/${route}/keren/`, {
      params: args,
      flags: flags,
      stdin: stdin,
    });
    return result.data;
  } catch (error) {
    console.error(error);
  }
}

async function pipe(pipeComponents) {
  const componentsLength = pipeComponents.length;
  if (componentsLength < 1) return "error";

  const lastPipedCommand = pipeComponents.pop();
  if (componentsLength === 1)
    return await computeCommand(lastPipedCommand, false);

  return await computeCommand(lastPipedCommand, pipe(pipeComponents)); // Needs to be awaited
}

async function executeCommands(commands) {
  commands = commands.replace(/ +/g, " "); // remove redundant spaces
  commandsParts = commands.split(';');
  let result = "";
  for (commandPart in commandsParts) {
    let pipeParts = commandPart.split('|');
    if (pipeParts > 1) {
      result += pipe(pipeParts) + "\n";
      continue;
    }
    
    result += await computeCommand(commandPart, false);
  }
  return result;
}

// command is string
async function automateCall(command) {
  if (!server.address) throw new Error("server is not running");

  const result = await executeCommands(command);
  console.log("result:", result);
}

automateCall("cat /root/file1.txt");
