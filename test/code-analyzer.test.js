import assert from 'assert';
import {parseCode,navigate,createTable} from '../src/js/code-analyzer';


describe('simple functions',() => {
    it('check simple function' , () => {
        let arrayOfCode = [];
        navigate(parseCode('function foo(x,y,z) { x=y; }').body , 'function foo(x,y,z) { x=y; }' , arrayOfCode , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],[],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo(x,y,z) {","x = y;","}"]'); });
    it('add simple locals' , () => {
        let arrayOfCode = [];
        navigate(parseCode('function foo(x,y,z) { let a = 1; x = a; }').body , 'function foo(x,y,z) { let a = 1; x = a; }' , arrayOfCode , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],[],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo(x,y,z) {","x = 1;","}"]'); });
    it('add complex locals' , () => {
        let arrayOfCode = [];
        navigate(parseCode('function foo(x,y,z) { let a = [1,2]; x = a[0]; return a[0];}').body , 'function foo(x,y,z) { let a = [1,2]; x = a[0]; return a[0];}' , arrayOfCode , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],[],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo(x,y,z) {","x = 1;","return 1;","}"]');
    });
    it('add complex locals with complex values' , () => {
        let arrayOfCode = [];
        navigate(parseCode('function foo(x,y,z) { let a = [\'Abc\',true]; x = a[0]; }').body , 'function foo(x,y,z) { let a = [\'Abc\',true]; x = a[0]; }' , arrayOfCode , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],[],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo(x,y,z) {","x = \'Abc\';","}"]');
    });
});

describe(' more tests with functions', () => {
    it('check function with changing local', () => {
        let arrayOfCode = [];
        navigate(parseCode('function foo() { let a = 1; a=2; return a; }').body , 'function foo() { let a = 1; a=2; return a; }' , arrayOfCode , [] , false,[],[],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo() {","return 2;","}"]'); });
    it('check function with globals', () => {
        let arrayOfCode = [];
        navigate(parseCode('let d=0; function foo(x,y,z) { let a = [\'abc\',true]; if(a[1]==true) x = a[d]; if(a[0]==\'abc\') x=a[d];}').body[1] , 'let d=0; function foo(x,y,z) { let a = [\'abc\',true]; if(a[1]==true) x = a[d]; if(a[0]==\'abc\') x=a[d];}' , arrayOfCode , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],[{name: 'd' , value: 0}],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo(x,y,z) {","if(a[1] == true) {","x = \'abc\';","}","if(a[0] == abc) {","x = \'abc\';","}","}"]'); });
    it('check function with complex globals', () => {
        let arrayOfCode = [];
        navigate(parseCode('let d=[1,2]; let h=1; function foo(x,y,z) { let a = 0; x = d[a]; return d[0];}').body[2] , 'let d=[1,2]; let h=1; function foo(x,y,z) { let a = 0; x = d[a]; return d[0];}' , arrayOfCode , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],[{name: 'd' , value: '[1,2]'},{name:'h',value:1}],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo(x,y,z) {","x = d[0];","return d[0];","}"]');
    });
    it('check function with changing globals', () => {
        let arrayOfCode = [];
        navigate(parseCode('let d=1; function foo(x) {let u=[1]; if(d==1) {d=3; return d;} d=x[0]; d=u[0]; return d; }').body[1] , 'let d=1; function foo(x) {if(d==1) {d=3; return d;} d=x[0]; return d; }' , arrayOfCode , [] , false,[{name: 'x' , value: '[1]'}],[{name: 'd' , value: 1}],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo(x) {","if(d == 1) {","d = 3;","return d;","}","d = x[0];","d = u[0];","return d;","}"]');
    });
});


describe('more tests with functions', () => {
    it('test class example sadna1', () => {
        let arrayOfCode = [];
        navigate(parseCode('function binarySearch(X, V, n){let low, high, mid; low = 0; high = n - 1; while (low <= high) {mid = (low + high)/2; if (X < V[mid]) high = mid - 1; else if (X > V[mid]) low = mid + 1; else return mid; } return \'not found\'; }').body , 'function binarySearch(X, V, n){let low, high, mid; low = 0; high = n - 1; while (low <= high) {mid = (low + high)/2; if (X < V[mid]) high = mid - 1; else if (X > V[mid]) low = mid + 1; else return mid; } return \'not found\'; }' , arrayOfCode , [] , false,[{name: 'X' , value: 1},{name: 'V' , value: '[1,2]'},{name: 'n' , value: 2}],[],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function binarySearch(X,V,n) {","while(0 <= n - 1) {","if(X < V[0 + n - 1 / 2]) {","}","else if(X > V[0 + n - 1 / 2]) {","}","else {","return 0 + n - 1 / 2;","}","}","return not found;","}"]');
    });
    it('test class example 1', () => {
        let arrayOfCode = [];
        navigate(parseCode('function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; return x + y + z + c; } else { c = c + z + 5; return x + y + z + c; } }').body , 'function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; return x + y + z + c; } else { c = c + z + 5; return x + y + z + c; } }' , arrayOfCode , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],[],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo(x,y,z) {","if(x + 1 + y < z) {","return x + y + z + 0 + 5;","}","else if(x + 1 + y < z * 2) {","return x + y + z + 0 + x + 5;","}","else {","return x + y + z + 0 + z + 5;","}","}"]');
    });
    it('test class example 2', () => {
        let arrayOfCode = [];
        navigate(parseCode('function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; while (a < z) { c = a + b; z = c * 2; } return z; }').body , 'function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; while (a < z) { c = a + b; z = c * 2; } return z; }' , arrayOfCode , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],[],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo(x,y,z) {","while(x + 1 < z) {","z = x + 1 + x + 1 + y * 2;","}","return z;","}"]');
    });
});

describe('test for table creation', () => {
    it('test table creator',  () => {
        let arrayOfCode = [];
        let colors = [];
        navigate(parseCode('function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; return x + y + z + c; } else { c = c + z + 5; return x + y + z + c; } }').body , 'function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; return x + y + z + c; } else { c = c + z + 5; return x + y + z + c; } }' , arrayOfCode , [] , false,[{name: 'x' , value: 1},{name: 'y' , value: 2},{name: 'z' , value: 3}],[],colors);
        assert.equal(createTable(arrayOfCode,colors),'<html><body><table border="1"><tbody><tr><td>function foo(x,y,z) {</td></tr><tr><td bgcolor="OrangeRed">if(x + 1 + y < z) {</td></tr><tr><td>return x + y + z + 0 + 5;</td></tr><tr><td>}</td></tr><tr><td bgcolor="LawnGreen">else if(x + 1 + y < z * 2) {</td></tr><tr><td>return x + y + z + 0 + x + 5;</td></tr><tr><td>}</td></tr><tr><td>else {</td></tr><tr><td>return x + y + z + 0 + z + 5;</td></tr><tr><td>}</td></tr><tr><td>}</td></tr></tbody> </table></body></html>');
    });
});

describe('add tests', () => {
    it('add cases expression', () => {
        let arrayOfCode = [];
        navigate(parseCode('function test (x) {if(x>=0) return x; else x=1; if(true) x=1; while(x>0) x=1; while(x>0) return x;}' ).body, 'function test (x) {if(x>=0) return x; else x=1; if(true) x=1; while(x>0) x=1; while(x>0) return x;}' , arrayOfCode , [] , false,[{name: 'x' , value: 1}],[],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function test(x) {","if(x >= 0) {","return x;","}","else {","x = 1;","}","if(true) {","x = 1;","}","while(x > 0) {","x = 1;","}","while(x > 0) {","return x;","}","}"]');
    });
    it('check function with changing globals', () => {
        let arrayOfCode = [];
        navigate(parseCode('let d=0; let e=0; function foo () { if(d==0) return d; }').body[2] , 'let d=0; let e=0; function foo () { if(d==0) return d; }' , arrayOfCode , [] , false,[],[{name: 'd' , value: 0},{name:'e' , value: 0}],[]);
        assert.equal(JSON.stringify(arrayOfCode),'["function foo() {","if(d == 0) {","return d;","}","}"]');
    });
});


