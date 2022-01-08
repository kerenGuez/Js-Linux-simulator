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
  const { route, flags, args } = separateCommandArgs(command);
  if (!apiRoutes.includes(route)) throw new Error("Command doesn't exist.");

  try {
    const result = await axios.post(`${baseUrl}/${route}/keren/`, {
      params: args,
      flags: flags,
      stdin: stdin,
    });
    return await result.data;
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

  return await computeCommand(lastPipedCommand, await pipe(pipeComponents)); // Needs to be awaited
}

function organizeCommand(command) {
  return command.replace(/ +/g, " ")
  .replace(/( +)*[|]( +)*/g, "|")
  .replace(/( +)*[;]( +)*/g, ";");
}

async function executeCommands(commands) {
  commands = organizeCommand(commands);
  commandsParts = commands.split(';');
  let result = "";
  for (commandPart of commandsParts) {
    let pipeParts = commandPart.split('|');
    if (pipeParts.length > 1) {
      result += await pipe(pipeParts) + "\n";
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

automateCall("cat /root/file1.txt | grep content; cat file2.txt");
