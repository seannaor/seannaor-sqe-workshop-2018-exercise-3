import * as esprima from 'esprima';

let boxesIndex = 1;

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{range: true});
};

const memberExpString = (parsedCode) => {
    return parsedCode.object.name + '[' + expString(parsedCode.property) + ']';
};

const expString = (parsedCode) => {
    switch (parsedCode.type) {
    case 'Literal':
        return parsedCode.value.toString();
    case 'Identifier':
        return Identifier(parsedCode);
    case 'BinaryExpression':
        return binaryExpString(parsedCode);
    case 'MemberExpression':
        return memberExpString(parsedCode);
    default :
        return arrayExpString(parsedCode);
    }
};
const Identifier = (parsedCode) => {
    return parsedCode.name;
};

const arrayExpString = (parsedCode) => {
    let output = '[';
    for(let i=0;i<parsedCode.elements.length;i++) {
        output += expString(parsedCode.elements[i]);
        if(i < parsedCode.elements.length - 1) {
            output += ',';
        }
    }
    output += ']';
    return output;
};

const binaryExpString = (parsedCode) => {
    return expString(parsedCode.left) + ' ' + parsedCode.operator + ' ' + expString(parsedCode.right);
};

const parseReturn = (parsedCode , code , arrayOfCode , arrayOfLocals,flag,args,cfg,boxes) => {
    let toAdd = 'return ' + expString(cfg.astNode.argument) + ';';
    arrayOfCode.push(toAdd);
    let newBox = 'n' + boxesIndex + ' [label="' + '<' + boxesIndex + '>\n' + toAdd + '", shape="rectangle", style="filled"]';
    boxes.push(newBox);
    boxesIndex++;
};

const parseVarDeclaration = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,cfg,boxes) => {
    for(let i=0;i<cfg.astNode.declarations.length;i++) {
        let init = cfg.astNode.declarations[i].init != null;
        let value;
        if(init) {
            value = expString(cfg.astNode.declarations[i].init);
        }
        else {
            value = '';
        }
        let toAdd = {name: cfg.astNode.declarations[i].id.name , value: value};
        arrayOfCode.push('let ' + cfg.astNode.declarations[i].id.name + ' = ' + value + ';');
        arrayOfLocals.push(toAdd);
        let newBox = 'n' + boxesIndex + ' [label="' + '<' + boxesIndex + '>\n' + ('let ' + cfg.astNode.declarations[i].id.name + ' = ' + value + ';') + '", shape="rectangle", style="filled"]';
        boxes.push(newBox);
        boxesIndex++;
    }
};

const getTheValueEzer = (input,separator) => {
    let value = '';
    if(separator != -1) {
        value = input.substring(0,separator);
    }
    else {
        value = input;
    }
    return value;
};

const getTheValue = (input,index) => {
    let separator = input.indexOf(',');
    while(separator != -1 && index > 0) {
        input = input.substring(separator + 1);
        separator = input.indexOf(',');
        index--;
    }
    return getTheValueEzer(input,separator);
};

function maybeLocal(arrayOfLocals,name) {
    for(let i = arrayOfLocals.length-1; i>=0;i--) {
        if(arrayOfLocals[i].name == name) {
            return arrayOfLocals[i].value;
        }
        else
            continue;
    }
}

const checkMember = (output , string , args,arrayOfLocals) => {
    let isArg = false;
    if(string.indexOf('[') != -1) {
        let name = string.substring(0, string.indexOf('[')), input = '' , index = string.substring(string.indexOf('[') + 1, string.indexOf(']')) , realIndex = eval(fixLocals(index, args,arrayOfLocals));
        for (let i = args.length - 1; i >= 0; i--) {
            if (args[i].name == name) {
                isArg = true;
                input = args[i].value;
                break;
            }
        }
        if (!isArg)
            input = maybeLocal(arrayOfLocals, name);
        input = input.substring(1, input.length - 1);
        let value = getTheValue(input, realIndex);
        output += (' ' + value + ' '); }
    else
        output += (' ' + string + ' ');
    return output;
};

function checkArray (split,i) {
    if (split[i].indexOf('[') != -1  && split[i].indexOf(']') == -1) {
        return true;
    }
    return false;
}

const fixSplit = (split) => {
    let newSplit = [] , k = 0 , flag = false;
    for (let i =0;i< split.length;i++) {
        if (checkArray(split,i)) {
            while(split[i].indexOf(']') == -1) {
                if(flag == false) {
                    newSplit[k] = split[i] + ' ';
                    flag = true;
                }
                else
                    newSplit[k] += split[i] + ' ';
                i++;
            }
            newSplit[k] += split[i]; }
        else
            newSplit[k] = split[i];
        k++;
        flag = false; }
    return newSplit;
};
function ezer (string) {
    let split = [];
    if(string.indexOf(' ') != -1) {
        split = string.split(' ');
        split = fixSplit(split);
    }
    else {
        split[0] = string;
    }
    return split;
}

function checkLocals (output,string,arrayOfLocals,args) {
    for(let j = arrayOfLocals.length - 1; j >= 0;j--) {
        if (string == arrayOfLocals[j].name) {
            output += (' ' + arrayOfLocals[j].value + ' ');
            break;
        }
        else
            continue;
    }
    output = fixLocals(output,args,arrayOfLocals);
    return output;
}
function helper (output,string , args,arrayOfLocals) {
    if (getAllNames(arrayOfLocals).includes(string))
        return checkLocals(output, string, arrayOfLocals, args);
    return checkMember(output, string, args, arrayOfLocals);
}

function helping(isFound,string,output,args,arrayOfLocals) {
    if(!isFound && string != '') {
        output = helper (output, string , args,arrayOfLocals);
    }
    return output;
}

const fixLocals = (string , args,arrayOfLocals) => {
    let output = '' , isFound = false;
    let split = ezer(string);
    for (let i =0;i< split.length;i++) {
        for(let j = args.length - 1; j >= 0;j--) {
            if (split[i] == args[j].name) {
                output += (' ' + args[j].value + ' ');
                isFound = true;
                break;
            }
        }
        output = helping(isFound,split[i],output,args,arrayOfLocals);
        isFound = false;
    }
    return output;
};

function help (value , i) {
    if((value[i] >= 'a' && value[i] <='z') || (value[i] >='A' && value[i] <= 'Z')) {
        return true;
    }
    return false;
}
function checkBooleans (value) {
    if (value == true || value == false) {
        return true;
    }
    return false;
}
function checkLeftRight(value) {
    if(checkBooleans(value)) {
        return eval(value);
    }
    else {
        for (let i =0; i<value.length;i++) {
            if(help(value,i)) {
                return '\'' + value + '\'';
            }
        }
    }
    return eval(value);
}

const checkCondition = (condition , args,cfg,arrayOfLocals) => {
    let check = '';
    if(cfg.astNode.operator != null) {
        let left = '', right = '', split = condition.indexOf(cfg.astNode.operator);
        left = (condition.substring(0, split)).trim();
        if (cfg.astNode.operator.length == 2)
            right = (condition.substring(split + 2)).trim();
        else
            right = (condition.substring(split + 1)).trim();
        let valueInLeft = fixLocals(left,args,arrayOfLocals) , valueInRight = fixLocals(right,args,arrayOfLocals);
        let leftEval = checkLeftRight(valueInLeft) , rightEval = checkLeftRight(valueInRight);
        check = eval(leftEval + cfg.astNode.operator + rightEval);
    }
    else
        check = eval(fixLocals(condition,args,arrayOfLocals));
    if(check == false)
        return false;
    else
        return true;
};

const parseIf = (parsedCode , code , arrayOfCode,arrayOfLocals , flag,args,cfg,boxes) => {
    let condition = expString(cfg.astNode);
    let newBox = 'n' + boxesIndex + ' [label="' + '<' + boxesIndex + '>\n' + condition + '", shape="diamond", style="filled"]';
    boxes.push(newBox);
    boxesIndex++;
};

const parseWhile = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,cfg,boxes) => {
    let condition = expString(cfg.astNode);
    let toAdd = 'while(' + condition +') {';
    arrayOfCode.push(toAdd);
    let newBox2 = 'n' + boxesIndex + ' [label="' + '<' + boxesIndex + '>\n' + condition + '", shape="diamond", style="filled"]';
    boxes.push(newBox2);
    boxesIndex++;
    arrayOfCode.push('}');
};

const changeArgs = (cfg ,args,arrayOfLocals) => {
    for (let i = 0; i < args.length; i++) {
        if (cfg.astNode.left.name == args[i].name) {
            args.push({name:args[i].name,value: checkLeftRight(fixLocals(expString(cfg.astNode.right),args,arrayOfLocals)).toString()});
            break;
        }
        else {
            continue;
        }
    }
};

function addLocals(string , args,arrayOfLocals) {
    let output = '' , isFound = false;
    let split = ezer(string);
    for (let i =0;i< split.length;i++) {
        for(let j = arrayOfLocals.length - 1; j >= 0;j--) {
            if (split[i] == arrayOfLocals[j].name) {
                output += arrayOfLocals[j].value;
                isFound = true;
                break;
            }
        }
        if(!isFound) {
            output += split[i];
        }
        isFound = false;
    }
    return output;
}

const changeLocals = (cfg,arrayOfLocals,args) => {
    for (let i = 0; i < arrayOfLocals.length; i++) {
        if (cfg.astNode.left.name == arrayOfLocals[i].name) {
            arrayOfLocals.push({name:arrayOfLocals[i].name,value: addLocals(expString(cfg.astNode.right),args,arrayOfLocals)});
            break;
        }
        else
            continue;
    }
};

const getAllNames = (arr) => {
    let output = [];
    for (let i = 0; i < arr.length; i++) {
        output.push(arr[i].name);
    }
    return output;
};

const parseAssignment = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,cfg,boxes) => {
    if(getAllNames(arrayOfLocals).includes(cfg.astNode.left.name)) {
        let toAdd = expString(cfg.astNode.left) + ' ' + cfg.astNode.operator + ' ' + expString(cfg.astNode.right) + ';';
        arrayOfCode.push(toAdd);
        let newBox = 'n' + boxesIndex + ' [label="' + '<' + boxesIndex + '>\n' + toAdd + '", shape="rectangle", style="filled"]';
        boxes.push(newBox);
        boxesIndex++;
    }
    if (getAllNames(args).includes(cfg.astNode.left.name)) {
        let toAdd = expString(cfg.astNode.left) + ' ' + cfg.astNode.operator + ' ' + expString(cfg.astNode.right) + ';';
        arrayOfCode.push(toAdd);
        let newBox = 'n' + boxesIndex + ' [label="' + '<' + boxesIndex + '>\n' + toAdd + '", shape="rectangle", style="filled"]';
        boxes.push(newBox);
        boxesIndex++;
    }
};


let types = { 'VariableDeclaration' : parseVarDeclaration , 'ReturnStatement' : parseReturn , 'IfStatement' : parseIf , 'WhileStatement': parseWhile , 'AssignmentExpression' : parseAssignment};

const checkStartFinish = (box) => {
    if(box.type == 'entry' || box.type == 'exit') {
        return true;
    }
    return false;
};

const checkIfWhile= (cfg) => {
    if (cfg.astNode.type == 'BinaryExpression' || cfg.astNode.type == 'Identifier' || cfg.astNode.type == 'Literal') {
        return true;
    }
    return false;
};

const navigate = (parsedCode , code , arrayOfCode , arrayOfLocals,flag,args,cfg,boxes) => {
    for (let i = 0; i < cfg.length; i++) {
        if(checkStartFinish(cfg[i]))
            continue;
        if (checkIfWhile(cfg[i])) {
            types[cfg[i].parent.type](parsedCode, code, arrayOfCode, arrayOfLocals, flag, args, cfg[i], boxes);
        }
        else
            types[cfg[i].astNode.type](parsedCode, code, arrayOfCode, arrayOfLocals, flag, args, cfg[i], boxes);
    }
    let newBox = 'n' + boxesIndex + ' [label="' + '<' + boxesIndex + '>\n end", shape="circle", style="filled", fillcolor="green"]';
    boxes.push(newBox);
    colorBoxes(cfg,args,arrayOfLocals);
};

function direction (box,test) {
    if(test)
        return box.true;
    return box.false;
}

function checkWhile (allBoxes,box) {
    if(allBoxes.includes(box)) {
        return box.false;
    }
    return box;
}

const colorBoxes = (cfg,args,arrayOfLocals) => {
    let box = cfg[1];
    let allBoxes = [];
    while(!(checkStartFinish(box))) {
        box = checkWhile(allBoxes,box);
        allBoxes.push(box);
        box.color = 'green';
        if(box.true != undefined) {
            let test = checkCondition(expString(box.astNode),args,box,arrayOfLocals);
            box = direction(box,test);
            continue;
        }
        if(box.normal != undefined) {
            if(box.astNode.type == 'AssignmentExpression')
                change(box,args,arrayOfLocals);
            box = box.normal;
        }

    }
};

const change = (cfg,args,arrayOfLocals) => {
    if(getAllNames(arrayOfLocals).includes(cfg.astNode.left.name)) {
        changeLocals(cfg, arrayOfLocals,args);
    }
    if (getAllNames(args).includes(cfg.astNode.left.name)) {
        changeArgs(cfg,args,arrayOfLocals);
    }
};

export {parseCode,navigate};

