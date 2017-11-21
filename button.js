var cookie = getCookie("UID");  //  UID编号;
var arrs=new Object;
var _objs = {};
$(document).ready(function () {
    _objs={"frameworkType": "Menu,Operation","isValid":1,"isExternal": 1,"UID":cookie};
    holdbutton(_objs);  //按钮数据
    console.log(_objs)
});
console.log(_objs)
//按钮数据
function holdbutton(_objs) {
    if(localStorage.getItem('childno')){
        childnodes=JSON.parse(localStorage.getItem('childno'));
        showhide(childnodes);
    }
    else{
        $.ajax({
            url:"/SaaS-Platform/system/v1/framework/queryFrameworkTree.do",
            type:"post",
            async:false,
            data:JSON.stringify(_objs),
            dataType:"json",
            contentType:"application/json",
            success:function (data) {
                var pathname=window.location.pathname;
                le=data.resultObj.length;
                for(i=0;i<le;i++){
                    for(j=0;j<data.resultObj[i].childNodes.length;j++){
                        var ex=data.resultObj[i].childNodes[j].frameworkNode.externalObj;
                        if(ex){
                            var url=ex.url;
                            if(url==pathname){
                                var childnodes=data.resultObj[i].childNodes[j].childNodes;
                                if(childnodes!=null && childnodes!="null" && childnodes!=undefined && childnodes!="undefined" && childnodes!=""){
                                    showhide(childnodes);
                                    localStorage.setItem('childno',JSON.stringify(childnodes))
                                }
                            }
                        }
                    }
                };
            }
        });
    }

}

//按钮出现隐藏
function showhide(arrs) {
        var arrlist=[];
        $("input[type=button]").each(function () {
            arrlist.push($(this).attr("class"))
        });
    $("input[type=button]").hide();
    // 扩展
        $.each(arrs,function (i,v) {
            var framework=v.frameworkNode.externalObj.urlInput;
            var type=v.frameworkNode.externalObj.operationType;
            var frameworkname=v.frameworkNode.frameworkName;
            var index=arrlist.indexOf(framework);
            if(type=="button"){
                if(index!=-1){
                    $("input[type=button]."+framework).show();
                    $("input[type=button]."+framework).val(frameworkname);
                }
                else{
                    $("body").append('<input type="button" value='+frameworkname+' class='+framework+'>')
                }
            }
            // 扩展  else if(type=="link"){
            // }
        })
}

//获取cookie里面的UID
function  getCookie(name) {
    var CookieFound = false;
    var start = 0;
    var end = 0;
    var CookieString = document.cookie;
    var i = 0;
    while (i <= CookieString.length) {
        start = i;
        end = start + name.length;
        if (CookieString.substring(start, end) == name) {
            CookieFound = true;
            break;
        }
        i++;
    }

    if (CookieFound) {
        start = end + 1;
        end = CookieString.indexOf(";", start);
        if (end < start)
            end = CookieString.length;
        return unescape(CookieString.substring(start, end));
    }
    return "";
};
