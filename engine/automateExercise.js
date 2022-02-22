const environmentVariables = require("../configs/environmentVariables.json");
const { server, baseUrl, apiRoutes } = require("../index");
const axios = require("axios");

// Receive a single command and separate the it to the route, flags and given arguments
function separateCommandArgs(command) {
  const separatedCommand = command.match(/('.*'|".*"|\S+)/g); // matches non spaces and things in parentheses only.
  let [route, ...args] = separatedCommand.map((arg) =>
    arg.replace(/^(\"|\')|(\"|\')$/g, "")
  ); // remove surrounding quotes.
  const allFlags = {};
  const flags = args.filter((v) => v.match(/^\-\w+$/));
  for (let flag of flags) {
    const flagIndex = args.findIndex((currentArg) => currentArg === flag);
    flag = flag.replace("-", "");
    [...flag.slice(0, -1)].map((char) => (allFlags[char] = true)); // for cases where flags are conjoined e.g: '-vn' add all except for last one, to allow it to get an argument.

    // This is not a god solution -> e.g "grep o 'lines' file1.txt" -> it will add {'o': 'lines'}
    // but lines is a regular argument not a flag argument
    if (args.length > flags.length + 1) {
      allFlags[flag[flag.length - 1]] = args.splice(flagIndex + 1, 1)[0];
    } else {
      allFlags[flag[flag.length - 1]] = true;
    }
  }
  const argsList = args.filter((v) => !v.match(/^\-\w+$/)); // filter the flags out of the args list

  return {
    route,
    flags: allFlags,
    args: argsList.length > 0 ? argsList : [""],
  };
}

async function computeCommand(command, stdin = false) {
  const { route, flags, args } = separateCommandArgs(command);
  if (!apiRoutes.includes(route)) throw new Error("Command doesn't exist.");

  try {
    // TODO : make requests per generic user
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

async function redirectOrAppend(command, actionName, stdin = false) {
  const sign = actionName === "redirect" ? ">" : ">>";
  const parts = command.trim().split(sign);
  const [commandForContent, filePathToCopyTo] = parts;
  // If it was piped into redirect, allow pure content to be passed through
  // Otherwise, assume you were given a command to evaluate.
  let contentForFile = stdin
    ? commandForContent
    : await computeCommand(commandForContent);
  const newActionCommand = `${actionName} "${contentForFile}" ${filePathToCopyTo}`;
  return await computeCommand(newActionCommand);
}

async function redirect(command, stdin = false) {
  return await redirectOrAppend(command, "redirect", stdin);
}

async function append(command, stdin = false) {
  return await redirectOrAppend(command, "append", stdin);
}

async function AndOrOperators(
  command,
  sign,
  stdin = false,
  lastCommandExecuted
) {
  const SignIndex = command.indexOf(sign);
  const beforeSign = command.substring(0, SignIndex);
  const afterSign = command.substring(SignIndex + 2, command.length);
  let result = "";
  result +=
    stdin === beforeSign
      ? beforeSign + "\n"
      : (await executeCommands(beforeSign, lastCommandExecuted, stdin)) + "\n";

  const exitCode = environmentVariables.EXIT_CODE;
  if ((sign === "&&" && exitCode === 0) || (sign === "||" && exitCode)) {
    return `${result}${await executeCommands(
      afterSign,
      [sign],
      result
    )}\n`.trim();
  }
  return result.trim();
}

async function andOperator(command, stdin = false, lastCommandExecuted) {
  return await AndOrOperators(command, "&&", stdin, lastCommandExecuted);
}

async function orOperator(command, stdin = false, lastCommandExecuted) {
  return await AndOrOperators(command, "||", stdin, lastCommandExecuted);
}

function extractOuterParentheses(string) {
  const indexOfOpenParentheses = string.indexOf("(");
  if (indexOfOpenParentheses < 0) return { index: -1 };
  let openParenthesesCount = 1;
  let outerParenthesesContent = "";

  for (let i = indexOfOpenParentheses + 1; i < string.length; i++) {
    switch (string[i]) {
      case "(":
        openParenthesesCount++;
        break;
      case ")":
        openParenthesesCount--;
        break;
    }

    if (openParenthesesCount === 0)
      return {
        index: indexOfOpenParentheses,
        groups: {
          expression: `(${outerParenthesesContent})`,
          sign: "(",
        },
      };

    outerParenthesesContent += string[i];
  }
  return { index: -1 }; // Gets here if parentheses are not balanced
}

const actions = "><|&()";

const notCloseCharsPattern = (char) => `(?<![${char}])[${char}](?![${char}])`;
const bothNotClosedPattern = `(${notCloseCharsPattern(
  "|"
)})|(${notCloseCharsPattern("&")})`;
const allOkPattern = `((${bothNotClosedPattern})|([^${actions}]))+`;
const parentheses = `\\(.+\\)`;
const andOrWithParentheses = `(${allOkPattern})?(${parentheses})?(${allOkPattern})?`;
const pipeWithPatterns = `([^${actions}]+)?(${parentheses})?([^${actions}]+)?`;
// Gets the first expression found, and it's action is saved in the group named 'sign'
const actionPattern = `(?<expression>([^${actions}]+)?(?<sign>[${actions}]{1,2})[^${actions}]+)`;
// const pipePattern = `(?<expression>[^${actions}]+(?<sign>[|])(${pipeWithPatterns})([|](${pipeWithPatterns}))*)`;
const pipePattern = `(?<expression>([^${actions}]+)?(?<sign>[|])(${pipeWithPatterns}))`;
const andOrPattern = `(?<expression>([^${actions}]+)?(?<sign>([|]{2}|[&]{2}))(${andOrWithParentheses}))`;

const methodsToActions = [
  { precedence: 1, pattern: actionPattern, action: ">", method: redirect },
  { precedence: 1, pattern: actionPattern, action: ">>", method: append },
  { precedence: 2, pattern: pipePattern, action: "|", method: pipe },
  { precedence: 3, pattern: andOrPattern, action: "&&", method: andOperator },
  { precedence: 3, pattern: andOrPattern, action: "||", method: orOperator },
  { precedence: 4, pattern: null, action: "(", method: parenthesesOperator },
];

function removeOuterParentheses(str) {
  const openingIndex = str.indexOf("(");
  return (
    str.substring(0, openingIndex) +
    str.substring(openingIndex + 1, str.length - 1)
  );
}

async function parenthesesOperator(
  command,
  stdin = false,
  lastCommandExecuted
) {
  if (command.match(parentheses)) {
    command = removeOuterParentheses(command);
  }
  return executeCommands(command, lastCommandExecuted, stdin);
}

async function pipe(pipeCommand, stdin, lastCommandExecuted) {
  const pipeIndex = pipeCommand.indexOf("|");
  const beforePipe = pipeCommand.substring(0, pipeIndex);
  const afterPipe = pipeCommand.substring(pipeIndex + 1, pipeCommand.length);

  const firstPartResult =
    (stdin || stdin === '') && stdin.trim() === beforePipe.trim()
      ? beforePipe
      : await executeCommands(beforePipe, lastCommandExecuted, stdin);

  return await executeCommands(afterPipe, ["|"], firstPartResult);
}

function organizeMinActionMatch(minMatch, parenthesesMatch) {
  // If parentheses are in the found match, take only the part until the closing parentheses
  const parenthesesStartIndex = parenthesesMatch.index;
  if (
    minMatch &&
    parenthesesMatch.index > -1 &&
    parenthesesStartIndex < minMatch.groups.expression.length - 1
  ) {
    const lastParenthesesIndex =
      parenthesesStartIndex + parenthesesMatch.groups.expression.length;
    const expression = minMatch.groups.expression;
    minMatch.groups.expression = expression.slice(0, lastParenthesesIndex);
    // remove outer parentheses from the expression
    // minMatch.groups.expression = expression.substring(0, parenthesesStartIndex) + expression.substring(parenthesesStartIndex + 1, expression.length -1);
  }

  return minMatch;
}

function getMatch(command) {
  let min = 999999;
  let minMatch;
  const sortedMethodsToActions = methodsToActions.sort(
    (firstActionObj, secActionObj) =>
      secActionObj.precedence - firstActionObj.precedence
  );

  const parenthesesMatch = extractOuterParentheses(command);
  if (parenthesesMatch.index === 0) return parenthesesMatch;

  for (obj of sortedMethodsToActions) {
    let actionMatch = command.match(new RegExp(obj.pattern));
    let matchIndex = actionMatch ? actionMatch.index : 999999;
    if (matchIndex === 0)
      return organizeMinActionMatch(actionMatch, parenthesesMatch);

    if (matchIndex < min) {
      minMatch = actionMatch;
      min = matchIndex;
    }
  }

  if (parenthesesMatch.index > -1) {
    if (!minMatch || (minMatch && parenthesesMatch.index <= minMatch.index))
      return parenthesesMatch;
  }

  return organizeMinActionMatch(minMatch, parenthesesMatch);
}

async function executeCommands(commands, lastCommandExecuted, stdin = false) {
  lastCommandExecuted = lastCommandExecuted || [];
  commandsParts = commands.split(";");
  let result = "";
  for (let commandPart of commandsParts) {
    commandPart = commandPart.replace(
      new RegExp(`(?: +)([${actions}]{1,2})(?: +)`),
      "$1"
    );
    const currentCommandMatch = getMatch(commandPart);
    if (currentCommandMatch) {
      let currentCommand = currentCommandMatch.groups.expression.trim();
      const currentAction = currentCommandMatch.groups.sign;
      const methodForTheAction = methodsToActions.find(
        (obj) => obj.action === currentAction
      ).method;
      const stdinActions = ["|", "&&", "||", "("];
      stdin = stdinActions.some((action) =>
        lastCommandExecuted.includes(action)
      )
        ? stdin
        : false;

      let currentResult = String(
        await methodForTheAction(currentCommand, stdin, lastCommandExecuted)
      );

      lastCommandExecuted.splice(0, lastCommandExecuted.length, currentAction);

      currentResult = currentResult
        .replace("\033[0m", "")
        .replace("\033[31m", "");

      stdin = currentResult;
      let newCommand = commandPart.replace(currentCommand, currentResult);
      result += !newCommand.match(new RegExp(`[${actions}]`))
        ? `${currentResult}\n`
        : (await executeCommands(newCommand, lastCommandExecuted, stdin)) +
          "\n";
      continue;
    }
    result += await computeCommand(commandPart, stdin);
  }
  return result;
}

// command is string
async function automateCall(command) {
  if (!server.address) throw new Error("server is not running");
  const result = await executeCommands(command);
  const organizedResult = result
    .split("\n")
    .filter((arg) => arg !== "")
    .join("\n");
  console.log(
    "\n\n\033[33m---separator---\033[0m\n",
    "\033[36mResult:\033[0m",
    organizedResult
  );
}

const string = "grep 'lines' /root/file1.txt";
// console.log("separateCommandArgs: ", separateCommandArgs(string));
// automateCall("cat /root/file1.txt | grep content| grep File; cat file2.txt");
// automateCall("ls | cat /root/file1.txt | cat file2.txt > /root/a.txt");
// automateCall("echo hello | grep -o hell | grep -o he");
// automateCall("(cat file2.txt)");
// automateCall("cat /root | grep b | (echo yes || echo sorry) | grep hi || (echo fail)"); 

// automateCall("echo hello | grep hell | (echo yes || echo sorry) | grep y || (echo fail)");
// automateCall("echo hello | grep hell | (echo yes || echo sorry) | grep -o y || echo fail && echo success!");
// automateCall("(echo fail)");
// automateCall("(echo yes || echo sorry) | grep y");
// automateCall("echo hello | grep hell | (echo yes || echo sorry)");
// automateCall("echo hello | grep hell | grep he");
// automateCall("echo hello | grep y || echo fail && echo success");
// automateCall("echo hello | grep y | grep t"); 
// automateCall("echo | (echo > /root/file5.txt)");
// automateCall("echo > /root/file5.txt");

// automateCall("echo hello | (grep e && (echo yeah && echo beep || echo no) || echo bope) && echo yes || echo nope");
// automateCall("echo hi > /root/ab.txt");
// automateCall(string);
// automateCall("ls && cat /root && cat /root/file2.txt || echo third && echo yes");
// automateCall("echo hi && echo bye || echo bad | grep b && echo twice | grep t");
