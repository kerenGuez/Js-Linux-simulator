const { server, baseUrl, apiRoutes } = require("../index");
const axios = require("axios");

// Receive a single command and separate the it to the route, flags and given arguments
function separateCommandArgs(command) {
  let [route, ...args] = command.split(" ");
  const allFlags = {};
  const flags = args.filter((v) => v.match(/^\-\w+$/));
  for (let flag of flags) {
    const flagIndex = args.findIndex(currentArg => currentArg === flag);
    flag = flag.replace('-', '');
    [...flag.slice(0,-1)].map(char => allFlags[char]=true);  // for cases where flags are conjoined e.g: '-vn' add all except for last one, to allow it to get an argument. 

    // This is not a god solution -> e.g "grep o 'lines' file1.txt" -> it will add {'o': 'lines'}
    // but lines is a regular argument not a flag argument
    if (args.length > flags.length + 1) {
      allFlags[flag[flag.length -1]] = args.splice(flagIndex + 1, 1)[0];
    }
    else {
      allFlags[flag[flag.length -1]] = true;
    }
  }
  const argsList = args.filter((v) => !v.match(/^\-\w+$/));  

  return {
    route,
    flags: allFlags,
    args: argsList,
  };
}

async function computeCommand(command, stdin=false) {
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

async function pipe(pipeCommand) {
  console.log("pipe command: ", pipeCommand);
  const pipeComponents = pipeCommand.split('|');
  const componentsLength = pipeComponents.length;
  if (componentsLength < 1) return "error";

  const lastPipedCommand = pipeComponents.pop();
  if (componentsLength === 1)
    return await computeCommand(lastPipedCommand, false);

  return await computeCommand(lastPipedCommand, await pipe(pipeComponents.join('|'))); // Needs to be awaited
}

function organizeCommand(command) {
  return command.replace(/ +/g, " ")
  .replace(/( +)*[|]( +)*/g, "|")
  .replace(/( +)*[;]( +)*/g, ";");
}

async function redirectOrAppend(command, actionName, stdin=false) {
  const sign = (actionName === 'redirect') ? '>' : '>>';
  const parts = command.trim().split(sign);
  const [ commandForContent, filePathToCopyTo ] = parts;
  // If it was piped into redirect, allow pure content to be passed through
  // Otherwise, assume you were given a command to evaluate.
  let contentForFile = stdin ? commandForContent : await computeCommand(commandForContent);
  const newActionCommand = `${actionName} ${contentForFile} ${filePathToCopyTo}`;
  return await computeCommand(newActionCommand);
}

async function redirect(command, stdin=false) {
  return await redirectOrAppend(command, 'redirect', stdin);
}

async function append(command, stdin=false) {
  return await redirectOrAppend(command, 'append', stdin);
}

const actions = "><|&"

// Gets the first expression found, and it's action is save in the group named 'sign'
const actionPattern = `[^${actions}]+(?<sign>[${actions}]{1,2})[^${actions}]+`;
const pipePattern = `[^${actions}]+(?<sign>[|])[^${actions}]+([|][^${actions}]+)*`

function getMatch(command) {
  const generalActionMatch = command.match(new RegExp(actionPattern));
  const pipeMatch = command.match(new RegExp(pipePattern));
  if (!pipeMatch || (pipeMatch.index > generalActionMatch.index))
    return generalActionMatch;
  
  return pipeMatch;

}

// async function solveAction() {

// }

const methodsToActions = [
  {action: "|", method: pipe}, 
  {action: ">", method: redirect},
  {action: ">>", method: append},
]

async function executeCommands(commands) {
  commands = organizeCommand(commands);
  commandsParts = commands.split(';');
  let result = "";
  for (let commandPart of commandsParts) {
    const currentCommandMatch = getMatch(commandPart);
    if (currentCommandMatch) {
      let currentCommand = currentCommandMatch[0].trim();
      const currentAction = currentCommandMatch.groups.sign;
      const currentCommandWithoutSpaces = currentCommand.replace(new RegExp(`( +)[${currentAction}]{1,2}( +)`), currentAction);
      commandPart = commandPart.replace(currentCommand, currentCommandWithoutSpaces);
      const methodForTheAction = methodsToActions.find(obj => obj.action === currentAction).method;
      let currentResult = String(await methodForTheAction(currentCommandWithoutSpaces, true));
      currentResult = currentResult.replace("\033[0m", "").replace("\033[31m", "")
      console.log("currentResult", currentResult);

      let newCommand = commandPart.replace(currentCommandWithoutSpaces, currentResult);

      result += !newCommand.match(new RegExp(`[${actions}]`)) ? `${currentResult}\n` : await executeCommands(newCommand) + '\n';
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



const string = "grep lines /root/file1.txt";
console.log("separateCommandArgs: ", separateCommandArgs(string));
// automateCall("cat /root/file1.txt | grep content| grep File; cat file2.txt");
// automateCall(string);
automateCall("echo hello | grep -o hel >> /root/file9.txt");
