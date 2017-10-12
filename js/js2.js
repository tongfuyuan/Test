// f1 : function () {
//
//     alert(1);
// }
// f1();
var a=1;
function f1() {
     var a=2
}
f1();
function f2() {
    console.log(a);
}
f2();