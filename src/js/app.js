import $ from 'jquery';
import {parseCode, navigate,expString,createTable} from './code-analyzer';

const getArgs = (args,input) => {
    let separator = input.indexOf(',');
    while(separator != -1) {
        let arrayStart = input.indexOf('[');
        let arrayFinish = input.indexOf(']');
        if(arrayStart<separator && separator<arrayFinish) {
            let array = input.substring(arrayStart,arrayFinish+1);
            args.push(array);
            input = input.substring(arrayFinish+1);
            separator = input.indexOf(',');
            input = input.substring(separator+1);
            separator = input.indexOf(','); }
        else {
            let current = input.substring(0, separator);
            args.push(current.trim());
            input = input.substring(separator + 1);
            separator = input.indexOf(','); } }
    if(input.trim() != '')
        args.push(input.trim());
};

$(document).ready(function () {
    $('#newCodeButton').click(() => {
        let codeToParse = $('#codePlace').val();
        let parsedCode = parseCode(codeToParse);
        let inputArgs = [] , arrayOfCode = [],colors=[],args=[],globals=[],k=0;
        let input = $('#input').val();
        while (parsedCode.body[k].type == 'VariableDeclaration') {
            globals.push({name: parsedCode.body[k].declarations[0].id.name , value: expString(parsedCode.body[k].declarations[0].init,[])});
            k++;
        }
        getArgs(inputArgs,input);
        for (let i = 0; i < inputArgs.length;i++) {
            args.push({name: parsedCode.body[k].params[i].name , value: inputArgs[i]});
        }
        let arrayOfLocals = [];
        navigate(parsedCode.body[k] , codeToParse , arrayOfCode , arrayOfLocals , false,args,globals,colors);
        let table = createTable(arrayOfCode,colors);
        document.getElementById('tablePrint').innerHTML = table;
    });
});