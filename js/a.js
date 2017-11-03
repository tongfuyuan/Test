var str = '123,125,236,123';
var reg = /^(\d+,?)+$/;
alert(reg.test(str));