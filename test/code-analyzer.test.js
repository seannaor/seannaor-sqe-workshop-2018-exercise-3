import assert from 'assert';
import {parseCode,navigate,createTable} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode(''),{loc:true}),
            '{"type":"Program","body":[],"sourceType":"script","loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;'),{loc:true}),'{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a","loc":{"start":{"line' +
            '":1,"column":4},"end":{"line":1,"column":5}}},"init":{"type":"Literal","value":1,"raw":"1","loc":{"start":{"line":1,"column":8},"end":{"line":1,"column":9}}},"loc":{"start' +
            '":{"line":1,"column":4},"end":{"line":1,"column":9}}}],"kind":"let","loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":10}}}],"sourceType":"script","loc":{"start' +
            '":{"line":1,"column":0},"end":{"line":1,"column":10}}}');
    });
});

describe('tests without functions',() => {
    it('check let' , () => {
        let array = [];
        navigate(parseCode('let a=1',{loc:true}).body , 'let a=1' , array , false);
        assert.equal(JSON.stringify(array),'[{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":1}]');
    });

    it('add simple assignment' , () => {
        let array = [];
        navigate(parseCode('let a=1; a=2;',{loc:true}).body , 'let a=1; a=2;' , array , false);
        assert.equal(JSON.stringify(array),'[{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":1},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":2}]');
    });
    it('add complex assignment' , () => {
        let array = [];
        navigate(parseCode('let array; let a=1; a=array[a]; a=1+array[a];',{loc:true}).body , 'let array; let a=1; a=array[a]; a=1+array[a];' , array , false);
        assert.equal(JSON.stringify(array),'[{"line":1,"type":"VariableDeclaration","name":"array","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":1},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":"array[a]"},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":"1 + array[a]"}]');
    });
});

describe('tests with functions', () => {
    it('check function with params', () => {
        let array = [];
        navigate(parseCode('function test (a,b) {}', {loc: true}).body, 'function test (a,b) {}', array, false);
        assert.equal(JSON.stringify(array), '[{"line":1,"type":"FunctionDeclaration","name":"test","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"b","condition":"","value":""}]');
    });
    it('check function without params', () => {
        let array = [];
        navigate(parseCode('function test () {}', {loc: true}).body, 'function test () {}', array, false);
        assert.equal(JSON.stringify(array), '[{"line":1,"type":"FunctionDeclaration","name":"test","condition":"","value":""}]');
    });
});


describe('more tests with functions', () => {
    it('test class example', () => {
        let array = [];
        navigate(parseCode('function binarySearch(X, V, n){let low, high, mid; low = 0; high = n - 1; while (low <= high) {mid = (low + high)/2; if (X < V[mid]) high = mid - 1; else if (X > V[mid]) low = mid + 1; else return mid; } return -1; }', {loc: true}).body, 'function binarySearch(X, V, n){let low, high, mid; low = 0; high = n - 1; while (low <= high) {mid = (low + high)/2; if (X < V[mid]) high = mid - 1; else if (X > V[mid]) low = mid + 1; else return mid; } return -1; }', array, false);
        assert.equal(JSON.stringify(array), '[{"line":1,"type":"FunctionDeclaration","name":"binarySearch","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"X","condition":"","va' +
            'lue":""},{"line":1,"type":"VariableDeclaration","name":"V","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"n","condition":"","value":""},{"line' +
            '":1,"type":"VariableDeclaration","name":"low","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"high","condition":"","value":""},{"line":1,"type":' +
            '"VariableDeclaration","name":"mid","condition":"","value":""},{"line":1,"type":"AssignmentExpression","name":"low","condition":"","value":0},{"line":1,"type":"AssignmentExpre' +
            'ssion","name":"high","condition":"","value":"n - 1"},{"line":1,"type":"WhileStatement","name":"","condition":"low <= high","value":""},{"line":1,"type":"AssignmentExpression' +
            '","name":"mid","condition":"","value":"low + high / 2"},{"line":1,"type":"IfStatement","name":"","condition":"X < V[mid]","value":""},{"line":1,"type":"AssignmentExpression' +
            '","name":"high","condition":"","value":"mid - 1"},{"line":1,"type":"ElseIfStatement","name":"","condition":"X > V[mid]","value":""},{"line":1,"type":"AssignmentExpression",' +
            '"name":"low","condition":"","value":"mid + 1"},{"line":1,"type":"ReturnStatement","name":"","condition":"","value":"mid"},{"line":1,"type":"ReturnStatement","name":"","c' +
            'ondition":""}]');
    });
});

describe('test complex expressions', () => {
    it('add if expression', () => {
        let array = [];
        navigate(parseCode('function test (a,b) {if(a>b) { return a; } else { return b; }}', {loc: true}).body, 'function test (a,b) {if(a>b) { return a; } else { return b; }}', array, false);
        assert.equal(JSON.stringify(array), '[{"line":1,"type":"FunctionDeclaration","name":"test","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":"' +
            '"},{"line":1,"type":"VariableDeclaration","name":"b","condition":"","value":""},{"line":1,"type":"IfStatement","name":"","condition":"a > b","value":""},{"line":1,"type' +
            '":"ReturnStatement","name":"","condition":"","value":"a"},{"line":1,"type":"ReturnStatement","name":"","condition":"","value":"b"}]');
    });
    it('add while expression', () => {
        let array = [];
        navigate(parseCode('function test (a,b) {let count = 0; while(a>b) { count=count+1; a=a-1; } return count;}', {loc: true}).body, 'function test (a,b) {let count = 0; while(a>b) { count=count+1; a=a-1; } return count;}', array, false);
        assert.equal(JSON.stringify(array), '[{"line":1,"type":"FunctionDeclaration","name":"test","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"b","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"count","condition":"","value":0},{"line":1,"type":"WhileStatement","name":"","condition":"a > b","value":""},{"line":1,"type":"AssignmentExpression","name":"count","condition":"","value":"count + 1"},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":"a - 1"},{"line":1,"type":"ReturnStatement","name":"","condition":"","value":"count"}]');
    });
    it('add for expression', () => {
        let array = [];
        navigate(parseCode('function test (a,b) {let count = 0; for(;a>b;a=a-1) { count=count+1; } return count;}', {loc: true}).body, 'function test (a,b) {let count = 0; for(;a>b;a=a-1) { count=count+1; } return count;}', array, false);
        assert.equal(JSON.stringify(array), '[{"line":1,"type":"FunctionDeclaration","name":"test","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"b","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"count","condition":"","value":0},{"line":1,"type":"ForStatement","name":"","condition":"a > b","value":""},{"line":1,"type":"AssignmentExpression","name":"count","condition":"","value":"count + 1"},{"line":1,"type":"ReturnStatement","name":"","condition":"","value":"count"}]');
    });
});

describe('test for table creation', () => {
    it('test table creator',  () => {
        let array = [];
        navigate(parseCode('let a=1;', {loc: true}).body, 'let a=1;', array, false);
        assert.equal(createTable(array),'<html><body><table border="2"><tbody><tr><td>Line</td><td>Type</td><td>Name</td><td>Condition</td><td>Value</td></tr><tr><td>1</td><td>VariableDeclaration</td><td>a</td><td></td><td>1</td></tr></tbody> </table></body></html>');
    });
    it('test complex table creator',  () => {
        let array = [];
        navigate(parseCode('function test (a,b) {let count = 0; while(a>b) { count=count+1; a=a-1; } return count;}', {loc: true}).body, 'function test (a,b) {let count = 0; while(a>b) { count=count+1; a=a-1; } return count;}', array, false);
        assert.equal((createTable(array)),'<html><body><table border="2"><tbody><tr><td>Line</td><td>Type</td><td>Name</td><td>Condition</td><td>Value</td></tr><tr><td>1</td><td>FunctionDeclaration</td><td>test</td><td></td><td></td></tr><tr><td>1</td><td>VariableDeclaration</td><td>a</td><td></td><td></td></tr><tr><td>1</td><td>VariableDeclaration</td><td>b</td><td></td><td></td></tr><tr><td>1</td><td>VariableDeclaration</td><td>count</td><td></td><td>0</td></tr><tr><td>1</td><td>WhileStatement</td><td></td><td>a > b</td><td></td></tr><tr><td>1</td><td>AssignmentExpression</td><td>count</td><td></td><td>count + 1</td></tr><tr><td>1</td><td>AssignmentExpression</td><td>a</td><td></td><td>a - 1</td></tr><tr><td>1</td><td>ReturnStatement</td><td></td><td></td><td>count</td></tr></tbody> </table></body></html>');
    });
});


describe('cover cases if test', () => {
    it('test', () => {
        let array = [];
        navigate(parseCode('function test (a) {if(a==0) {return a;} else {return a;} if(a==1) return a; else return a; if(a==0) {a=1;} else {a=3;} if(a==1) a=2; else a=4;}', {loc: true}).body, 'function test (a) {if(a==0) {return a;} else {return a;} if(a==1) return a; else return a; if(a==0) {a=1;} else {a=3;} if(a==1) a=2; else a=4;}', array, false);
        assert.equal(JSON.stringify(array),'[{"line":1,"type":"FunctionDeclaration","name":"test","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":"' +
            '"},{"line":1,"type":"IfStatement","name":"","condition":"a == 0","value":""},{"line":1,"type":"ReturnStatement","name":"","condition":"","value":"a"},{"line":1,"type":' +
            '"ReturnStatement","name":"","condition":"","value":"a"},{"line":1,"type":"IfStatement","name":"","condition":"a == 1","value":""},{"line":1,"type":"ReturnStatement","name' +
            '":"","condition":"","value":"a"},{"line":1,"type":"ReturnStatement","name":"","condition":"","value":"a"},{"line":1,"type":"IfStatement","name":"","condition":"a == 0"' +
            ',"value":""},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":1},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":3},{"lin' +
            'e":1,"type":"IfStatement","name":"","condition":"a == 1","value":""},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":2},{"line":1,"type":"Assignm' +
            'entExpression","name":"a","condition":"","value":4}]');
    });
});

describe('cover cases while,for test', () => {
    it('test', () => {
        let array = [];
        navigate(parseCode('function test (a) {while(a==0) {return a;} while(a==1) a=2; while(a==2) return a; while(a==0) {a=1;} for(let i=0;i<a;i=i+1) {return a;} for(let i=0;i<a;i=i+1) return a; for(let i=0;i<a;i=i+1) a=4; for(let i=0;i<a;i=i+1) {a=4;}}', {loc: true}).body, 'function test (a) {while(a==0) {return a;} while(a==1) a=2; while(a==2) return a; while(a==0) {a=1;} for(let i=0;i<a;i=i+1) {return a;} for(let i=0;i<a;i=i+1) return a; for(let i=0;i<a;i=i+1) a=4; for(let i=0;i<a;i=i+1) {a=4;}}', array, false);
        assert.equal(JSON.stringify(array),'[{"line":1,"type":"FunctionDeclaration","name":"test","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":"' +
            '"},{"line":1,"type":"WhileStatement","name":"","condition":"a == 0","value":""},{"line":1,"type":"ReturnStatement","name":"","condition":"","value":"a"},{"line":1,"type' +
            '":"WhileStatement","name":"","condition":"a == 1","value":""},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":2},{"line":1,"type":"WhileStatement",' +
            '"name":"","condition":"a == 2","value":""},{"line":1,"type":"ReturnStatement","name":"","condition":"","value":"a"},{"line":1,"type":"WhileStatement","name":"","conditi' +
            'on":"a == 0","value":""},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":1},{"line":1,"type":"ForStatement","name":"","condition":"i < a","value' +
            '":""},{"line":1,"type":"ReturnStatement","name":"","condition":"","value":"a"},{"line":1,"type":"ForStatement","name":"","condition":"i < a","value":""},{"line":1,"type' +
            '":"ReturnStatement","name":"","condition":"","value":"a"},{"line":1,"type":"ForStatement","name":"","condition":"i < a","value":""},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":4},{"line":1,"type":"ForStatement","name":"","condition":"i < a","value":""},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":4}]');
    });
    it('more cases' , () => {
        let array = [];
        navigate(parseCode('let a=1; if(a>1) a=1; if(a>1) {a=2;} else {if (a==2) {a=1;} else {a=5;}}',{loc:true}).body , 'let a=1; if(a>1) a=1; if(a>1) {a=2;} else {if (a==2) {a=1;} else {a=5;}}' , array , false);
        assert.equal(JSON.stringify(array),'[{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":1},{"line":1,"type":"IfStatement","name":"","condition":"a > 1","value":""},{"lin' +
            'e":1,"type":"AssignmentExpression","name":"a","condition":"","value":1},{"line":1,"type":"IfStatement","name":"","condition":"a > 1","value":""},{"line":1,"type":"Assignme' +
            'ntExpression","name":"a","condition":"","value":2},{"line":1,"type":"IfStatement","name":"","condition":"a == 2","value":""},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":1},{"line":1,"type":"AssignmentExpression","name":"a","condition":"","value":5}]');
    });
});
