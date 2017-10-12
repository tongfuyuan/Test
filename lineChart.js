// 日月季年的变量；
var dateIndex = 0;
// 获取开始时间的默认值；
var nowDay = getNowDay();
var nowMonth = getNowMonth();
var nowQuarter = getNowQuarter();
var nowYear = getNowYear();

// 报表图形的类型；
var imgType = "";      //  区分折线、柱状
var cookie = getCookie("UID");   //  获取cookie；

// 接口
var companyUrl = "/SaaS-Platform/system/framework/queryFrameworkByType.do";
var echartHeaderUrl = "/PortalBilling/TableHeadController/getTableHead.do";     //获取表头数据的URL；
var autoCompleteUrl = '/PortalParking/parking/autoComplete.do';       //获取车场输入框名称自动补全的URL；
var reportDataUrl = "/PortalBilling/Billingcontroller/getReportDataByNew.do";
// 获取url中的参数；
var urlObj = getUrl();
var reportId = urlObj.reportId;      
var showType = urlObj.showType;           //  展示类型；
var searchType = urlObj.searchType;       //  查询类型， 老版本区分查车场维度还是时间维度；现在只有一种维度；
var companyCode = "";                    //  分公司编号；
var parkName = "";                       //   车场名称
var startTime = "";                      //   查询时间
var timeType="";                         //   时间维度 或者车场维度；
var APPKEY="1";

$(function(){
	getCompany();                       //   创建分公司；
	companyCode = $(".headFirst").data("code");  
	autoParkName(companyCode);    // 自动补全；------已修改为下拉框类型；
	defaultPark();               //  初始化页面，默认选中第一个车场;
	$("#startTime").val(nowDay);
	// 点击日期，添加className;
	$(".dataSearch a").click(function(){
		$("#startTime").val(nowDay);
		dateIndex = $(this).index();
		// (dateIndex);
		$(".dataSearch a").removeClass("dateSearch");
		$(".dataSearch a").eq(dateIndex).addClass("dateSearch");
		if(dateIndex == "0"){
		    $("#startTime").val(nowDay);
		}else if(dateIndex == "1"){
		    $("#startTime").val(nowMonth);
		}else if(dateIndex == "2"){
		    $("#startTime").val(nowYear);
		}
	});
	
	$("#startTime").focus(function(){
        focusFn(dateIndex);
	});
    // 初始数据
	var currentHeadData = new Object();
	var currentReportData = new Object();
	parkName = $(".parkName").val();
	// 首次，根据searchType判断，时间查询 or 车场查询；
	if(searchType == 1){
		currentHeadData = {"reportId":reportId,"timeType":"date_hour","showType":showType,"appKey":APPKEY};
		currentReportData = {"reportId":reportId,"timeType":"date_hour","time":nowDay,"parkIds":parkName,"companyCode":companyCode,"appKey":APPKEY};
		getEchartHead(currentHeadData,currentReportData); 
	}else if(searchType == 2){
		currentHeadData = {"reportId":reportId,"timeType":"park_hour","showType":showType,"appKey":APPKEY};
		currentReportData = {"reportId":reportId,"timeType":"park_hour","time":nowDay,"parkIds":parkName,"companyCode":companyCode,"appKey":APPKEY};
		getEchartHead(currentHeadData,currentReportData); 
	};  
	
	// 根据showType判断，折线 or 柱状；
	if(showType == 1){
		imgType = "line";
	}else if(showType == 2){
		imgType="bar";
	}else{
		return false;
	};
   
    //   点击分公司
    $(".head a").click(function(){
		$(".head a").removeClass("headFirst");
		$(this).addClass("headFirst");
		companyCode = $(this).data("code");
        parkName=$(".parkName").val();
        startTime=$(".Wdate").val();
        autoParkName(companyCode);
        var dateName=$(".dataSearch a.dateSearch").data("type");
        // 根据searchType判断，时间查询 or 车场查询；
		if(searchType==1){
			if(dateName=="Hour"){
			    timeType="date_hour";	
			}else if(dateName=="Day"){
				timeType="date_day";
			}else if(dateName=="Month"){
				timeType="date_month";
			}else if(dateName=="Quarter"){
				timeType="date_quarter";
			}else if(dateName=="Year"){
				timeType="date_month";
			}
		}else if(searchType==2){
			if(dateName=="Hour"){
				timeType="park_hour";	
			}else if(dateName=="Day"){
				timeType="park_day";
			}else if(dateName=="Month"){
				timeType="park_month";
			}else if(dateName=="Quarter"){
				timeType="park_quarter";
			}else if(dateName=="Year"){
				timeType="park_month";
			}
		}
		// 空
		if(startTime=="undefined"){
			startTime="";
		}
		if(parkName=="undefined"){
			parkName="";
		}

        var _data={"reportId":reportId,"timeType":timeType,"time":startTime,"parkIds":parkName,"companyCode":companyCode,"appKey":APPKEY};
	    getEchartHead({"reportId":reportId,"timeType":timeType,"showType":showType,"appKey":APPKEY},_data);

	});

	// 时间维度查询；
	$(".dataSearchBtn").click(function(){
		// 获取查询条件
		var dateName=$(".dataSearch a.dateSearch").data("type");
		startTime=$(".Wdate").val();
		parkName=$(".parkName").val();
		
		// 根据searchType判断，时间查询 or 车场查询；
		if(searchType==1){
			if(dateName=="Hour"){
			    timeType="date_hour";	
			}else if(dateName=="Day"){
				timeType="date_day";
			}else if(dateName=="Month"){
				timeType="date_month";
			}else if(dateName=="Quarter"){
				timeType="date_quarter";
			}else if(dateName=="Year"){
				timeType="date_month";
			}
		}else if(searchType==2){
			if(dateName=="Hour"){
				timeType="park_hour";	
			}else if(dateName=="Day"){
				timeType="park_day";
			}else if(dateName=="Month"){
				timeType="park_month";
			}else if(dateName=="Quarter"){
				timeType="park_quarter";
			}else if(dateName=="Year"){
				timeType="park_month";
			}
		}
		// 空
		if(startTime=="undefined"){
			startTime="";
		}
		if(parkName=="undefined"){
			parkName="";
		}
        // 参数
		var data={"reportId":reportId,"timeType":timeType,"time":startTime,"parkIds":parkName,"companyCode":companyCode,"appKey":APPKEY};
	    getEchartHead({"reportId":reportId,"timeType":timeType,"showType":showType,"appKey":APPKEY},data);
	});
});

// 日月季年对应的日期表；
function focusFn(dateIndex){
	// (dateIndex);
	if(dateIndex=="0"){
		WdatePicker({dateFmt:'yyyy-MM-dd',isShowClear:false,skin:'twoer',onpicked:function(){$("#startTime").blur()}});
	}else if(dateIndex=="1"){
	    WdatePicker({dateFmt:'yyyy-MM',isShowClear:false,skin:'twoer',onpicked:function(){$("#startTime").blur()}});
	}else if(dateIndex=="2"){
		WdatePicker({dateFmt:'yyyy',isShowClear:false,skin:'twoer',onpicked:function(){$("#startTime").blur()}});
	}
}



//  获取分公司数据；
function getCompany(){
    $('.company').children("option").remove();
	    // groupId = $(".companyType").val();
    $.ajax({
      	url : companyUrl,
      	type : "post",
      	async : false,
      //	data : JSON.stringify({"groupId" : groupId}),
	  	data : JSON.stringify({"frameworkType": "Company","isExternal": 0,"frameworkMethod": "1", "UID": cookie,"appKey":APPKEY}),
      	dataType : "json",
      	success : function(data){
      		// if(data.message.errorCode != "200"){
     //             return false;
      		// }
      		var _arr = data.resultObj;
            var _ids = "";
			var options = "";
			 $.each(_arr,function(i,value){
			 	_ids += value.companyId + ",";
			 	options += "<a href='javascript:void(0)' data-code="+value.companyId+">"+value.companyName+"</a>"; 

             });
			_ids = _ids.substr(0,_ids.length-1);
			$(".head").append("<a class='headFirst' href='javascript:void(0)' data-code=''>全部</a>");
			$(".head").append(options);
      	}
    });
};

// 获取url后面传递的参数;
function getUrl(){  
    var url=window.location.href;
    var num=url.indexOf("?");
    var theRequest=new Object();
	if(num!=-1){
	    var str=url.substr(Number(num)+1);
	    strs=str.split("&");
	    for(var i=0,l=strs.length;i<l;i++){
	      var _tmpPos =strs[i].split("=");
	      theRequest[_tmpPos[0]]=(_tmpPos[1]);
	    }
	}
    return theRequest;
}


// 获取当天时间
function getNowDay(){
	var now = new Date(); 
    today = now.getFullYear()+"-"+((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)+"-"+(now.getDate()<10?"0":"")+now.getDate();
    return today;
}
// 获取当月时间；
function getNowMonth(){
	var now = new Date(); 
    myMonth = now.getFullYear()+"-"+((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1);
    return myMonth;
}
// 获取当前季度
function getNowQuarter(){
	var now = new Date(); 
	var myYear=now.getFullYear();
	var month=now.getMonth();
	var myMonth=month+1;
	var myQuarter=Math.floor( ( myMonth % 3 == 0 ? ( myMonth / 3 ) : ( myMonth / 3 + 1 ) ) );
	var quarter=myYear+"年"+myQuarter+"季度";
	return quarter;
}
// 获取当年时间;
function getNowYear(){
	var now = new Date(); 
    myYear = now.getFullYear();
    return myYear;
}

// 调后台接口，获取报表表头；
function getEchartHead(obj,objs){
	$.ajax({
		url:echartHeaderUrl,
		type:'post',
		async:true,
		dataType:'json',
		contentType:"application/x-www-form-urlencoded; charset=utf-8",
		data:obj,

		success:function(data){
			var echartHeadArr=data.data;
			// 传参，获取报表数据
			getData(echartHeadArr,objs);
		}
	});
}

// 请求后台数据，并初始化报表，把参数传入echarts报表中；
function getData(headArr,obj){
	$.ajax({
		url:reportDataUrl,
		async:true,
		type:'post',
		dataType:'json',
		data:obj,

		contentType:'application/x-www-form-urlencoded; charset=utf-8',
		success:function(data){
			if(data.message.errorCode!="200"){
				return false;
			}else{
				var parkDataArr=data.data;   // 报表数据；
				var xArr=[];                 // x坐标；
				var reportList = [];         // 各类车型进出次数大数组
				var parkTypeArr=[];          // 车类型数组；
				var seriesArr=[];            // 报表参数option中的series数据；
				
				// 根据表头数组长度，创建报表数据容器；
				for(var i=0;i<headArr.length;i++){
                	reportList.push(new Array());	
                }

				// 获取报表表头---车类型；
				$.each(headArr,function(i,value){
					parkTypeArr[i]=value.colName;
				});
				
				// 遍历后台返还数据，获取报表展示数据；
				$.each(parkDataArr,function(i,value){
					xArr[i]=value.xAxis;
					for (var i=0;i<headArr.length;i++) {
						reportList[i].push(value[headArr[i].columnId].replace(/\,/ig,''));
					}
				});
				
				// 获取报表参数option中的series数据；
                for (var i=0;i<headArr.length;i++) {
                	var obj=new Object();
                	seriesArr[i]=obj;
                	obj["name"]=parkTypeArr[i];
                	obj["type"]=imgType;
                	obj["data"]=reportList[i];

                }
                // 传参，画报表图；
                echartsTable(parkTypeArr,xArr,seriesArr)
			}
		}
	});
}

// 初始化报表；
function echartsTable(arr1,arr2,arr3){
	// 基于准备好的dom，初始化echarts实例
	var myChart = echarts.init(document.getElementById('main'));	
	// 指定图表的配置项和数据
	option = {
	    tooltip : {
	        trigger: 'axis',
	        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        }
	    },
        dataZoom:{
        	type:"slider",
        	show: true,
        	showDetail:true,
        	start: 1,
		    end: 60,
		    backgroundColor:'#F3F3F3',  //  背景颜色，默认透明
		    fillerColor:'#D6D9DC',      //  选择区域填充颜色
		    handleColor:'#97A6A8',      //	控制手柄颜色
        },
	    legend: {
	    	left:'5%',
            data:arr1   // X轴；
	    },
	    grid:{
	    	show:true,
	    	left:'1%',
	    	right:'3%',
	    	height:'300px',
	    	containLabel :true,
	    },
	    calculable : true,
	    xAxis : [
	        {   
	        	splitLine: {
		          show: true
	            },
	            type : 'category',
	            boundaryGap: false,
                data:arr2   // 车场类型或者x坐标；
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
	        }
	    ],
	    series:arr3,
	};	
	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option);
	// 设置dom大小改变时，饼图跟着改变
	window.onresize=function(){
	  myChart.resize();
	}
}

// 获取自动补全的停车场名称
function autoParkName(companyCode){
	$(".parkName").children("option").remove();
	$.ajax({
		url:autoCompleteUrl,
	    type:"post",
	    async:false,
	    data : {"companyId":companyCode},
	    dataType:'json',
	    success:function(data){
	    	if(data.message.errorCode!="200"){
	    		return false;
	    	}
            var _arr = data.resultObj;
            createPark(_arr);          //  创建车场；
	    }
	});
}

function defaultPark(){
	$(".parkName option").eq(0).removeAttr("selected");
	$(".parkName option").eq(1).attr("selected","true");
}

//  创建车场；
function createPark(_ARR){
	$(".parkName").append("<option value=''>全部</option>");
    $.each(_ARR,function(i,value){
        $(".parkName").append("<option value="+value.parkId+">"+value.parkName+"</option>");
    });
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

