/**
 *  @author zyx
 *  @time 2017-03-10
 *  @content 设备管理;
 * 
 */
var tree1;
var cookie = getCookie("UID");
// var cookie = "e99bf8fcc7184f21a1afe4666dbc8d0d";

var parkName = "";    //  车场名称;
var parkId = "";      //　车场ID

var parkUrl = "/PortalParking/parking/autoComplete.do";
var URLTree="/PortalParking/ParkEquipments/getEquipments.do";//左侧树形结构接口

// var dataPark = {"resultObj":[{"parkName":"汽车南站停车场","parkId":"70"},{"parkName":"荣安大厦停车场","parkId":"71"},{"parkName":"奈伦大厦","parkId":"72"},{"parkName":"重庆八一广场停车场","parkId":"73"},{"parkName":"莱锦文化园停车场","parkId":"74"},{"parkName":"良渚玉鸟流苏停车场","parkId":"75"},{"parkName":"良渚文化美食街停车场","parkId":"76"},{"parkName":"良渚文化村七贤郡停车场","parkId":"77"},{"parkName":"西店文化产业园­","parkId":"78"},{"parkName":"上海同乐生活广场配套车场","parkId":"79"},{"parkName":"上海同乐生活广场","parkId":"80"},{"parkName":"富康大厦","parkId":"81"},{"parkName":"西溪华洋创意园停车场","parkId":"82"},{"parkName":"银润星座停车场","parkId":"83"},{"parkName":"武汉哈楼商业体停车场","parkId":"115"},{"parkName":"武汉兴怡生活广场停车场","parkId":"131"},{"parkName":"云停车测试","parkId":"142"},{"parkName":"测试云停车","parkId":"145"},{"parkName":"路测测试","parkId":"141"},{"parkName":"云停车测试","parkId":"142"},{"parkName":"测试云停车","parkId":"145"},{"parkName":"云停车测试1","parkId":"147"},{"parkName":"杭州下沙学正车场","parkId":"148"},{"parkName":"大武汉1911地下停车场","parkId":"157"},{"parkName":"了卡卡卡","parkId":"158"}],"message":{"errorCode":"200","errorDsc":"success!"}};

$(function() {
	getPark();
	// treeStructure();
});


var clickBol = true;

function getPark(){
	$.ajax({
		url:parkUrl,
		async:false,
		type:"post",
		data : JSON.stringify({"parkId":""}),
		dataType:"json",
		contentType:"application/json",
		success : function(data){
			// (data);
            var dataParkList = data.resultObj;
// console.log(dataParkList);
            if(dataParkList.length == "0"){
                 return false;
            };
            setParkNameFirst(dataParkList);     //  初始化页面时，赋值有权限的第一个车场;
		    var arr = $.map(dataParkList, function (value, key) { return { value: value.parkName, data: value.parkId };});
			$('.parkName').autocomplete({//车场名称自动补全
		        lookup: arr
		    });
            // (dataParkList);
            blurFn(dataParkList);      //  车场输入框失去焦点时；
            treeStructure();
		}
	})
}

function setParkNameFirst(_dataArr){    //   初始化页面赋值 有权限的第一个车场;
	var _name = $('.parkName').val();
	if(_name == ""){

    // var _id = _dataArr[14].parkId;
    // var _name1 = _dataArr[14].parkName;
		var _id = _dataArr[14].parkId;
    var _name1 = _dataArr[14].parkName;
    $(".parkName").val(_name1);
    $(".parkName").attr("data-code",_id);



console.log(_dataArr);


	}
}

function blurFn(dataParkList){

	$(".parkName").blur(function(){

		var _doms = $(".autocomplete-suggestion");
		var _name = $(".parkName").val();


		// _name == "" ? setParkNameFirst(dataParkList) : domsExist(dataParkList,_doms,_name);
		domsExist(dataParkList,_doms,_name); 
		treeStructure();
	});
}

function domsExist(dataParkList,_doms,_name){   //   监测匹配到的div是否存在;
    if(_name != ""){


        if(_doms.length>0){                        //   第一步：检验是否存在匹配的车场;
            checkParkName(_doms,_name);            //   存在，赋值

        }else{
            for (var i = 0; i < dataParkList.length; i++) {
                if(_name == dataParkList[i].parkName){
                    $(".parkName").attr("data-code",dataParkList[i].parkId);
                    break;
                }
            }
            setParkNameFirst(dataParkList);        //   不存在，赋值有权限的第一个车场;

        }

    }else{
        setParkNameFirst(dataParkList);        //   不存在，赋值有权限的第一个车场; 
    }
    
}

function checkParkName(_doms,_name){              //  输入框内有车场名时；
	// (_name);
    for (var i = 0; i < _doms.length; i++) {
        var _domName = $(_doms[i]).text();
        // (_domName);
        if(_name == _domName){
            var _domId = $(_doms[i]).data("code");
            $(".parkName").val(_domName);
            $(".parkName").removeAttr("data-code");
            $(".parkName").attr("data-code",_domId);
            return false;
        }
    }

    var _text = $(".autocomplete-suggestion").eq(0).text();        //  输入的车场不存在时，默认第一个有权限的车场;
	var _id = $(".autocomplete-suggestion").eq(0).data("code");
	// (_text);
	$(".parkName").removeAttr("data-code");
	$(".parkName").attr("data-code",_id);
	$(".parkName").val(_text);
}

// var data = {"message":{"errorCode":"200","errorDsc":"success!"},"resultObj":[{"enquipmentName":"车场","enquipmentCode":"RF001","isValid":"1","enquipmentId":1,"checked":false,"childList":[{"enquipmentName":"区域","enquipmentCode":"RF001001","isValid":"1","enquipmentId":2,"checked":false,"childList":[{"enquipmentName":"通道","enquipmentCode":"RF001001001","isValid":"1","enquipmentId":3,"checked":false,"id":"RF001001001","state":"open","text":"通道","isLeaf":"true","enquipmentType":"channel","parentId":"RF001001"},{"enquipmentName":"通道1","enquipmentCode":"RF001001002","isValid":"1","enquipmentId":3,"checked":false,"id":"RF001001002","state":"open","text":"通道","isLeaf":"true","enquipmentType":"channel2","parentId":"RF001001"}],"id":"RF001001","state":"open","text":"区域","isLeaf":"false","enquipmentType":"area","parentId":"RF001"},{"enquipmentName":"区域2","enquipmentCode":"RF001001","isValid":"1","enquipmentId":2,"checked":false,"id":"RF001001","state":"open","text":"区域","isLeaf":"true","enquipmentType":"area2","parentId":"RF001"}],"id":"RF001","state":"close","text":"车场","isLeaf":"false","enquipmentType":"carPark"}]};
/**
 *  tree
 **/
function treeStructure() {
	parkName = $(".parkName").val();
	parkId = $(".parkName").attr("data-code");
	$.ajax({ //获取树形结构生成的数据
		url: URLTree,
		type: 'post',
		data:JSON.stringify({"carParkId":parkId,"carParkName":parkName}),
		dataType: "json",
		contentType:"application/json",
		success: function(data) {
			var dataList = data.resultObj;
			// console.log(dataList);
			if(!dataList || dataList.length == "0" || dataList == ""){
                  return false;
			}
			tree1 = new Tree("contentTree");
			tree1.tree(dataList);
		},
		error: function() {
			//alert("error");
		}
	}).done(function() {
		//$("#contentTree li li ul").hide();
	});
	$("#contentTree").on("click", "span", postMsg);
}

function postMsg() {
	//($(this).data());
	$("#contentTree span").css("color","#333");
	$(this).css("color","#2277da");
	var _id = $(this).data("id");
	var _type = $(this).data("type");
	parkName = $(".parkName").val();
	var _parentName = $(this).text();
	document.getElementById("content").src = "/PortalParking/html/parkingDetail.html?" + "UID=" + cookie + "&id=" + _id+"&carParkId="+parkId+"&parentName="+_parentName+"&type="+_type;
	// var arr = data.id.split('-');
	// var iframe = document.getElementById("content").contentWindow;
	// 
	//根据data判断ifream是哪个页面
	
	// switch(_type){
	// 	case "carPark":
	// 	document.getElementById("content").src = "/PortalParking/html/parkingDetail.html?" + "UID=" + cookie + "&id=" + _id+"&carParkId="+parkId+"&parentName="+_parentName+"&type="+_type;
	// 	break;
		
	// 	case "area":
	// 	document.getElementById("content").src = "/PortalParking/html/parkingDetail.html?" + "UID=" + cookie + "&id=" + _id+"&carParkId="+parkId+"&parentName="+_parentName+"&type="+_type;
	// 	break;
		
	// 	case "box":
	// 	document.getElementById("content").src = "/PortalParking/html/parkingDetail.html?" + "UID=" + cookie + "&id=" + _id+"&carParkId="+parkId+"&parentName="+_parentName+"&type="+_type;
	// 	break;
		
	// 	case "PAD":
	// 	document.getElementById("content").src = "/PortalParking/html/parkingDetail.html?" + "UID=" + cookie + "&id=" + _id+"&carParkId="+parkId+"&parentName="+_parentName+"&type="+_type;
	// 	break;
		
	// 	case "access":
	// 	document.getElementById("content").src = "/PortalParking/html/parkingDetail.html?" + "UID=" + cookie + "&id=" + _id+"&carParkId="+parkId+"&parentName="+_parentName+"&type="+_type;
	// 	break;
		
	// 	case 3:
	// 	document.getElementById("content").src = "/PortalParking/html/parkingDetail.html?" + "UID=" + cookie + "&id=" + _id+"&carParkId="+parkId+"&parentName="+_parentName+"&type="+_type;
	// 	break;

	// 	case 4:
	// 	document.getElementById("content").src = "/PortalParking/html/parkingDetail.html?" + "UID=" + cookie + "&id=" + _id+"&carParkId="+parkId+"&parentName="+_parentName+"&type="+_type;
	// 	break;
		
	// }
	// iframe.postMessage(_id, "*");

}

function Tree(id) {
	this.dom = $("#" + id);
	//this.data = [];
}
//生成tree的html
Tree.prototype.getHTML = function(_json, _stat) {
	// (_json);
	var html = "<ul style=\"" + _stat + "\">";
	for(var i = 0, l = _json.length; i < l; i++) {
		if(_json[i].isLeaf === "false") {
			html += "<li id="+_json[i].enquipmentType+" class=\"has_children\"><div class='haschild' onclick=\"javascript:tree1.onclick(this)\" ><img src='image/"+_json[i].enquipmentType+".png' alt='Kong'>" +
				"</div><span data-id=\"" + _json[i].id + "\" data-type=\"" + _json[i].enquipmentType + "\">" + _json[i].enquipmentName + "</span>";
			html += this.getHTML(_json[i].childList, "display:none;");
			html += "</li>";
		} else {
			html += "<li id="+_json[i].enquipmentType+" class=\"no_children\"><div class='nochild' onclick=\"javascript:tree1.onclick(this)\" ><img src='image/"+_json[i].enquipmentType+"1.png'>" +
				"</div><span data-id=\"" + _json[i].id + "\" data-type=\"" + _json[i].enquipmentType + "\">" + _json[i].enquipmentName + "</span></li>";
		}
	}
	html += "</ul>";
	parkName = $(".parkName").val();
	$("#contentTree span").eq(0).css("color","#2277da");
	document.getElementById("content").src = "/PortalParking/html/parkingDetail.html?" + "UID=" + cookie + "&id=" + _json[0].id+"&carParkId="+parkId+"&type="+_json[0].enquipmentType+"&parentName="+_json[0].enquipmentName;
	return html;
}

//Tree的点击方法
Tree.prototype.onclick = function(_this) {
 //    if($(_this).parent().hasClass("has_children")) {
	// 	$(_this).toggleClass("haschild");
	// 	$(_this).parent().children("ul").toggle(); //toggle方法实现元素的隐藏显示切换效果
	// }
	// cancelBubble(); //阻止事件冒泡


	if($(_this).parent().hasClass("has_children")) {
		$(_this).parent().children("ul").toggle(); //toggle方法实现元素的隐藏显示切换效果
	}
	cancelBubble(); //阻止事件冒泡
}


Tree.prototype.tree = function(data) {
	//生成树
	this.dom.html(this.getHTML(data, "display:block;"));
	setBackgroundImg();
}

function setBackgroundImg(){
	$(".has_children").parent().show();
	$(".no_children").parent().show();
	var _hasChildDivImgs = $(".has_children");
	var _noChildDivImgs = $(".no_children");
    // !_hasChildDivImgs ? return false : checkImgSrcExist(_hasChildDivImgs);
    // !_noChildDivImgs ?  return false : checkImgSrcExist(_noChildDivImgs);
    checkImgSrcExist(_hasChildDivImgs);
    checkImgSrcExist(_noChildDivImgs);
}

function checkImgSrcExist(_dom){
    var _imgs = _dom.children("div").children("img");
	var _name = $(_dom)[0].className;
	_imgs.each(function(i,item){
		var _imgNew = new Image(); 
		_imgNew.src = item.src;
	    _imgNew.onload = function(){     //  图片加载成功时;
	    	// ("有");
	    };
	    _imgNew.onerror = function(){   //   图片加载失败时；
	    	_name == "has_children" ? item.src = "image/open.png" : item.src = "image/signal.png";
	    };
	});
}



function getEvent() {
	if(window.event) {
		return window.event;
	}
	func = getEvent.caller;
	while(func != null) {
		var arg0 = func.arguments[0];
		if(arg0) {
			if((arg0.constructor == Event || arg0.constructor == MouseEvent || arg0.constructor == KeyboardEvent) ||
				(typeof(arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
				return arg0;
			}
		}
		func = func.caller;
	}
	return null;
}

//阻止冒泡
function cancelBubble() {
	var e = getEvent();
	if(window.event) {
		e.cancelBubble = true; //阻止冒泡
	} else if(e.preventDefault) {
		e.stopPropagation(); //阻止冒泡
	}
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





