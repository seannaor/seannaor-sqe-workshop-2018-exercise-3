import $ from 'jquery';
import {parseCode, navigate} from './code-analyzer';
const esgraph = require('esgraph');
const d3 = require('d3-graphviz');

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

const fixBoxes = (boxes,cfg) => {
    let src = '';
    for(let i=0;i<boxes.length;i++) {
        src += boxes[i];
        if(cfg[i+1].type == 'exit') {
            continue;
        }
        if(cfg[i+1].color == 'green') {
            src = src.substring(0,src.length - 1);
            src += ', fillcolor="green"]';
        }
        else {
            src = src.substring(0,src.length - 1);
            src += ', fillcolor="white"]';
        }
    }
    return src;
};

const getEdges = (cfg,edges) => {
    let i = 1;
    while(i < cfg[2].length) {
        let start = 'n' + i;
        if (cfg[2][i].false != undefined) {
            let finish = 'n' + cfg[2].indexOf(cfg[2][i].false);
            edges.push(start + '->' + finish + '[label="F"] ');
        }
        if (cfg[2][i].true != undefined) {
            let finish = 'n' + cfg[2].indexOf(cfg[2][i].true);
            edges.push(start + '->' + finish + '[label="T"] ');
        }
        if (cfg[2][i].normal != undefined) {
            let finish = 'n' + cfg[2].indexOf(cfg[2][i].normal);
            edges.push(start + '->' + finish + '[] ');
        }
        i++;
    }
};


$(document).ready(function () {
    $('#newCodeButton').click(() => {
        let codeToParse = $('#codePlace').val();
        let parsedCode = parseCode(codeToParse);
        let inputArgs = [] , arrayOfCode = [],args=[],arrayOfLocals = [],boxes = [],k=1,edges=[];
        let input = $('#input').val();
        getArgs(inputArgs,input);
        for (let i = 0; i < inputArgs.length;i++)
            args.push({name: parsedCode.body[0].params[i].name , value: inputArgs[i]});
        let cfg = esgraph(parsedCode.body[0].body);
        navigate(parsedCode.body[0].body , codeToParse , arrayOfCode , arrayOfLocals , false,args,cfg[2],boxes,k);
        getEdges(cfg,edges);
        let src = fixBoxes(boxes,cfg[2]) + ' ';
        for(let i=0;i<edges.length;i++)
            src += edges[i];
        d3.graphviz('#graph').renderDot('digraph { forcelabels=true '  + src + '}');
    });
});