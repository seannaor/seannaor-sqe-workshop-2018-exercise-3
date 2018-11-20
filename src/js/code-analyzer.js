import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc: true});
};

const memberExpString = (parsedCode) => {
    return parsedCode.object.name + '[' + expString(parsedCode.property) + ']';
};

const expString = (parsedCode) => {
    switch (parsedCode.type) {
    case 'Literal':
        return parsedCode.value;
    case 'Identifier':
        return parsedCode.name;
    case 'BinaryExpression':
        return binaryExpString(parsedCode);
    case 'MemberExpression':
        return memberExpString(parsedCode);
    }
};
const binaryExpString = (parsedCode) => {
    return expString(parsedCode.left) + ' ' + parsedCode.operator + ' ' + expString(parsedCode.right);
};

const parseReturn = (parsedCode , code , array) => {
    let toAdd = {line: parsedCode.loc.start.line , type:parsedCode.type , name: '' , condition: '' , value: expString(parsedCode.argument)};
    array.push(toAdd);
};

const parseVarDeclaration = (parsedCode , code , array) => {
    for(let i=0;i<parsedCode.declarations.length;i++) {
        navigate(parsedCode.declarations[i], code, array,false);
    }
};

const parseVarDeclarator = (parsedCode , code , array) => {
    let flag = parsedCode.init != null;
    let value;
    if(flag) {
        value = expString(parsedCode.init);
    }
    else {
        value = '';
    }
    let toAdd = {line: parsedCode.loc.start.line , type: 'VariableDeclaration' , name: parsedCode.id.name , condition: '' , value: value};
    array.push(toAdd);
};

const checkType = (flag) => {
    let type;
    if(flag)
        type = 'ElseIfStatement';
    else
        type = 'IfStatement';
    return type;
};

const parseIfConsequent = (parsedCode , code , array) => {
    if(parsedCode.consequent.type == 'BlockStatement') {
        for (let i = 0; i < parsedCode.consequent.body.length; i++)
            navigate(parsedCode.consequent.body[i], code, array, false);
    }
    else {
        if (parsedCode.consequent.type == 'ExpressionStatement')
            navigate(parsedCode.consequent.expression, code, array,false);
        else
            navigate(parsedCode.consequent, code, array, false);
    }
};

const checkBlockHelper = (parsedCode , code , array) => {
    for (let i = 0; i < parsedCode.alternate.body.length; i++) {
        navigate(parsedCode.alternate.body[i], code, array, false);
    }
};

const checkNotBlockHelper = (parsedCode , code , array) => {
    if (parsedCode.alternate.type == 'ExpressionStatement')
        navigate(parsedCode.alternate.expression, code, array, false);
    else {
        if (parsedCode.alternate.type == 'IfStatement')
            navigate(parsedCode.alternate, code, array, true);
        else
            navigate(parsedCode.alternate, code, array, false);
    }
};

const parseIfAlternate = (parsedCode , code , array) => {
    if(parsedCode.alternate != null) {
        if (parsedCode.alternate.type == 'BlockStatement') {
            checkBlockHelper(parsedCode,code,array);
        }
        else {
            checkNotBlockHelper(parsedCode,code,array);
        }
    }
};

const parseIf = (parsedCode , code , array , flag) => {
    let condition = expString(parsedCode.test);
    let toAdd = {line: parsedCode.loc.start.line , type: checkType(flag) , name: '' , condition: condition , value: ''};
    array.push(toAdd);
    parseIfConsequent(parsedCode , code , array);
    parseIfAlternate(parsedCode , code , array);
};

const parseWhile = (parsedCode , code , array) => {
    let condition = expString(parsedCode.test);
    let toAdd = {line: parsedCode.loc.start.line , type: parsedCode.type , name: '' , condition: condition , value: ''};
    array.push(toAdd);
    if(parsedCode.body.type == 'BlockStatement') {
        for (let i = 0; i < parsedCode.body.body.length; i++)
            navigate(parsedCode.body.body[i], code, array, false);
    }
    else {
        if (parsedCode.body.type == 'ExpressionStatement')
            navigate(parsedCode.body.expression, code, array, false);
        else
            navigate(parsedCode.body, code, array, false);
    }
};

const parseFor = (parsedCode , code , array) => {
    let condition = expString(parsedCode.test);
    let toAdd = {line: parsedCode.loc.start.line, type: parsedCode.type, name: '', condition: condition, value: ''};
    array.push(toAdd);
    if (parsedCode.body.type == 'BlockStatement') {
        for (let i = 0; i < parsedCode.body.body.length; i++)
            navigate(parsedCode.body.body[i], code, array, false);
    }
    else {
        if (parsedCode.body.type == 'ExpressionStatement')
            navigate(parsedCode.body.expression, code, array,false);
        else
            navigate(parsedCode.body, code, array,false);
    }
};
const parseFunction = (parsedCode , code , array) => {
    let toAdd = {line: parsedCode.loc.start.line , type: 'FunctionDeclaration' , name: parsedCode.id.name , condition: '' , value: ''};
    array.push(toAdd);
    for (let i = 0; i < parsedCode.params.length; i++) {
        let paramToAdd = {line: parsedCode.loc.start.line , type: 'VariableDeclaration' , name: parsedCode.params[i].name , condition: '' , value: ''};
        array.push(paramToAdd);
    }
    for (let i = 0; i < parsedCode.body.body.length; i++) {
        navigate(parsedCode.body.body[i], code, array,false);
    }
};

const parseAssignment = (parsedCode , code , array) => {
    let toAdd = {line: parsedCode.loc.start.line , type: parsedCode.type , name: parsedCode.left.name , condition: '' , value: expString(parsedCode.right)};
    array.push(toAdd);
};

const createTable = (array) => {
    let table = '<html><body><table border="2"><tbody>';
    table += '<tr><td>Line</td>';
    table +='<td>Type</td>';
    table += '<td>Name</td>';
    table += '<td>Condition</td>';
    table += '<td>Value</td></tr>';
    for(let i=0;i<array.length;i++) {
        table += '<tr><td>' + array[i].line + '</td>';
        table += '<td>' + array[i].type + '</td>';
        table += '<td>' + array[i].name + '</td>';
        table += '<td>' + array[i].condition + '</td>';
        table += '<td>' + array[i].value + '</td></tr>';
    }
    table += '</tbody> </table></body></html>';
    return table;
};


let types = { 'VariableDeclaration' : parseVarDeclaration , 'ReturnStatement' : parseReturn , 'IfStatement' : parseIf , 'WhileStatement': parseWhile, 'ForStatement' : parseFor , 'FunctionDeclaration' : parseFunction , 'VariableDeclarator' : parseVarDeclarator , 'AssignmentExpression' : parseAssignment};

const navigate = (parsedCode , code , array,flag) => {
    if (parsedCode.length == undefined) {
        if (parsedCode.type == 'ExpressionStatement') {
            types[parsedCode.expression.type](parsedCode.expression, code, array,flag);
        }
        else {
            types[parsedCode.type](parsedCode, code, array,flag);
        }
    }

    else {
        for (let i = 0; i < parsedCode.length; i++) {
            if (parsedCode[i].type == 'ExpressionStatement')
                types[parsedCode[i].expression.type](parsedCode[i].expression, code, array, flag);
            else
                types[parsedCode[i].type](parsedCode[i], code, array, flag);
        }
    }
};

export {parseCode,navigate,createTable};
