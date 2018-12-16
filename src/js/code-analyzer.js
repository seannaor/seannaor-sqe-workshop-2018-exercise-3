import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc: true});
};

const memberExpString = (parsedCode,arrayOfLocals) => {
    return parsedCode.object.name + '[' + expString(parsedCode.property,arrayOfLocals) + ']';
};

const expString = (parsedCode,arrayOfLocals) => {
    switch (parsedCode.type) {
    case 'Literal':
        return parsedCode.value.toString();
    case 'Identifier':
        return Identifier(parsedCode,arrayOfLocals);
    case 'BinaryExpression':
        return binaryExpString(parsedCode,arrayOfLocals);
    case 'MemberExpression':
        return memberExpString(parsedCode,arrayOfLocals);
    default :
        return arrayExpString(parsedCode,arrayOfLocals);
    }
};
const Identifier = (parsedCode,arrayOfLocals) => {
    for (let i = arrayOfLocals.length - 1; i >= 0; i--) {
        if (parsedCode.name == arrayOfLocals[i].name) {
            return arrayOfLocals[i].value;
        }
    }
    return parsedCode.name;
};

const arrayExpString = (parsedCode,arrayOfLocals) => {
    let output = '[';
    for(let i=0;i<parsedCode.elements.length;i++) {
        output += expString(parsedCode.elements[i],arrayOfLocals);
        if(i < parsedCode.elements.length - 1) {
            output += ',';
        }
    }
    output += ']';
    return output;
};

const binaryExpString = (parsedCode,arrayOfLocals) => {
    return expString(parsedCode.left,arrayOfLocals) + ' ' + parsedCode.operator + ' ' + expString(parsedCode.right,arrayOfLocals);
};

const parseReturn = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals) => {
    if(parsedCode.argument.type == 'MemberExpression') {
        if(getAllNames(arrayOfLocals).includes(parsedCode.argument.object.name)) {
            let toAdd = 'return ' + checkLeftRight(fixLocals(expString(parsedCode.argument,arrayOfLocals),args,globals,arrayOfLocals)).toString() + ';';
            arrayOfCode.push(toAdd);
        }
        else {
            let toAdd = 'return ' + expString(parsedCode.argument,arrayOfLocals) + ';';
            arrayOfCode.push(toAdd);
        }
    }
    else {
        let toAdd = 'return ' + expString(parsedCode.argument, arrayOfLocals) + ';';
        arrayOfCode.push(toAdd);
    }
};

const parseVarDeclaration = (parsedCode , code , arrayOfCode,arrayOfLocals) => {
    for(let i=0;i<parsedCode.declarations.length;i++) {
        navigate(parsedCode.declarations[i], code, arrayOfCode,arrayOfLocals,false);
    }
};

const parseVarDeclarator = (parsedCode , code , arrayOfCode , arrayOfLocals) => {
    let flag = parsedCode.init != null;
    let value;
    if(flag) {
        value = expString(parsedCode.init,arrayOfLocals);
    }
    else {
        value = '';
    }
    let toAdd = {name: parsedCode.id.name , value: value};
    arrayOfLocals.push(toAdd);
};

const checkType = (flag) => {
    let type;
    if(flag)
        type = 'ElseIfStatement';
    else
        type = 'IfStatement';
    return type;
};

const parseIfConsequent = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals,colors) => {
    if(parsedCode.consequent.type == 'BlockStatement') {
        for (let i = 0; i < parsedCode.consequent.body.length; i++)
            navigate(parsedCode.consequent.body[i], code, arrayOfCode,arrayOfLocals, false,args,globals,colors);
    }
    else {
        if (parsedCode.consequent.type == 'ExpressionStatement')
            navigate(parsedCode.consequent.expression, code, arrayOfCode,arrayOfLocals,false,args,globals,colors);
        else
            navigate(parsedCode.consequent, code, arrayOfCode,arrayOfLocals, false,args,globals,colors);
    }
};

const checkBlockHelper = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals,colors) => {
    arrayOfCode.push('else {');
    for (let i = 0; i < parsedCode.alternate.body.length; i++) {
        navigate(parsedCode.alternate.body[i], code, arrayOfCode,arrayOfLocals, false,args,globals,colors);
    }
    arrayOfCode.push('}');
};

const checkNotBlockHelper = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals,colors) => {
    if (parsedCode.alternate.type == 'ExpressionStatement') {
        arrayOfCode.push('else {');
        navigate(parsedCode.alternate.expression, code, arrayOfCode, arrayOfLocals, false,args,globals,colors);
        arrayOfCode.push('}');
    }
    else {
        if (parsedCode.alternate.type == 'IfStatement')
            navigate(parsedCode.alternate, code, arrayOfCode, arrayOfLocals, true,args,globals,colors);
        else {
            arrayOfCode.push('else {');
            navigate(parsedCode.alternate, code, arrayOfCode, arrayOfLocals, false,args,globals,colors);
            arrayOfCode.push('}');
        }
    }
};

const parseIfAlternate = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals,colors) => {
    if(parsedCode.alternate != null) {
        if (parsedCode.alternate.type == 'BlockStatement') {
            checkBlockHelper(parsedCode,code,arrayOfCode,arrayOfLocals,flag,args,globals,colors);
        }
        else {
            checkNotBlockHelper(parsedCode,code,arrayOfCode,arrayOfLocals,flag,args,globals,colors);
        }
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

function maybeGlobalOrLocal(arrayOfLocals,globals,name) {
    for(let i = arrayOfLocals.length-1; i>=0;i--) {
        if(arrayOfLocals[i].name == name) {
            return arrayOfLocals[i].value;
        }
    }
    for(let i = globals.length-1; i>=0;i--) {
        if(globals[i].name == name) {
            return globals[i].value;
        }
    }
}

const checkMember = (output , string , args,globals,arrayOfLocals) => {
    let isArg = false;
    if(string.indexOf('[') != -1) {
        let name = string.substring(0, string.indexOf('[')), input = '' , index = string.substring(string.indexOf('[') + 1, string.indexOf(']')) , realIndex = eval(fixLocals(index, args,globals,arrayOfLocals));
        for (let i = args.length - 1; i >= 0; i--) {
            if (args[i].name == name) {
                isArg = true;
                input = args[i].value;
                break;
            }
        }
        if (!isArg)
            input = maybeGlobalOrLocal(arrayOfLocals,globals, name);
        input = input.substring(1, input.length - 1);
        let value = getTheValue(input, realIndex);
        output += value; }
    else
        output += string;
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

function checkGlobals (output,string,globals) {
    for(let j = globals.length - 1; j >= 0;j--) {
        if (string == globals[j].name) {
            output += globals[j].value;
            break;
        }
    }
    return output;
}
function helper (globals , output,string , args,arrayOfLocals) {
    if(getAllNames(globals).includes(string))
        return checkGlobals(output,string,globals);
    return checkMember(output, string, args , globals,arrayOfLocals);
}
const fixLocals = (string , args,globals,arrayOfLocals) => {
    let output = '' , isFound = false;
    let split = ezer(string);
    for (let i =0;i< split.length;i++) {
        for(let j = args.length - 1; j >= 0;j--) {
            if (split[i] == args[j].name) {
                output += args[j].value;
                isFound = true;
                break;
            }
        }
        if(!isFound) {
            output = helper (globals , output, split[i] , args,arrayOfLocals);
        }
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
    if (value == 'true' || value == 'false') {
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

const checkCondition = (condition , args , colors,lineNumber,parsedCode,globals,arrayOfLocals) => {
    let check = '';
    if(parsedCode.test.operator != null) {
        let left = '', right = '', split = condition.indexOf(parsedCode.test.operator);
        left = (condition.substring(0, split)).trim();
        if (parsedCode.test.operator.length == 2)
            right = (condition.substring(split + 2)).trim();
        else
            right = (condition.substring(split + 1)).trim();
        let valueInLeft = fixLocals(left,args,globals,arrayOfLocals) , valueInRight = fixLocals(right,args,globals,arrayOfLocals);
        let leftEval = checkLeftRight(valueInLeft) , rightEval = checkLeftRight(valueInRight);
        check = eval(leftEval + parsedCode.test.operator + rightEval);
    }
    else
        check = eval(fixLocals(condition,args,globals,arrayOfLocals));
    if(check == false)
        colors.push({line: lineNumber , color: 'OrangeRed'});
    else
        colors.push({line: lineNumber , color: 'LawnGreen'});
};

const parseIf = (parsedCode , code , arrayOfCode,arrayOfLocals , flag,args,globals,colors) => {
    let numberOfLocals = arrayOfLocals.length,numberOfArgs = args.length , numberOfGlobals = globals.length;
    let condition = expString(parsedCode.test,arrayOfLocals);
    let toAdd;
    if(checkType(flag) == 'IfStatement')
        toAdd = 'if(' + condition +') {';
    else
        toAdd = 'else if(' + condition +') {';
    arrayOfCode.push(toAdd);
    checkCondition(condition,args,colors,arrayOfCode.length,parsedCode,globals,arrayOfLocals);
    parseIfConsequent(parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals,colors);
    deleteLocals(arrayOfLocals,numberOfLocals);
    deleteArgs(args,numberOfArgs);
    deleteGlobals(globals,numberOfGlobals);
    arrayOfCode.push('}');
    parseIfAlternate(parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals,colors);
    deleteLocals(arrayOfLocals,numberOfLocals);
    deleteArgs(args,numberOfArgs);
    deleteGlobals(globals,numberOfGlobals);
};

const deleteArgs = (args,numberOfArgs) => {
    let length = args.length;
    for(let i=length - 1;i >= numberOfArgs;i--)
        args.splice(i,1);
};
const deleteLocals = (arrayOfLocals,numberOfLocals) => {
    let length = arrayOfLocals.length;
    for(let i=length - 1;i >= numberOfLocals;i--)
        arrayOfLocals.splice(i,1);
};
const deleteGlobals = (globals,numberOfGlobals) => {
    let length = globals.length;
    for(let i=length - 1;i >= numberOfGlobals;i--)
        globals.splice(i,1);
};
const parseWhile = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals,colors) => {
    let numberOfLocals = arrayOfLocals.length , numberOfArgs = args.length , numberOfGlobals = globals.length;
    let condition = expString(parsedCode.test,arrayOfLocals);
    let toAdd = 'while(' + condition +') {';
    arrayOfCode.push(toAdd);
    if(parsedCode.body.type == 'BlockStatement') {
        for (let i = 0; i < parsedCode.body.body.length; i++)
            navigate(parsedCode.body.body[i], code, arrayOfCode,arrayOfLocals, false,args,globals,colors);
    }
    else {
        if (parsedCode.body.type == 'ExpressionStatement')
            navigate(parsedCode.body.expression, code, arrayOfCode,arrayOfLocals, false,args,globals,colors);
        else
            navigate(parsedCode.body, code, arrayOfCode,arrayOfLocals, false,args,globals,colors);
    }
    deleteLocals(arrayOfLocals,numberOfLocals);
    deleteArgs(args,numberOfArgs);
    deleteGlobals(globals,numberOfGlobals);
    arrayOfCode.push('}');
};

const parseFunction = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals,colors) => {
    let params = '';
    for (let i = 0; i < parsedCode.params.length; i++) {
        params += parsedCode.params[i].name;
        if(i < parsedCode.params.length - 1) {
            params += ',';
        }
    }
    let toAdd = 'function ' + parsedCode.id.name + '(' + params + ') {';
    arrayOfCode.push(toAdd);

    for (let i = 0; i < parsedCode.body.body.length; i++) {
        navigate(parsedCode.body.body[i], code, arrayOfCode,arrayOfLocals,false,args,globals,colors);
    }
    arrayOfCode.push('}');
};

const changeArgs = (parsedCode ,args,arrayOfLocals,globals) => {
    for (let i = 0; i < args.length; i++) {
        if (parsedCode.left.name == args[i].name) {
            args.push({name:args[i].name,value: checkLeftRight(fixLocals(expString(parsedCode.right,arrayOfLocals),args,globals,arrayOfLocals)).toString()});
            break;
        }
    }
};

const addArgs = (parsedCode ,args,arrayOfLocals , arrayOfCode) => {
    let value = '';
    if(parsedCode.right.type == 'MemberExpression') {
        if (getAllNames(arrayOfLocals).includes(parsedCode.right.object.name)) {
            value = args[args.length-1].value;
        }
        else
            value = expString(parsedCode.right,arrayOfLocals);
    }
    else
        value = expString(parsedCode.right,arrayOfLocals);
    let toAdd = expString(parsedCode.left,arrayOfLocals) + ' ' + parsedCode.operator + ' ' + value + ';';
    arrayOfCode.push(toAdd);
    return arrayOfCode;
};


const changeLocals = (parsedCode,arrayOfLocals) => {
    for (let i = 0; i < arrayOfLocals.length; i++) {
        if (parsedCode.left.name == arrayOfLocals[i].name) {
            arrayOfLocals.push({name:arrayOfLocals[i].name,value: expString(parsedCode.right,arrayOfLocals)});
            break;
        }
    }
};

const changeGlobals = (parsedCode,globals) => {
    globals.push({name:parsedCode.left.name , value: expString(parsedCode.right,globals)});
    /*
    for (let i = 0; i < globals.length; i++) {
        if (parsedCode.left.name == globals[i].name) {
            globals.push({name:globals[i].name,value: expString(parsedCode.right,globals)});
            break;
        }
    }
    */
};

const addGlobals = (parsedCode,arrayOfLocals,globals , arrayOfCode) => {
    let value = '';
    if(parsedCode.right.type == 'MemberExpression') {
        if (getAllNames(arrayOfLocals).includes(parsedCode.right.object.name)) {
            value = globals[globals.length-1].value;
        }
        else
            value = expString(parsedCode.right,arrayOfLocals);
    }
    else
        value = expString(parsedCode.right,arrayOfLocals);
    let toAdd = expString(parsedCode.left,arrayOfLocals) + ' ' + parsedCode.operator + ' ' + value + ';';
    arrayOfCode.push(toAdd);
    return arrayOfCode;
};

const getAllNames = (arr) => {
    let output = [];
    for (let i = 0; i < arr.length; i++) {
        output.push(arr[i].name);
    }
    return output;
};

const parseAssignment = (parsedCode , code , arrayOfCode,arrayOfLocals,flag,args,globals) => {
    /*if(parsedCode.left.type == 'Identifier') {*/
    if(getAllNames(arrayOfLocals).includes(parsedCode.left.name))
        changeLocals(parsedCode,arrayOfLocals);
    if (getAllNames(args).includes(parsedCode.left.name)) {
        changeArgs(parsedCode,args,arrayOfLocals,globals);
        arrayOfCode = addArgs(parsedCode,args,arrayOfLocals,arrayOfCode);
    }
    if (getAllNames(globals).includes(parsedCode.left.name)) {
        changeGlobals(parsedCode,globals);
        arrayOfCode = addGlobals(parsedCode,arrayOfLocals,globals,arrayOfCode);
    }
    /*}
    else {
        //manageArrayChange();
    }*/
};


let types = { 'VariableDeclaration' : parseVarDeclaration , 'ReturnStatement' : parseReturn , 'IfStatement' : parseIf , 'WhileStatement': parseWhile, 'FunctionDeclaration' : parseFunction , 'VariableDeclarator' : parseVarDeclarator , 'AssignmentExpression' : parseAssignment};

const navigate = (parsedCode , code , arrayOfCode , arrayOfLocals,flag,args,globals,colors) => {
    if (parsedCode.length == undefined) {
        if (parsedCode.type == 'ExpressionStatement')
            types[parsedCode.expression.type](parsedCode.expression, code, arrayOfCode,arrayOfLocals,flag,args,globals,colors);
        else
            types[parsedCode.type](parsedCode, code, arrayOfCode,arrayOfLocals,flag,args,globals,colors);
    }
    else {
        for (let i = 0; i < parsedCode.length; i++) {
            /*
            if (parsedCode[i].type == 'ExpressionStatement')
                types[parsedCode[i].expression.type](parsedCode[i].expression, code, arrayOfCode,arrayOfLocals, flag,args,globals,colors);
            else
            */
            types[parsedCode[i].type](parsedCode[i], code, arrayOfCode,arrayOfLocals, flag,args,globals,colors);
        }
    }
};

const createTable = (array,colors) => {
    let paint = false;
    let color = '';
    let table = '<html><body><table border="1"><tbody>';
    for(let i=0;i<array.length;i++) {
        for (let j=0;j<colors.length;j++) {
            if((colors[j].line - 1) == i) {
                paint = true;
                color = 'bgcolor="' + colors[j].color + '"';
            }
        }
        if(paint)
            table += '<tr><td ' + color + '>' + array[i] + '</td></tr>';
        else
            table += '<tr><td>' + array[i] + '</td></tr>';
        paint = false;
    }
    table += '</tbody> </table></body></html>';
    return table;
};

export {parseCode,navigate,expString,createTable};

