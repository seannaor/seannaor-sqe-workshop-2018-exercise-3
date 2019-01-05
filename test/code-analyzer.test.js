import assert from 'assert';
import {parseCode,navigate} from '../src/js/code-analyzer';
const esgraph = require('esgraph');


describe('simple functions',() => {
    it('check simple function' , () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { x=y; }').body , 'function foo(x,y,z) { x=y; }' , [] , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { x=y; }').body[0].body)[2] ,boxes);
        assert.equal(JSON.stringify(boxes),'["n1 [label=\\"<1>\\nx = y;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n2 [label=\\"<2>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
    it('add simple locals' , () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { let a = 1; x = a; }').body , 'function foo(x,y,z) { let a = 1; x = a; }' , [] , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { let a = 1; x = a; }').body[0].body)[2],boxes);
        assert.equal(JSON.stringify(boxes),'["n2 [label=\\"<2>\\nlet a = 1;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n3 [label=\\"<3>\\nx = a;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n4 [label=\\"<4>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
    it('add complex locals' , () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { let a = [1,2]; x = a[0]; return a[0];}').body , 'function foo(x,y,z) { let a = [1,2]; x = a[0]; return a[0];}' , [] , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { let a = [1,2]; x = a[0]; return a[0];}').body[0].body)[2],boxes);
        assert.equal(JSON.stringify(boxes),'["n4 [label=\\"<4>\\nlet a = [1,2];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n5 [label=\\"<5>\\nx = a[0];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n6 [label=\\"<6>\\nreturn a[0];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n7 [label=\\"<7>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
    it('add complex locals with complex values' , () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { let a = [\'Abc\',true]; x = a[0]; }').body , 'function foo(x,y,z) { let a = [\'Abc\',true]; x = a[0]; }' , [] , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { let a = [\'Abc\',true]; x = a[0]; }').body[0].body)[2],boxes);
        assert.equal(JSON.stringify(boxes),'["n7 [label=\\"<7>\\nlet a = [Abc,true];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n8 [label=\\"<8>\\nx = a[0];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n9 [label=\\"<9>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
});

describe(' more tests with functions', () => {
    it('check function', () => {
        let boxes = [];
        navigate(parseCode('function foo() { let a = 1; a=2; return a; }').body , 'function foo() { let a = 1; a=2; return a; }' , [] , [] , false,[],esgraph(parseCode('function foo() { let a = 1; a=2; return a; }').body[0].body)[2] ,boxes);
        assert.equal(JSON.stringify(boxes),'["n9 [label=\\"<9>\\nlet a = 1;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n10 [label=\\"<10>\\na = 2;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n11 [label=\\"<11>\\nreturn a;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n12 [label=\\"<12>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
    it('check function with if', () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { let a = [\'abc\',true]; if(a[1 + 0]==true) y = a[0]; }').body , 'function foo(x,y,z) { let a = [\'abc\',true]; if(a[1 + 0]==true) y = a[0]; }' , [] , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { let a = [\'abc\',true]; if(a[1 + 0]==true) y = a[0]; }').body[0].body)[2],boxes);
        assert.equal(JSON.stringify(boxes),'["n12 [label=\\"<12>\\nlet a = [abc,true];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n13 [label=\\"<13>\\na[1 + 0] == true\\", shape=\\"diamond\\", style=\\"filled\\"]","n14 [label=\\"<14>\\ny = a[0];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n15 [label=\\"<15>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
    it('check function with while', () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { let a = [\'abc\',true]; while(a[1]==true) x = a[0]; }').body , 'function foo(x,y,z) { let a = [\'abc\',true]; while(a[1]==true) x = a[0]; }' , [] , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { let a = [\'abc\',true]; while(a[1]==true) x = a[0]; }').body[0].body)[2],boxes);
        assert.equal(JSON.stringify(boxes),'["n15 [label=\\"<15>\\nlet a = [abc,true];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n16 [label=\\"<16>\\na[1] == true\\", shape=\\"diamond\\", style=\\"filled\\"]","n17 [label=\\"<17>\\nx = a[0];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n18 [label=\\"<18>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]');
    });
    it('check function with if differ', () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { let a = [1,true]; if(a[0] + 1 == 3) x = a[0]; }').body , 'function foo(x,y,z) { let a = [1,true]; if(a[0] + 1 == 3) x = a[0]; }' , [] , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { let a = [1,true]; if(a[0] + 1 == 3) x = a[0]; }').body[0].body)[2],boxes);
        assert.equal(JSON.stringify(boxes),'["n18 [label=\\"<18>\\nlet a = [1,true];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n19 [label=\\"<19>\\na[0] + 1 == 3\\", shape=\\"diamond\\", style=\\"filled\\"]","n20 [label=\\"<20>\\nx = a[0];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n21 [label=\\"<21>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
});

describe(' more tests', () => {
    it('check function with if different', () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { let a; if(x[0] + 1 > 3) x = a[0]; }').body , 'function foo(x,y,z) { let a; if(x[0] + 1 > 3) x = a[0]; }' , [] , [] , false,[{name: 'x' , value: '[1,2]'},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { let a; if(x[0] + 1 > 3) x = a[0]; }').body[0].body)[2],boxes);
        assert.equal(JSON.stringify(boxes),'["n21 [label=\\"<21>\\nlet a = ;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n22 [label=\\"<22>\\nx[0] + 1 > 3\\", shape=\\"diamond\\", style=\\"filled\\"]","n23 [label=\\"<23>\\nx = a[0];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n24 [label=\\"<24>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
    it('fixes', () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { let b; let a=0; let c; if(false) a=a+1; else if(a < 1) a=a+1; }').body , 'function foo(x,y,z) { let b; let a=0; let c; if(false) a=a+1; else if(a < 1) a=a+1; }' , [] , [] , false,[{name: 'x' , value: '[1,2]'},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { let b; let a=0; let c; if(false) a=a+1; else if(a < 1) a=a+1; }').body[0].body)[2],boxes);
        assert.equal(JSON.stringify(boxes),'["n24 [label=\\"<24>\\nlet b = ;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n25 [label=\\"<25>\\nlet a = 0;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n26 [label=\\"<26>\\nlet c = ;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n27 [label=\\"<27>\\nfalse\\", shape=\\"diamond\\", style=\\"filled\\"]","n28 [label=\\"<28>\\na = a + 1;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n29 [label=\\"<29>\\na < 1\\", shape=\\"diamond\\", style=\\"filled\\"]","n30 [label=\\"<30>\\na = a + 1;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n31 [label=\\"<31>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
    it('more fixes', () => {
        let boxes = [];
        navigate(parseCode('function foo(x,y,z) { let b; let a=[1]; let c; if(a[0] > 1) x = a[0]; }').body , 'function foo(x,y,z) { let b; let a=[1]; let c; if(a[0] > 1) x = a[0]; }' , [] , [] , false,[{name: 'x' , value: '[1,2]'},{name: 'y' , value: 2},{name: 'z' , value: 3}],esgraph(parseCode('function foo(x,y,z) { let b; let a=[1]; let c; if(a[0] > 1) x = a[0]; }').body[0].body)[2],boxes);
        assert.equal(JSON.stringify(boxes),'["n31 [label=\\"<31>\\nlet b = ;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n32 [label=\\"<32>\\nlet a = [1];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n33 [label=\\"<33>\\nlet c = ;\\", shape=\\"rectangle\\", style=\\"filled\\"]","n34 [label=\\"<34>\\na[0] > 1\\", shape=\\"diamond\\", style=\\"filled\\"]","n35 [label=\\"<35>\\nx = a[0];\\", shape=\\"rectangle\\", style=\\"filled\\"]","n36 [label=\\"<36>\\n end\\", shape=\\"circle\\", style=\\"filled\\", fillcolor=\\"green\\"]"]'); });
});