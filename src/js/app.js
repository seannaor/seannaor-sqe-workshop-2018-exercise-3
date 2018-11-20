import $ from 'jquery';
import {parseCode, navigate,createTable} from './code-analyzer';

$(document).ready(function () {
    $('#tableButton').click(() => {
        let codeToParse = $('#codePlace').val();
        let parsedCode = parseCode(codeToParse);
        let array = [];
        navigate(parsedCode.body , codeToParse , array , false);
        let table = createTable(array);
        document.getElementById('tablePrint').innerHTML = table;
    });
});