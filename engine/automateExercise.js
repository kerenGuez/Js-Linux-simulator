const environmentVariables = require("../configs/environmentVariables.json");
const { server, baseUrl, apiRoutes } = require("../index");
const axios = require("axios");

// Receive a single command and separate the it to the route, flags and given arguments
function separateCommandArgs(command) {
  const separatedCommand = command.match(/('.*'|".*"|\S+)/g); // matches non spaces and things in parentheses only.
  let [route, ...args] = separatedCommand.map(arg => arg.replace(/^(\"|\')|(\"|\')$/g, "")); // remove surrounding quotes.
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
  const argsList = args.filter((v) => !v.match(/^\-\w+$/)); // filter the flags out of the args list 

  return {
    route,
    flags: allFlags,
    args: argsList.length > 0 ? argsList : [""]
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
  const pipeComponents = pipeCommand.split('|');
  const componentsLength = pipeComponents.length;
  if (componentsLength < 1) return "error";

  const lastPipedCommand = pipeComponents.pop();
  if (componentsLength === 1)
    return await computeCommand(lastPipedCommand, false);

  return await computeCommand(lastPipedCommand, await pipe(pipeComponents.join('|'))); // Needs to be awaited
}

async function redirectOrAppend(command, actionName, stdin=false) {
  const sign = (actionName === 'redirect') ? '>' : '>>';
  const parts = command.trim().split(sign);
  const [ commandForContent, filePathToCopyTo ] = parts;
  // If it was piped into redirect, allow pure content to be passed through
  // Otherwise, assume you were given a command to evaluate.
  let contentForFile = stdin ? commandForContent : await computeCommand(commandForContent);
  const newActionCommand = `${actionName} "${contentForFile}" ${filePathToCopyTo}`;
  return await computeCommand(newActionCommand);
}

async function redirect(command, stdin=false) {
  return await redirectOrAppend(command, 'redirect', stdin);
}

async function append(command, stdin=false) {
  return await redirectOrAppend(command, 'append', stdin);
}

async function AndOrOperators(command, sign, stdin=false) {
  const [beforeSign, afterSign] = command.split(sign);
  let result = "";
  result += stdin ? beforeSign + '\n' : await computeCommand(beforeSign) + '\n';

  switch(sign) {
    case '&&': return (environmentVariables.EXIT_CODE === 0) ? `${result}${await computeCommand(afterSign)}\n` : result;
    case '||': return (environmentVariables.EXIT_CODE) ? `${result}${await computeCommand(afterSign)}\n` : result;
  }
}

async function andOperator(command, stdin=false) {
  return await AndOrOperators(command, '&&', stdin);
}

async function orOperator(command, stdin=false) {
  return await AndOrOperators(command, '||', stdin);
}

const actions = "><|&"

// Gets the first expression found, and it's action is save in the group named 'sign'
const actionPattern = `(?<expression>[^${actions}]+(?<sign>[${actions}]{1,2})[^${actions}]+)`;
const pipePattern = `(?<expression>[^${actions}]+(?<sign>[|])[^${actions}]+([|][^${actions}]+)*)`

// returns the first appearing match in the text - whether it's pipe or general command
function getMatch(command) {
  const generalActionMatch = command.match(new RegExp(actionPattern));
  const pipeMatch = command.match(new RegExp(pipePattern));
  if (!pipeMatch || (pipeMatch.index > generalActionMatch.index))
    return generalActionMatch;
  
  return pipeMatch;
}

const methodsToActions = [
  {action: "|", method: pipe}, 
  {action: ">", method: redirect},
  {action: ">>", method: append},
  {action: "&&", method: andOperator},
  {action: "||", method: orOperator},
]

async function executeCommands(commands, lastCommandExecuted) {
  lastCommandExecuted = lastCommandExecuted || [];
  commandsParts = commands.split(';');
  let result = "";
  let stdin = false;
  for (let commandPart of commandsParts) {
    commandPart = commandPart.replace(new RegExp(`(?: +)([${actions}]{1,2})(?: +)`), "$1");
    const currentCommandMatch = getMatch(commandPart);
    if (currentCommandMatch) {
      let currentCommand = currentCommandMatch.groups.expression.trim();
      const currentAction = currentCommandMatch.groups.sign;
      const methodForTheAction = methodsToActions.find(obj => obj.action === currentAction).method;
      const stdinActions = ['|', '&&', '||'];
      stdin = stdinActions.some(action => lastCommandExecuted.includes(action));
      let currentResult = String(await methodForTheAction(currentCommand, stdin));
      lastCommandExecuted.splice(0, lastCommandExecuted.length, currentAction);

      currentResult = currentResult.replace("\033[0m", "").replace("\033[31m", "")

      let newCommand = commandPart.replace(currentCommand, currentResult);
      result += !newCommand.match(new RegExp(`[${actions}]`)) ? `${currentResult}\n` : await executeCommands(newCommand, lastCommandExecuted) + '\n';
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
  const organizedResult = result.split('\n').filter(arg => arg !== '').join('\n');
  console.log("\n\n\033[33m---separator---\033[0m\n", "\033[31mResult:\033[0m", organizedResult);
}

const string = "grep 'lines' /root/file1.txt";
console.log("separateCommandArgs: ", separateCommandArgs(string));
// automateCall("cat /root/file1.txt | grep content| grep File; cat file2.txt");
// automateCall("ls | cat /root/file1.txt | cat file2.txt > /root/a.txt");
// automateCall("echo hi > /root/ab.txt");
// automateCall(string);
// automateCall("ls && cat /root && cat /root/file2.txt || echo third && echo yes");
