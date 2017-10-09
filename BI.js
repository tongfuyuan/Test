
var gridObj;
var STARTTIME = "";                  // 开始时间；
var ENDTIME = "";                   //  结束时间；
var _parkObj = new Object();       //   全部车场Id集合；
var _parkIdTha = "";              //    全部车场Ids；
var TimeType = "date_day";
var appKey = "1";
var totalCountArr2 = [];  // 存放营收数组;
var tempAmountArr2 = [];  //临停收入；
var incomeLast = [];
var currentLast = [];  // 上期车流量;
var electronic3 = [];
var str=0;
var lastCount =0;
var _todayCount = 0;
var _current = 0;
var _currentLast = 0;
var _count3=0;
var a = 0;
var f= 0;
var e = 0;
var _totalMoney3 = "";
var _totalMoney2 = "";
var currentLast4 = [];
var _todayFlow ="";
var STARTTIME2 = "";
var ENDTIME2 = "";
var STARTTIME5 = "";
var ENDTIME5 = "";
var monthFirstDay = "";
// var parkinglotUtilization ="";    
var operateAmount = "";
var iconsUrl = ["../images/point6.png", "../images/yellow2.png", "../images/red.png"];
$(document).ready(function(){
    map();                         //   地图写入；
    refresh2();                    //    地图弹窗及图标；
    getMapData();
    getTodatMonth();
    search.init();               //     表格部分；
    echartsFn.init();           //      echarts部分；
    // mapFn.init();              //       map地图部分； 
    getTableHeader();         //        实时收费情况表格数据；
    getTableHeader2();       //         车场收费排行表格数据；
    window.setInterval(function(){
    search.model.getTotalMoney();
    search.model.getTotalParkFlowData();
    echartsFn.model.getEchartsParkFlow2("213",STARTTIME,ENDTIME,_parkIdTha,TimeType);   
    }, 5000); 
    window.setInterval(function(){
    search.view.showTime2();
    getTableData();
    getTableData2(); 
    }, 10000);
                  
});

var search = {
    init :function(){
      search.view.showTime();     //    初始化页面时间；
      search.view.showTime2();
      search.model.getPark();    //     获取所有有权限的车场；
      search.model.getTotalLastMoney();
      search.model.getTotalMoney();  // 获取中间模版今日总收入；

      search.model.getTotalParkFlowData(); //今日总车流量；
      search.model.getSingleltCharge();  //单笔临停平均收费；          
    }
};

search.view = {
    showTime : function(){       //      初始化页面时间；
        var now = new Date();
        var _startTime = "";
            _startTime = now.getFullYear()+"."
                  +((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)+"."
                  +((now.getDate()<10?"0":"")+now.getDate());
         
        STARTTIME = search.view.TimeDeletePoint(_startTime);
        ENDTIME = search.view.TimeDeletePoint(_startTime);          
    },
    showTime2 : function(){       //      初始化页面时间；
        var now = new Date();
        var _startTime = "";
            _startTime = now.getFullYear()+"."
                  +((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)+"."
                  +((now.getDate()<10?"0":"")+now.getDate())+" "
                  +(now.getHours()<10?"0":"") + (now.getHours())+":"
                  +(now.getMinutes()<10?"0":"") + (now.getMinutes())+":"
                  +((now.getSeconds()<10?"0":"")+now.getSeconds());
         
            $(".time").html(_startTime);          
    },
    TimeDeletePoint : function(_arg){                //  时间格式的点转化为-;
        var _time = "";
        _time = _arg.replace(/\./ig,"-");
        return _time;
    },       
};
search.model = {
    getPark : function(){
        $.ajax({
            url : ruleUrlObj.parkUrl,
            async : false,
            type : "post",
            data : {"companyId":""},
            dataType : "json",
            // contentType : "application/json",
            success : function(data){
                var _arr = data.resultObj;
                var _parkIds ="";
                    $.each(_arr,function(i,value){
                        var parkIds = _arr[i].parkId;
                        // console.log(parkIds);
                        _parkIds += parkIds+ ",";
                    }); 
                _parkObj._parkIds = _parkIds.substr(0,_parkIds.length-1);
                _parkIdTha = _parkObj._parkIds;                  
            }
        });     
    },
    getTotalMoney : function(){
          $.ajax({
            url:ruleUrlObj.totalMoneyUrl,
            async:false,
            type:"post",
            data:{"companyCode":"","appKey":appKey,"time":STARTTIME,"endTime":STARTTIME,"isTotal":1},
            dataType:"json",
            success : function(data){
                var _arr = data.data[0];
                var _tempAmount = Number((_arr.tempAmount).replace(/\,/ig,''));
                var _apportionmentAmount = Number((_arr.apportionmentAmount).replace(/\,/ig,''));
                var _totalMoney =_tempAmount+_apportionmentAmount;
                _totalMoney2 = String(_totalMoney);
                var _integer = _totalMoney2.split(".");//把总共的钱分开整数跟小数；
                var _integer1 = _integer[0];          // 整数部分；
                var _decimals = _integer[1];          // 小数部分；
                // console.log(_decimals);
                // var _decimals2 = _decimals.toFixed(2);
                $(".num").text("");
                $(".num2").text("");
                $(".num").text('000,000,0'+(_integer1.replace(/\B(?=(\d{3})+(?!\d))/g, ","))+".");
                if(_decimals == undefined ||_decimals == ""||_decimals =="undefined"){
                   $(".num2").text("00 元");                    
                }else{
                    $(".num2").text((_decimals+"00").substr(0,2)+" 元");
                }
                // console.log(_totalMoney2);
                // console.log(_totalMoney3);
                var _todayMoney =Number(_totalMoney2);
                var _lastDayMoney =Number(_totalMoney3);
                // console.log(_todayMoney); 
                // console.log(_lastDayMoney);
                var proportion = (((_todayMoney-_lastDayMoney)/_lastDayMoney)*100).toFixed(2);
                // console.log(proportion);
                $(".ratioNum").html(proportion + "%");
                if(proportion<0){
                    $(".arrows").css("color","green").html("↓");
                }else{
                    $(".arrows").css("color","red").html("↑");
                } 
            }
          })
    },

    getTotalLastMoney : function(){
        yesterday();
          $.ajax({
            url:ruleUrlObj.totalMoneyUrl,
            async:false,
            type:"post",
            data:{"companyCode":"","appKey":appKey,"time":STARTTIME5,"endTime":ENDTIME5,"isTotal":1},
            dataType:"json",
            success : function(data){
                var _arr = data.data[0];
                var _tempAmount = Number((_arr.tempAmount).replace(/\,/ig,''));
                var _apportionmentAmount = Number((_arr.apportionmentAmount).replace(/\,/ig,''));
                var _totalMoney =(_tempAmount+_apportionmentAmount).toFixed(2);
                _totalMoney3 = String(_totalMoney);
                $(".lastTotalNum").text(_totalMoney3+"元");
                // console.log(_totalMoney2);
                // console.log(_totalMoney3);                
            }
          })
    },    
    getTotalParkFlowData : function(){
        $.ajax({
            url : ruleUrlObj.totalParkFlowUrl,
            async : false,
            type : "post",
            data : {"reportId":"61","appKey":appKey,"timeType":TimeType,"time":STARTTIME,"endTime":ENDTIME,"parkIds":_parkIdTha},
            dataType : "json",
            // contentType : "application/json",
            success : function(data){ 
                var _arr = data.resultObj;
                var _count = _arr.count;
                $(".rightMainNum2").html(_count);                
            }
        });        
    },
    getSingleltCharge : function(){
        $.ajax({
            url : ruleUrlObj.singleltCharge,
            async : false,
            type : "post",
            data : {"reportId":"353","appKey":appKey,"timeType":"date_day","time":STARTTIME,"endTime":ENDTIME,"parkIds":_parkIdTha},
            dataType : "json",
            // contentType : "application/json",
            success : function(data){ 
                var _arr = data.data[0];
                var _c0 = (_arr.c0).replace(/\,/ig,'');
                var _c1 = _arr.c1;
                // console.log(_c0);
                // console.log(_c1);
                var _c2 = (Number(_c0)/Number(_c1)).toFixed(2);
                // console.log(Number(_c0));
                // console.log(Number(_c1));
                // console.log(_c2);
                $(".ltChargeNum").text(_c2+"元");                
            }
        });         
    }   
}

var echartsFn = {
    init : function(){
        echartsFn.model.getEchartsHeader2("351",STARTTIME,ENDTIME,_parkIdTha); //营收趋势折线图；
        echartsFn.model.getEchartsHeader("351",STARTTIME,ENDTIME,_parkIdTha);  //营收趋势折线图；
        echartsFn.model.getEchartsAliPay("321",STARTTIME,ENDTIME,_parkIdTha);  //支付分析饼图；
        echartsFn.model.getEchartsPayType("330",STARTTIME,ENDTIME,_parkIdTha); //线上支付类型分析饼图；
       
        echartsFn.model.getEchartsParkFlow3("213",STARTTIME,ENDTIME,_parkIdTha,TimeType); 
        echartsFn.model.getEchartsParkFlow4("61",STARTTIME,ENDTIME,_parkIdTha,TimeType);
         echartsFn.model.getEchartsParkFlow2("213",STARTTIME,ENDTIME,_parkIdTha,TimeType); //车流量趋势折线图
        echartsFn.model.getEchartsParkFlow("213",STARTTIME,ENDTIME,_parkIdTha,TimeType); //车流量趋势折线图；
        
        
        echartsFn.model.getEchartsTypeAnalysis("352",STARTTIME,ENDTIME,_parkIdTha,TimeType);
        echartsFn.model.getParkFlowrate8("321",STARTTIME,ENDTIME,_parkIdTha,TimeType);//电子支付日；
        echartsFn.model.getParkFlowrate2("321",STARTTIME,ENDTIME,_parkIdTha,TimeType);//电子支付日；
        echartsFn.model.getParkFlowrate("321",STARTTIME,ENDTIME,_parkIdTha,TimeType);//电子支付月；
        echartsFn.model.getRegionCharge("353",STARTTIME,ENDTIME,_parkIdTha,TimeType);//各大区收费
        
    }
};

echartsFn.view = {
    operateDataOne2 : function(reportId,_headArr,_dataArr2,STARTTIME,ENDTIME,_parkIdTha){   //  上期报表数据; 
        // console.log(_dataArr2);


        for(var i=0; i< _dataArr2.length;i++){
           totalCountArr2.push((_dataArr2[i].c1).replace(/\,/ig,''));
           tempAmountArr2.push((_dataArr2[i].c2).replace(/\,/ig,''));        
        } 

        for(var i=0; i<15;i++){
            var income3 = (Number(totalCountArr2[i].replace(/\,/ig,''))+Number(tempAmountArr2[i].replace(/\,/ig,''))).toFixed(2);
            incomeLast.push(String(income3));
        } 
        // console.log(incomeLast);                
    },  
    operateDataOne : function(reportId,_headArr,_dataArr,STARTTIME,ENDTIME,_parkIdTha){   //本期报表收入获取与本期和上期收入数据传入；
        // console.log(_dataArr);
        var dataObj = new Object();        //  数据集合;
        var xAxisArr = [];   // x坐标；
        var totalCountArr = [];  // 存放营收数组;
        var tempAmountArr = [];  //临停收入；
        var income = [];
        for(var i=0; i< _dataArr.length;i++){
           totalCountArr.push((_dataArr[i].c1).replace(/\,/ig,''));
           tempAmountArr.push((_dataArr[i].c2).replace(/\,/ig,''));
           xAxisArr.push(_dataArr[i].xAxis.substr(5,5));
        } 

        for(var i=0; i<15;i++){
            var income1 = (Number(totalCountArr[i].replace(/\,/ig,''))+Number(tempAmountArr[i].replace(/\,/ig,''))).toFixed(2);
            income.push(String(income1));
        }  
        dataObj["totalCount"] = income;
        // console.log(income);
        for(var j=0; j<income.length;j++){
            _todayCount += Number(income[j]);
        }  
        $(".firstSpan7").html(_todayCount.toFixed(2));    
        dataObj["tempAmount"] = incomeLast;
        for(var j=0; j<incomeLast.length;j++){
            lastCount += Number(incomeLast[j]);
        }  
        $(".firstSpan6").html(lastCount.toFixed(2)); 
        dataObj["xAxis"] = xAxisArr; 
        echartsFn.view.setEchartsImg(dataObj,reportId,_headArr,_dataArr,STARTTIME,ENDTIME,_parkIdTha); 
    },   
    setEchartsImg : function(dataObj,reportId,_headArr,_dataArr,STARTTIME,ENDTIME,_parkIdTha){
        var myChart = echarts.init(document.getElementById('firstTitle2'));
        var colorArr = ["#4d2f6d","#18256e"];
        var _title = "";
        var _name = "";
        _type = "";
        var _tooltip = "";
        var _legend = "";
        var _ser = [];
        _ser = [
            {
                name: '本期收入',
                type: 'line',
                areaStyle: {normal: {}},
                data: dataObj.totalCount,
                showSymbol:false,
            },                                              
            {
                name: '上期收入',
                type: 'line',
                data: dataObj.tempAmount,
                areaStyle: {normal: {}},
                showSymbol : false,
            }                                      
        ];        
        // 基于准备好的dom，初始化echarts实例
            
        // 指定图表的配置项和数据
        option = {
            color   : colorArr,
            tooltip : {trigger: 'axis',axisPointer: {type: 'cross',label: {backgroundColor: '#6a7985'}}},
            toolbox: {
            },            
            legend  : {
                orient: 'horizontal',
                icon:'bar',
                right:'30%', 
                top : "8%",
                data:[
                        {
                            name : "本期收入",
                            textStyle:{color:'#16e0f8'},
                            areaStyle: {normal: {}},
                            icon:'circle'
                        },
                        {
                            name : "上期收入",
                            textStyle:{color:'#16e0f8'},
                            areaStyle: {normal: {}},
                            icon:'circle'
                        }
                    ] 
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true  
            },
            calculable : true,
            xAxis : [
                {   
                    type : 'category',
                    boundaryGap : false,
                    splitLine: {show: false},
                    axisLabel:{interval:0,rotate:40,textStyle: {color: '#16e0f8',fontSize:'8px'}},
                    data:dataObj.xAxis   // x坐标；
                }
            ],
            yAxis : [
                {
                    type :'value',
                    splitLine: {show: false},  //背景网格线；
                    axisLabel:{textStyle: {color: '#16e0f8',fontSize:'9'}}, //设置Y轴字体颜色、大小；  
                }
            ],
            series:_ser,
        };  
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        // 设置dom大小改变时，饼图跟着改变
        if(window.attachEvent){
            window.attachEvent("onresize",function(){
                myChart.resize();
            });
        }else{
            window.addEventListener("resize",function(){
                myChart.resize();
            },false);
        };
    },
    setEchartsMiddleRoundsImg : function(_remainCount,_totalCount,_totalOnline,_totalParks){
        var myChart = "";
        var colorArr = [];
        var _title = "";
        var pre = (Number(_totalCount)-Number(_remainCount))/Number(_totalCount);
        // console.log(pre);
        myChart = echarts.init(document.getElementById('residueId'));
        option = {

            series: [{
                type: 'liquidFill',
                outline: {
                    show: false,
                },
                itemStyle:{
                    normal:{
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(234,44,129,1)'
                    }, {
                        offset: 1,
                        color: 'rgba(137,82,227,1)'
                    }])
                    }
                },         
                label: {
                    normal: {
                        show: true,
                        textStyle: {
                            color: '#294D99',
                            insideColor: '#fff',
                            fontSize: 20,
                            fontWeight: 'bold',
                            align: 'center',
                            baseline: 'middle'
                        },
                        position: 'inside'
                    }
                },                
                data: [pre],
                radius: '60%'
            }]
        };
        // 使用刚指定的配置项和数据显示图表。
        myChart.clear();
        myChart.setOption(option,{
            notMerge : true
        });
        // 设置dom大小改变时，饼图跟着改变
        if(window.attachEvent){
            window.attachEvent("onresize",function(){
                myChart.resize();
            });
        }else{
            window.addEventListener("resize",function(){
                myChart.resize();
            },false);
        };                        
    },
    setEchartsMiddleParkNumImg : function(_remainCount,_totalCount,_totalOnline,_totalParks){
        var myChart = "";
        var colorArr = [];
        var _title = "";
        var pre2 = Number(_totalOnline)/Number(_totalParks);
        // console.log(pre2);
        myChart = echarts.init(document.getElementById('parkNum'));
        option = {

            series: [{
                type: 'liquidFill',
                outline: {
                    show: false,
                },
                itemStyle:{
                    normal:{
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(234,44,129,1)'
                        }, {
                            offset: 1,
                            color: 'rgba(137,82,227,1)'
                        }])
                    }
                },                         
                label: {
                    normal: {
                        show: true,
                        textStyle: {
                            color: '#294D99',
                            insideColor: '#fff',
                            fontSize: 20,
                            fontWeight: 'bold',

                            align: 'center',
                            baseline: 'middle'
                        },
                        position: 'inside'
                    }
                },                
                data: [pre2],
                radius: '60%'
            }]
        };
        // 使用刚指定的配置项和数据显示图表。
        myChart.clear();
        myChart.setOption(option,{
            notMerge : true
        });
        // 设置dom大小改变时，饼图跟着改变
        if(window.attachEvent){
            window.attachEvent("onresize",function(){
                myChart.resize();
            });
        }else{
            window.addEventListener("resize",function(){
                myChart.resize();
            },false);
        };                        
    },    
    getEchartsAliPayPacked : function(_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){  //支付分析数据；
        var dataObj = new Object();        //  数据集合;
        var cash = [];  // 现金数组;
        var electronic = [];  //电子数组；

        cash.push(parseInt((_dataArr.c0).replace(/\,/ig,'')));
        electronic.push(parseInt((_dataArr.c1).replace(/\,/ig,'')));

        dataObj["cash"] = cash;
        dataObj["electronic"] = electronic;
        echartsFn.view.setEchartsAliPayPackedImg(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha)
    },  
    setEchartsAliPayPackedImg : function(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){ //支付分析数据写入；
        var myChart = "";
        var colorArr = [];
        var _title = "";
        myChart = echarts.init(document.getElementById('round1'));
        colorArr =["rgb(0, 83, 163)","rgb(123, 224, 246)"];
        _ser =[
                {
                    name:'访问来源',
                    type:'pie',
                    center:['75','130'],
                    // selectedMode: 'single',
                    radius: [0, '30%'],
                    label: {
                        normal: {
                            position: 'center',
                            textStyle:{
                                fontSize:14,
                                color:'#fff'
                            }
                            
                        }
                    },                 
                    labelLine: {
                        normal: {
                            show: false

                        }
                    },                  
                    data:[
                        {value:dataObj.cash,name:'收费\n终端\n分析'},
                    ]
                },       
                {
                    center:['75','130'],
                    label: {
                        normal: {
                            show: false,
                            position: 'inner'
                        },
                    },                    
                    name:'访问来源',
                    type:'pie',
                    radius: ['40%', '50%'],
                    data:[
                        {value:dataObj.cash, name:'现金缴费'},
                        {value:dataObj.electronic, name:'电子自主缴费'},
                    ]
                }                                     
        ]; 
        // 基于准备好的dom，初始化echarts实例
            
        // 指定图表的配置项和数据
        var option = {
            color : colorArr,
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)",
                position:[50,50],
            },          
            legend: {
                orient: 'vertical',
                x: 'right',
                top:'95',
                left:'145',                
                data:[               
                        {
                            textStyle:{color:'#16e0f8'},
                            name : "现金缴费",
                            icon:'circle'
                        },
                        {
                            textStyle:{color:'#16e0f8'},
                            name : "电子自主缴费",
                            icon:'circle'
                        }
                    ]             
            },
            // graphic:{                               //设置环形中间的文字，顺带解决了点击环形中间，中间圆下落的问题，原因：未知
            //       type:'text',
            //       left:'center',
            //       z:2,
            //       zlevel:100,
            //       style:{                      
            //         text:'收费\n终端\n分析',
            //         textStyle:{
            //           fontSize:14,
            //            fontFamily:'simHei',
            //            color:'#f3f3f3'
            //           },
            //         x:-150,
            //         y:130,
            //         textAlign:'center',
            //         fill:'#fff',
            //         width:30,
            //         height:30
            //       }
            //     },            
            series:_ser,
        };  
        // 使用刚指定的配置项和数据显示图表。
        myChart.clear();
        myChart.setOption(option,{
            notMerge : true
        });
        // 设置dom大小改变时，饼图跟着改变
        if(window.attachEvent){
            window.attachEvent("onresize",function(){
                myChart.resize();
            });
        }else{
            window.addEventListener("resize",function(){
                myChart.resize();
            },false);
        };
    },

    getEchartsPayTypePacked : function(_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){ //线上支付类型分析数据；
        var dataObj = new Object();        //  数据集合;
        var AliPay = [];  // 支付宝数组;
        var wechat = [];  // 微信数组；
        var xb = [];      // 行呗数组；
        var robot = [];    //机器人数组；
        var parkbud = [];   //停车助手；
        var paymentMachine = [];  // 自助缴费机；
        var offlineChargeSystem = []; //线下收费系统；
        var rest = [];   // 其它系统；

        AliPay.push(parseInt((_dataArr.c4).replace(/\,/ig,'')));
        wechat.push(parseInt((_dataArr.c3).replace(/\,/ig,'')));
        xb.push(parseInt((_dataArr.c1).replace(/\,/ig,'')));
        robot.push(parseInt((_dataArr.c5).replace(/\,/ig,'')));
        parkbud.push(parseInt((_dataArr.c2).replace(/\,/ig,'')));
        paymentMachine.push(parseInt((_dataArr.c0).replace(/\,/ig,'')));
        offlineChargeSystem.push(parseInt((_dataArr.c6).replace(/\,/ig,'')));
        rest.push(parseInt((_dataArr.c7).replace(/\,/ig,'')));

        dataObj["AliPay"] = AliPay;
        dataObj["wechat"] = wechat;
        dataObj["xb"] = xb;
        dataObj["robot"] = robot;
        dataObj["parkbud"] = parkbud;
        dataObj["paymentMachine"] = paymentMachine;
        dataObj["offlineChargeSystem"] = offlineChargeSystem;
        dataObj["rest"] = rest;
        echartsFn.view.setEchartsPayTypePackedImg(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha)
    },  
    setEchartsPayTypePackedImg : function(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){ //线上支付类型分析数据写入；
        var myChart = "";
        var colorArr = [];
        var _title = "";
        myChart = echarts.init(document.getElementById('round2'));
        colorArr =["rgb(0, 83, 163)","rgb(40, 201, 59)","rgb(46, 169, 247)","rgb(150, 3, 236)","rgb(240, 86, 255)","rgb(255, 218, 88)","rgb(253, 160, 27)","rgb(220, 7, 68)"];
        _ser =[
                {
                    name:'访问来源',
                    type:'pie',
                    center:['75','173'],
                    // selectedMode: 'single',
                    radius: [0, '30%'],
                    label: {
                                normal: {
                                    position: 'center',
                                    textStyle:{
                                        fontSize:14,
                                        color:'#fff'
                                    }
                                }
                            },                     
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:[
                        // {value:335, name:'直达', selected:true},
                        {value:dataObj.AliPay,name:'线上\n支付\n分析'},
                    ]
                },        
                {
                    name:'访问来源',
                    type:'pie',
                    center:['75','173'],
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                    },                    
                    radius: ['40%', '50%'],
                    data:[
                        {value:dataObj.AliPay, name:'支付宝'},
                        {value:dataObj.wechat, name:'微信'},
                        {value:dataObj.xb, name:'行呗'},
                        {value:dataObj.robot, name:'机器人'},
                        {value:dataObj.parkbud, name:'停车助手'},
                        {value:dataObj.paymentMachine, name:'自助缴费机'},
                        {value:dataObj.offlineChargeSystem, name:'线下收费系统'},
                        {value:dataObj.rest, name:'其它'},
                    ]
                }                                     
        ]; 
        // 基于准备好的dom，初始化echarts实例
            
        // 指定图表的配置项和数据
        var option = {
            color : colorArr,
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)",
                position:[50,50]
            },
            legend: {
                // orient: 'vertical',
                x: 'right',
                top:'80',
                left:'140',                 
                data:[
                        {   
                            icon:'circle',
                            name : "支付宝",
                            textStyle:{color:'#16e0f8',fontSize:12}
                        },
                        {
                            icon:'circle',
                            name : "微信",
                            textStyle:{color:'#16e0f8',fontSize:12}
                        },
                        {
                            icon:'circle',
                            name : "机器人",
                            textStyle:{color:'#16e0f8',fontSize:12}
                        },                        
                        {
                            icon:'circle',
                            name : "行呗",
                            textStyle:{color:'#16e0f8',fontSize:12}
                        },                                                
                        {
                            icon:'circle',
                            name : "停车助手",
                            textStyle:{color:'#16e0f8',fontSize:12}
                        },
                        {
                            icon:'circle',
                            name : "其它",
                            textStyle:{color:'#16e0f8',fontSize:12}
                        },                         
                        {
                            icon:'circle',
                            name : "自助缴费机",
                            textStyle:{color:'#16e0f8',fontSize:12}
                        }, 
                        {
                            icon:'circle',
                            name : "线下收费系统",
                            textStyle:{color:'#16e0f8',fontSize:12}
                        }, 
                                                                                               
                    ]             
            },

            series:_ser,
        };  
    // 使用刚指定的配置项和数据显示图表。
        myChart.clear();
        myChart.setOption(option,{
            notMerge : true
        });
        // 设置dom大小改变时，饼图跟着改变
        if(window.attachEvent){
            window.attachEvent("onresize",function(){
                myChart.resize();
            });
        }else{
            window.addEventListener("resize",function(){
                myChart.resize();
            },false);
        };
    },
    getEchartsParkFlowPacked2 : function(_headArr,_dataArr2,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        console.log(_dataArr2);
        for(var i=0; i< _dataArr2.length;i++){
           currentLast.push((_dataArr2[i].c0));
        } 
        console.log(currentLast);
    }, 
    getEchartsParkFlowPacked3 : function(_headArr,_dataArr3,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        var currentLast3 = [];
        for(var i=0; i< _dataArr3.length;i++){
           currentLast3.push(Number(_dataArr3[i].c0));
        }
        // console.log(currentLast3);

        for(var j=0; j<currentLast3.length;j++){
             str += currentLast3[j];
        }
        // console.log(str); 
    },
    getEchartsParkFlowPacked4 : function(_headArr,_dataArr4,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        var _count2 = (_dataArr4.count).replace(/\,/ig,'');
        _count3 = Number(_count2);
        // currentLast4.push(_count3);
        // str += currentLast3[j];
        // for(var j=0; j<currentLast4.length;j++){
        //      str2 += currentLast4[j];
        // }
        // console.log(_count3); 
    },              
    getEchartsParkFlowPacked : function(_headArr,_dataArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        // console.log(_dataArr);
        var dataObj = new Object();        //  数据集合;
        var xAxisArr = [];   // x坐标；
        var current = [];  // 本期车流量;

        for(var i=0; i< _dataArr.length;i++){
           current.push((_dataArr[i].c0));
           xAxisArr.push(_dataArr[i].xAxis.substr(5,5));
        } 
 
        dataObj["current"] = current;
        dataObj["currentLast"] = currentLast;
        for(var j=0; j<current.length;j++){
            _current += Number(current[j]);
        }  
        $(".firstSpan15").html(_current); 
        console.log(currentLast);   
        for(var j=0; j<currentLast.length;j++){
            _currentLast += Number(currentLast[j]);
        }  
        $(".firstSpan16").html(_currentLast);         
        dataObj["xAxis"] = xAxisArr; 
        echartsFn.view.getEchartsParkFlowImg(dataObj,reportId,_headArr,_dataArr,STARTTIME,ENDTIME,_parkIdTha); 
    },
    getEchartsParkFlowImg : function(dataObj,reportId,_headArr,_dataArr,STARTTIME,ENDTIME,_parkIdTha){
        var myChart = echarts.init(document.getElementById('firstTitle7'));
        var colorArr = ["#68ddff","#7d5dcc"];
        var _legend = "";
        var _ser = [];
        _ser = [
            {
                name: '本期车流量',
                type: 'line',
                data: dataObj.current,
            },                                              
            {
                name: '上期车流量',
                type: 'line',
                data: dataObj.currentLast,
            }                                      
        ];        
        // 基于准备好的dom，初始化echarts实例
            
        // 指定图表的配置项和数据
        option = {
            color   : colorArr,
            tooltip : {trigger: 'item',formatter: '{a} <br/>{b} : {c}'},
            legend  : {
                orient: 'horizontal',
                // icon:'bar',
                right:'30%', 
                top : "8%", 
                textStyle:{color:'#16e0f8'},
                icon:'circle',              
                data: ['本期车流量', '上期车流量']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '5%',
                containLabel: true
            },
            calculable : true,
            xAxis : [
                {   
                    type: 'category',
                    splitLine: {show: false},
                    axisLabel:{interval:0,rotate:40,textStyle: {color: '#16e0f8',fontSize:'2px'}},
                    data:dataObj.xAxis   // x坐标；
                }
            ],
            yAxis : [
                {
                    splitLine: {show: false},  //背景网格线；
                    axisLabel:{textStyle: {color: '#16e0f8',fontSize:'8px'}}, //设置Y轴字体颜色、大小；
                    // type: 'log',  
                }
            ],
            series:_ser,
        };  
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        // 设置dom大小改变时，饼图跟着改变
        if(window.attachEvent){
            window.attachEvent("onresize",function(){
                myChart.resize();
            });
        }else{
            window.addEventListener("resize",function(){
                myChart.resize();
            },false);
        };       
    },
    getEchartsTypeAnalysisPacked : function(_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){ 
        var dataObj = new Object();        //  数据集合;
        var temporary = [];  // 临停车数组;
        var long = [];  // 长期车数组；
        var special = [];      // 特殊车数组；
        var rests = [];    //其他车数组；
        var totalNum = Number((_headArr.c0).replace(/\,/ig,''))+Number((_headArr.c1).replace(/\,/ig,''))+Number((_headArr.c2).replace(/\,/ig,''))+Number((_headArr.c3).replace(/\,/ig,''));

        temporary.push((_headArr.c0));
        long.push((_headArr.c1));
        special.push((_headArr.c2));
        rests.push((_headArr.c3));
        $(".ltnb").text(_headArr.c0);
        $(".cqnb").text(_headArr.c1);
        $(".tsnb").text(_headArr.c2);
        $(".qtnb").text(_headArr.c3);
        $(".ltpr").text( (((Number((_headArr.c0).replace(/\,/ig,''))/totalNum)*100)).toFixed(2) +"%");
        $(".cqpr").text( (((Number((_headArr.c1).replace(/\,/ig,''))/totalNum)*100)).toFixed(2) +"%");
        $(".tspr").text( (((Number((_headArr.c2).replace(/\,/ig,''))/totalNum)*100)).toFixed(2) +"%");
        $(".qtpr").text( (((Number((_headArr.c3).replace(/\,/ig,''))/totalNum)*100)).toFixed(2) +"%");
        dataObj["temporary"] = temporary;
        dataObj["long"] = long;
        dataObj["special"] = special;
        dataObj["rests"] = rests;
        echartsFn.view.setEchartsTypeAnalysisPackedImg(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha)
    },
    setEchartsTypeAnalysisPackedImg : function(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){ 
        var myChart = "";
        var colorArr = [];
        var _title = "";
        myChart = echarts.init(document.getElementById('rightMain3Map'));
        colorArr =["#9603ec","#f056ff","#dc0744","#fda01b"];
        _ser =[
                {
                    name:'访问来源',
                    type:'pie',
                    radius: [0, '30%'],
                    
                    label: {
                        normal: {
                            position: 'inner'
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                },        
                {
                    name:'访问来源',
                    type:'pie',
                    center:['130','170'],
                    radius: ['30%', '40%'],
                    data:[
                        {value:dataObj.temporary, name:'临停车辆'},
                        {value:dataObj.long, name:'长期车辆'},
                        {value:dataObj.special, name:'特殊车辆'},
                        {value:dataObj.rests, name:'其他车辆'},
                    ]
                }                                     
        ]; 
        // 基于准备好的dom，初始化echarts实例
            
        // 指定图表的配置项和数据
        var option = {
            color : colorArr,
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                // data:[
                //         {
                //             name : "现金缴费",
                //         },
                //         {
                //             name : "电子自主缴费",
                //         }
                //     ]             
            },
            series:_ser,
        };  
    // 使用刚指定的配置项和数据显示图表。
        myChart.clear();
        myChart.setOption(option,{
            notMerge : true
        });
        // 设置dom大小改变时，饼图跟着改变
        if(window.attachEvent){
            window.attachEvent("onresize",function(){
                myChart.resize();
            });
        }else{
            window.addEventListener("resize",function(){
                myChart.resize();
            },false);
        };
    },  
    getEchartsParkFlowratePacked2 : function(_headArr,_dataArr2,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        // var dataObj = new Object();        //  数据集合;
        
        var f = parseInt((_dataArr2.c1).replace(/\,/ig,''));
        // console.log(f);
        electronic3.push(f);
        // dataObj["electronic3"] = electronic3;      
    },          
    getEchartsParkFlowratePacked : function(_headArr,_dataArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        var dataObj = new Object();        //  数据集合;
        // var electronic2 = [];  //电子数组；
        var a = parseInt((_dataArr.c1).replace(/\,/ig,''));
        // electronic2.push(a);
         $.each(electronic3,function(i,value){
              e =electronic3[i]; 
        });       
        dataObj["electronic2"] = a;
        dataObj["result"] = e;
        dataObj["str"] = str;
        dataObj["_count3"] = _count3;
        $(".monthCount").html(parseInt(dataObj.electronic2));
        $(".monthCount4").html(parseInt(dataObj.result));
        $(".monthCount6").html(dataObj.str);
        $(".monthCount8").html(dataObj._count3);        
        // console.log(dataObj._count3);
        // console.log(dataObj.str);
        // console.log(dataObj.result);
        // console.log(dataObj.electronic2);
        echartsFn.view.setEchartsParkFlowratePackedImg(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha)        
    },
    setEchartsParkFlowratePackedImg : function(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){ 
    var myChart = "";
    var colorArr = [];
    var _title = "";
    myChart = echarts.init(document.getElementById('rightMainChart2'));
    colorArr =["#b076fa","#7baafb"];
    _ser =[
        {
            name: '月累计',
            type: 'bar',
            barGap:'35%',
            // data: [dataObj.str,dataObj.electronic2]
            data: [dataObj.electronic2]
        },
        {
            name: '日新增',
            type: 'bar',
            // data: [dataObj.result,dataObj.currentLast4]
            data: [dataObj.result]
        }                                     
    ]; 
    // 基于准备好的dom，初始化echarts实例
        
    // 指定图表的配置项和数据
    var option = {
        color : colorArr,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '9%',
            right: '4%',
            bottom: '3%',
            y:2,
            containLabel: true
        },
        yAxis: {
            axisLabel:{textStyle: {color: '#fff',fontSize:'8px'}},
            type: 'category',
            data: ['电子支付数(笔数)']
        },        
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
            show:false
        },                
        series:_ser,
    };  
    // 使用刚指定的配置项和数据显示图表。
    myChart.clear();
    myChart.setOption(option,{
        notMerge : true
    });
    // 设置dom大小改变时，饼图跟着改变
    if(window.attachEvent){
        window.attachEvent("onresize",function(){
            myChart.resize();
        });
    }else{
        window.addEventListener("resize",function(){
            myChart.resize();
        },false);
    };
},
    getEchartsParkFlowratePacked8 : function(_headArr,_dataArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        var dataObj = new Object();        //  数据集合;

        dataObj["str"] = str;
        dataObj["_count3"] = _count3;
        $(".monthCount6").html(dataObj.str);
        $(".monthCount8").html(dataObj._count3);        
        // console.log(dataObj.result);
        // console.log(dataObj.electronic2);
        echartsFn.view.setEchartsParkFlowratePackedImg8(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha)        
    },
    setEchartsParkFlowratePackedImg8 : function(dataObj,_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){ 
    var myChart = "";
    var colorArr = [];
    var _title = "";
    myChart = echarts.init(document.getElementById('rightMainChart3'));
    colorArr =["#b076fa","#7baafb"];
    _ser =[
        {
            name: '月累计',
            type: 'bar',
            // barGap:'5%',
            // data: [dataObj.str,dataObj.electronic2]
            data: [dataObj.str]
        },
        {
            name: '日新增',
            type: 'bar',
            // data: [dataObj.result,dataObj.currentLast4]
            data: [dataObj._count3]
        }                                     
    ]; 
    // 基于准备好的dom，初始化echarts实例
        
    // 指定图表的配置项和数据
    var option = {
        color : colorArr,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {           
        },
        grid: {
            left: '9%',
            right: '4%',
            bottom: '3%',
            y:6,
            containLabel: true
        },
        yAxis: {
            axisLabel:{textStyle: {color: '#fff',fontSize:'8px'}},
            type: 'category',
            data: ['车流量(车次)']
        },        
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
            show:false
        },                
        series:_ser,
    };  
    // 使用刚指定的配置项和数据显示图表。
    myChart.clear();
    myChart.setOption(option,{
        notMerge : true
    });
    // 设置dom大小改变时，饼图跟着改变
    if(window.attachEvent){
        window.attachEvent("onresize",function(){
            myChart.resize();
        });
    }else{
        window.addEventListener("resize",function(){
            myChart.resize();
        },false);
    };
},
getEchartsRegionChargeImg : function(_arr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
         var dataObj = new Object();
         var _tempAmount = [];
         var _allAmount = [];
         var _name = [];
         for(var i=0; i< _arr.length;i++){
           _allAmount.push((_arr[i].allAmount).replace(/\,/ig,''));
           _tempAmount.push((_arr[i].tempAmount).replace(/\,/ig,''));
           _name.push((_arr[i].name).replace(/\,/ig,''));         
        }
        dataObj["_tempAmount"] = _tempAmount;
        dataObj["_allAmount"] = _allAmount;
        dataObj["_name"] = _name;
        echartsFn.view.getEchartsRegionChargeImgPage(dataObj,_arr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
},
getEchartsRegionChargeImgPage(dataObj,_arr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
    var myChart = "";
    var colorArr = [];
    var _title = "";
    myChart = echarts.init(document.getElementById('round3'));
    colorArr =["#6f9af7","#a56cf7"];
        option = {
            color:colorArr,
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
            },
            legend: {
                data:['总收费额','临停收费'],
                right:'20px',
                textStyle:{color:'#16e0f8',fontSize:'5px'}
            },
            grid: {
                left: '3%',
                right: '4%',
                top:'40px',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    axisLabel:{textStyle: {color: '#16e0f8',fontSize:'8px'},interval:0},
                    // type : 'category',
                    // splitLine: {show: false},                   
                    data :dataObj._name
                }
            ],
            yAxis : [
                {
                    splitLine: {show: false},
                    axisLabel:{textStyle: {color: '#16e0f8',fontSize:'8px'}},
                    type : 'value'
                }
            ],
            series : [
                {
                    name:'总收费额',
                    type:'bar',
                    barWidth:12,
                    data:dataObj._allAmount
                },
                {
                    name:'临停收费',
                    type:'bar',
                    barWidth:12,
                    stack: '广告',
                    data:dataObj._tempAmount
                }
            ]
        };
    // 使用刚指定的配置项和数据显示图表。
    myChart.clear();
    myChart.setOption(option,{
        notMerge : true
    });
    // 设置dom大小改变时，饼图跟着改变
    if(window.attachEvent){
        window.attachEvent("onresize",function(){
            myChart.resize();
        });
    }else{
        window.addEventListener("resize",function(){
            myChart.resize();
        },false);
    };   
}
}

echartsFn.model={
    getEchartsHeader2 : function(reportId,STARTTIME,ENDTIME,_parkIdTha){              //  获取报表表头数据;
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            async : false,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"showType":"1"},
            dataType : "json",
            success : function(data){
                var _headArr = data.data;   
                echartsFn.model.getEchartsData2(reportId,STARTTIME,ENDTIME,_parkIdTha,_headArr);  
            }
        });
    }, 
    getEchartsData2 : function(reportId,STARTTIME,ENDTIME,_parkIdTha,_headArr){    //  获取上期收入报表数据;
        lastWeek2();
        $.ajax({
            url : ruleUrlObj.echartsDataUrl,
            async : false,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"startTime":STARTTIME3,"endTime":ENDTIME3,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode!="200"){
                    return false;
                }
                var _dataArr2 = data.data;
                // return _dataArr2;
                echartsFn.view.operateDataOne2(reportId,_headArr,_dataArr2,STARTTIME,ENDTIME,_parkIdTha);
            }
        });
    },       
    getEchartsHeader : function(reportId,STARTTIME,ENDTIME,_parkIdTha){              //  获取本期数据报表表头数据;
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            async : false,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"showType":"1"},
            dataType : "json",
            success : function(data){
                var _headArr = data.data;   
                echartsFn.model.getEchartsData(reportId,STARTTIME,ENDTIME,_parkIdTha,_headArr);  
            }
        });
    },    
    getEchartsData : function(reportId,STARTTIME,ENDTIME,_parkIdTha,_headArr){    //    获取本期报表数据;
        lastWeek();
        $.ajax({
            url : ruleUrlObj.echartsDataUrl,
            async : false,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"startTime":STARTTIME2,"endTime":ENDTIME2,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode!="200"){
                    return false;
                }
                var _dataArr = data.data;
                // var obj = new Object();
                // obj =  echartsFn.model.getEchartsData2(_dataArr);
                // var _dataArr2 = incomeLast;
                echartsFn.view.operateDataOne(reportId,_headArr,_dataArr,STARTTIME,ENDTIME,_parkIdTha);
            }
        });
    },
    getEchartsAliPay : function(reportId,STARTTIME,ENDTIME,_parkIdTha){  //获取支付类型分析；
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            async : false,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"showType":"4"},
            dataType : "json",
            success : function(data){
                var _headArr = data.data;     
                echartsFn.model.getEchartsAliPayData(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha);   
            }
        });
    },
    getEchartsAliPayData : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){ //获取支付类型分析数据；
        $.ajax({
            url : ruleUrlObj.payUrl,
            // async : false,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"isTotal":"1","time":STARTTIME,"endTime":ENDTIME,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode!="200"){
                    return false;
                }
                var _dataArr = data.resultObj;             
                echartsFn.view.getEchartsAliPayPacked(_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha);
            }
        });
    },

    getEchartsPayType : function(reportId,STARTTIME,ENDTIME,_parkIdTha){  //获取线上支付类型分析；
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            async : false,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"showType":"4"},
            dataType : "json",
            success : function(data){
                var _headArr = data.data;     
                echartsFn.model.getEchartsPayTypeData(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha);   
            }
        });
    },
    getEchartsPayTypeData : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha){  //获取线上支付类型分析数据；
        $.ajax({
            url : ruleUrlObj.payUrl,
            // async : false,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"isTotal":"1","time":STARTTIME,"endTime":ENDTIME,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode!="200"){
                    return false;
                }
                var _dataArr = data.resultObj;             
                echartsFn.view.getEchartsPayTypePacked(_dataArr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha);
            }
        });
    },
    
    getEchartsParkFlow : function(reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"showType":"1"},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _headArr = data.data;
                echartsFn.model.getEchartsParkFlowData(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    },
    getEchartsParkFlowData : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        lastWeek();
        $.ajax({
            url : ruleUrlObj.parkFlow,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"startTime":STARTTIME2,"endTime":ENDTIME2,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _dataArr = data.data;
                echartsFn.view.getEchartsParkFlowPacked(_headArr,_dataArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    },



    getEchartsParkFlow2 : function(reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"showType":"1"},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _headArr = data.data;
                echartsFn.model.getEchartsParkFlowData2(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    },
    getEchartsParkFlowData2 : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        lastWeek2();
        $.ajax({
            url : ruleUrlObj.parkFlow,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"startTime":STARTTIME3,"endTime":ENDTIME3,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _dataArr2 = data.data;
                echartsFn.view.getEchartsParkFlowPacked2(_headArr,_dataArr2,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    },
    getEchartsParkFlow3 : function(reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            type : "post",
            async:false,
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"showType":"1"},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _headArr = data.data;
                echartsFn.model.getEchartsParkFlowData3(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    },
    getEchartsParkFlowData3 : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.parkFlow,
            async:false,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"startTime":monthFirstDay+" 00","endTime":ENDTIME+" 23","parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _dataArr3 = data.data;
                echartsFn.view.getEchartsParkFlowPacked3(_headArr,_dataArr3,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    },
    getEchartsParkFlow4 : function(reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"showType":"1"},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _headArr = data.data;
                echartsFn.model.getEchartsParkFlowData4(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    },
    getEchartsParkFlowData4: function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.totalParkFlowUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"startTime":STARTTIME,"endTime":ENDTIME,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _dataArr4 = data.resultObj;
                echartsFn.view.getEchartsParkFlowPacked4(_headArr,_dataArr4,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    },         
    getEchartsTypeAnalysis : function(reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"showType":"1"},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _headArr = data.data;
                echartsFn.model.getEchartsTypeAnalysisData(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    }, 
    getEchartsTypeAnalysisData : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.signParkTypeUrl,
            type : "post",
            data : {"isTotal":"0","appKey":appKey,"reportId":reportId,"timeType":TimeType,"time":STARTTIME+" 00","endTime":ENDTIME+" 23","parkId":""},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _dataArr = data.data[0];
                // console.log(_dataArr);
                echartsFn.view.getEchartsTypeAnalysisPacked(_headArr,_dataArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })
    },
    getParkFlowrate : function(reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"showType":"4"},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _headArr = data.data;
                echartsFn.model.getEchartsParkFlowrateData(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })        
    },
    getParkFlowrate8 : function(reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"showType":"4"},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _headArr = data.data;
                echartsFn.model.getEchartsParkFlowrateData8(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })        
    },    
    getEchartsParkFlowrateData8 : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.payUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"isTotal":"1","time":monthFirstDay,"endTime":ENDTIME,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _dataArr = data.resultObj;
                echartsFn.view.getEchartsParkFlowratePacked8(_headArr,_dataArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })         
    },    
    getEchartsParkFlowrateData : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.payUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"isTotal":"1","time":monthFirstDay,"endTime":ENDTIME,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _dataArr = data.resultObj;
                echartsFn.view.getEchartsParkFlowratePacked(_headArr,_dataArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })         
    },
    getParkFlowrate2 : function(reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"showType":"4"},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _headArr = data.data;
                echartsFn.model.getEchartsParkFlowrateData2(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })        
    },
    getEchartsParkFlowrateData2 : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.payUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"timeType":TimeType,"isTotal":"1","time":STARTTIME,"endTime":ENDTIME,"parkIds":_parkIdTha},
            dataType : "json",
            success : function(data){              
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _dataArr2 = data.resultObj;
                echartsFn.view.getEchartsParkFlowratePacked2(_headArr,_dataArr2,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        })         
    },
    getRegionCharge :function(reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
        $.ajax({
            url : ruleUrlObj.echartsHeaderUrl,
            type : "post",
            data : {"reportId":reportId,"appKey":appKey,"showType":"4"},
            dataType : "json",
            success : function(data){
                if(data.message.errorCode != "200"){
                    return false;
                }
                var _headArr = data.data;
                echartsFn.model.getEchartsRegionChargeData(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
            }
        }) 
    },
    getEchartsRegionChargeData : function(_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType){
       $.ajax({
        url:ruleUrlObj.regionUrl,
        type:"post",
        data:{"reportId":reportId,"appKey":appKey,"timeType":TimeType,"time":STARTTIME,"endTime":ENDTIME,"isTotal":"1","parkId":_parkIdTha},
        dataType:"json",
        success :function(data){
            if(data.message.errorCode != "200"){
                return false;
            }
            var _arr = data.array;
             echartsFn.view.getEchartsRegionChargeImg(_arr,_headArr,reportId,STARTTIME,ENDTIME,_parkIdTha,TimeType);
        }
       }); 
    }                  
}

function getTableHeader(){
    $.ajax({
        url : ruleUrlObj.tableHeaderUrl,
        async : false,
        type : "post",
        data :JSON.stringify({"gridId":"realeChareTable"}),
        dataType : "json",
        success : function(data){
           // var _arr =tableHeadData; 
            var _arr = data.resultObj;
            createHeader(_arr);
            getTableData(_arr);
        }
    });
}

//创建表头
function createHeader(_ARR) {
    $.each(_ARR,function(i,value){
        // if(value.columnId = "plateNo"){
        //    $("<th>").text(value.columnName).attr("w_render",value.functionName).attr("w_align","center").appendTo(".tableHeader"); 
        // }else{
            $("<th>").text(value.columnName).attr(value.className,value.functionName).attr("w_align","left").appendTo(".tableHeader"); 
        // }
       
    });
}

function getTableData(_ARR){   
    gridObj = $.fn.bsgrid.init('realChareUrl', {
        url:ruleUrlObj.realChareUrl,
        // localData:tableData,
        otherParames :{"companyCode":"","appKey":appKey,"time":STARTTIME,"endTime":STARTTIME},
        pageSize: 6,
        showPageToolbar: false,    //是否显示分页工具条；
        stripeRows : false,        //  隔行变色;
        isProcessLockScreen : false,
        additionalAfterRenderGrid:function(){
            $("#realChareUrl tbody tr td").css("text-align","left");    //   数字居右；
            // $("#parkChareUrl tbody tr").each(function(i,value){
            //     $(value).children("td").eq(0).css("text-align","left");   //控制哪一行居中
            // });            
        }        
    });
}

// function plateNo(record, rowIndex, colIndex, options){
//     var _rowObj = gridObj.getRecord(rowIndex);
//     var _plateNo = _rowObj.billingId;
//     var _plateNo2 = _plateNo.substr(0,6);
//     if(_plateNo2 == "openid"){
//        return '<a style="color:#000;" href="javacript:void(0);" >无车牌</a>'; 
//     }else{
//        return '<a style="color:#000;" href="javacript:void(0);" >'+_rowObj.billingId+'</a>';    
//     }
// }

function getTableHeader2(){
    $.ajax({
        url : ruleUrlObj.tableHeaderUrl,
        async : false,
        type : "post",
        data :JSON.stringify({"gridId":"parkChareTable"}),
        dataType : "json",
        success : function(data){
           // var _arr =tableHeadData2; 
            var _arr = data.resultObj;
            createHeader2(_arr);
            getTableData2(_arr);
        }
    });
}

//创建表头
function createHeader2(_ARR) {
    $.each(_ARR,function(i,value){
        $("<th>").text(value.columnName).attr(value.className,value.functionName).attr("w_align","left").appendTo(".tableHeader2");
    });
}

function getTableData2(_ARR){   
    gridObj = $.fn.bsgrid.init('parkChareUrl', {
        url:ruleUrlObj.parkChareUrl,
        // localData:tableData,
        otherParames :{"companyCode":"","appKey":appKey,"sortOrder":"desc","sortName":"todayAmount","time":STARTTIME,"endTime":STARTTIME},
        pageSize: 6,
        showPageToolbar: false,    //是否显示分页工具条；
        stripeRows : false,        //  隔行变色;
        isProcessLockScreen : false,
        additionalAfterRenderGrid:function(){
            $("#parkChareUrl tbody tr td").css("text-align","left");    //   数字居右；
            // $("#parkChareUrl tbody tr").each(function(i,value){
            //     $(value).children("td").eq(0).css("text-align","left");   //控制哪一行居中
            // });            
        }
    });
}

//地图展示；
function map(){
    map = new AMap.Map("mapdiv", {
        //二维地图显示视口
        resizeEnable: true,
        zoom: 10,
		zooms:[5,15],
        center: [120.165936,30.255436]
    });    
	map.on("mapmove",function(e){
		closeInfoWindow();
	});

}

function getMapData(){
    $.ajax({
        url : ruleUrlObj.mapUrl,
        async : false,
        type : "post",
        data : {"appKey":appKey},
        dataType : "json",
        success : function(data){ 
            var _mapData = data.data;
            var _remainCount =data.remainCount;
            var _totalCount = data.totalCount;
            var _totalOnline = data.totalOnline;
            var _totalParks = data.totalParks;
            // console.log(_remainCount);
            // console.log(_totalCount);
            // console.log(_totalOnline);
            // console.log(_totalParks);
            $(".remainCount").text(_remainCount);
            $(".totalCount").text(_totalCount);
            $(".totalOnline").text(_totalOnline);
            $(".totalParks").text(_totalParks);
            echartsFn.view.setEchartsMiddleParkNumImg(_remainCount,_totalCount,_totalOnline,_totalParks)
            echartsFn.view.setEchartsMiddleRoundsImg(_remainCount,_totalCount,_totalOnline,_totalParks)           
            setMarker(_mapData);                    
        }
    });
}

function getTodayCharge(carParkId){
     $.ajax({
        url : ruleUrlObj.todayChargeUrl,
        async : false,
        type : "post",
        data : {"parkId":carParkId,"appKey":appKey,"timeType":"2","startTime":STARTTIME,"endTime":ENDTIME},
        dataType : "json",
        success : function(data){ 
            var _arr = data.data[0];
            // console.log(_arr);
             operateAmount= _arr.operateAmount;                   
        }
    });   
}
function getTodayParkFlow(carParkId){
     $.ajax({
        url : ruleUrlObj.todayParkFlow,
        async : false,
        type : "post",
        data : {"parkId":carParkId,"appKey":appKey,"timeType":"data_hour","startTime":STARTTIME+" 00","endTime":ENDTIME+" 23"},
        dataType : "json",
        success : function(data){ 
            var _arr = data.resultObj;
            // console.log(_arr);
            _todayFlow = _arr.todayFlow;                   
        }
    });   
}
function setMarker(_mapData){
    // console.log(_mapData);
    if(_mapData) {

        for(var i = 0, l = _mapData.length; i < l; i++) {
            
            var emptyParkingSpace = _mapData[i].emptyParkingSpace;
            var parkingSpace = _mapData[i].parkingSpace;
            var num = countUserRate(emptyParkingSpace, parkingSpace);
            if(_mapData[i].latitude != undefined && _mapData[i].longitude != undefined){
                // var marker1 = new AMap.Marker({map: map, position: map.getCenter()});
                var icon = new AMap.Icon({
                        image : iconsUrl[num],//24px*24px
                        //icon可缺省，缺省时为默认的蓝色水滴图标，
                        size : new AMap.Size(24,24)
                }); 
                // console.log(_mapData[i].latitude);                
                var marker1 = new AMap.Marker({
                    map: map,
                    position: [_mapData[i].longitude,_mapData[i].latitude],
                    icon:icon 
                });
                marker1.setMap(map);                
                marker1.content = _mapData[i];
                marker1.on('mouseover', markerClick);
                marker1.on('mouseout', markerClick2);
                marker1.on('click', markerClick3);
            }        
        } 
    }    
}

function markerClick(e) {
    closeInfoWindow();
    showInfoWindow(e.target.content);
}

function markerClick2(e) {
    closeInfoWindow();
    showInfoWindow2(e.target.content);
}

function markerClick3(e) {
    showInfoWindow3(e.target.content);
}

function closeInfoWindow() {
    map.clearInfoWindow();
}

function countUserRate(emptyParkingSpace, parkingSpace) {
    if(parkingSpace == 0){
        return "1";
    }
    
    var rate = (parkingSpace-emptyParkingSpace) / parkingSpace;
    if(rate < 0.5) {
        return "0";
    } else if(rate > 0.5 && rate <= 0.8) {
        return "1";
    } else if(rate > 0.8) {
        return "2";
    }
}
function showInfoWindow(obj) {
    var s_json = obj;
    // console.log(s_json);
    var lng = s_json.longitude;
    var lat = s_json.latitude;
    var carParkId =s_json.serialNo;
    var position = [lng, lat];
    getTodayCharge(carParkId);
    getTodayParkFlow(carParkId);
    var _rate =((((s_json.parkingSpace)-(s_json.emptyParkingSpace)) / s_json.parkingSpace)*100).toFixed(2);; 
	var content = [];
	content.push('<div style="color: #fff;margin-left:37px;text-align:left;margin-top:15px;font-size:20px;">'+s_json.carParkName+'</div>');
	content.push('<div style="color: #fff;margin-left:39px;margin-top:10px;position:relative;float:left;font-size:12px">余位/车位：'+s_json.emptyParkingSpace+'/'+s_json.parkingSpace+'</div>');
	content.push('<div style="color: #fff;margin-top:10px;float:left;margin-left:35px;font-size:12px">车位占用率：'+_rate+'%</div>');
	content.push('<div style="color: #fff;margin-top:10px;margin-left:38px;float:left;font-size:12px">今日车流量：'+_todayFlow+'</div>');
	content.push('<div style="color: #fff;margin-top:10px;margin-left:20px;float:left;font-size:12px">今日营收总额：'+operateAmount+'元</div>');
	var infoWindow = new AMap.InfoWindow({
		isCustom: true, //使用自定义窗体
		content: createInfoWindow(content),
		offset: new AMap.Pixel(75, -25)
	});
	infoWindow.open(map, position);               
}

function showInfoWindow2(obj) {
    closeInfoWindow();                 
}

function showInfoWindow3(obj) {
    var s_json = obj;
    var lng = s_json.longitude;
    var lat = s_json.latitude;
    var position = [lng, lat];
    // console.log(position);
	map.setZoomAndCenter(11, position);
    closeInfoWindow();          
}

function createInfoWindow(content) {
    var info = document.createElement("div");
    info.className = "parkPopBox";
    info.innerHTML = content;
    return info;
}

function refresh2(){
    map.setMapStyle('amap://styles/darkblue');  //地图的主题颜色；
    map.setZoomAndCenter(4.5, [108.905467, 40.907761]);
    map.setStatus({dragEnable: true});    
}
//数据格式化
function fmoney(s, n) {  
     n = n > 0 && n <= 20 ? n : 2;  
     s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";  
     var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];  
     t = "";  
     for (i = 0; i < l.length; i++) {
       if (s.substring(0,1)=='-') {
         t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != (l.length-1) ? "," : "");  
       }else{
         t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");  
       }  
     }  
     return t.split("").reverse().join("") + "." + r;  
}

function  lastWeek(){             
    var now = new Date();           
    var _startTime = formatDate(new Date(getWeekStartEnd().startTime));
    var _endTime = formatDate(new Date(getWeekStartEnd().endTime));
    // console.log(_startTime);
    // console.log(_endTime);
    STARTTIME2 = _startTime.replace(/\./ig,"-")+" 00";
    ENDTIME2 = _endTime.replace(/\./ig,"-")+" 23";
    // console.log(STARTTIME2);
    // console.log(ENDTIME2);
}
function  formatDate(date) {                  //   格式化日期;
    var myyear = date.getFullYear(); 
    var mymonth = date.getMonth()+1; 
    var myweekday = date.getDate(); 

    if(mymonth < 10){ 
       mymonth = "0" + mymonth; 
    } 
    if(myweekday < 10){ 
       myweekday = "0" + myweekday; 
    } 

    return (myyear+"-"+mymonth + "-" + myweekday); 
}
function  getWeekStartEnd(){                        //  获取上周的起止时间;
    var date = new Date() || date, day, start, end, dayMSec = 24 * 3600 * 1000;
    end = date.getTime();
    start = end - 14 * dayMSec;
    return {startTime : getFormatTime(start), endTime : getFormatTime(end)};
    
    function getFormatTime(time){
        date.setTime(time);
        return date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + ' 00:00:00';
    }
}
function  lastWeek2(){             
    var now = new Date();           
    var _startTime = formatDate(new Date(getWeekStartEnd2().startTime));
    var _endTime = formatDate(new Date(getWeekStartEnd2().endTime));
    // console.log(_startTime);
    // console.log(_endTime);
    STARTTIME3 = _startTime.replace(/\./ig,"-")+" 00";
    ENDTIME3 = _endTime.replace(/\./ig,"-")+" 23";   
}
function  getWeekStartEnd2(){                        //  获取上周的起止时间;
    var date = new Date() || date, day, start, end, dayMSec = 24 * 3600 * 1000;
    end = date.getTime()-15* dayMSec;
    start = end - 14 * dayMSec;
    return {startTime : getFormatTime(start), endTime : getFormatTime(end)};
    
    function getFormatTime(time){
        date.setTime(time);
        return date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + ' 00:00:00';
    }
}
function getTodatMonth(){
    var date = new Date()
    with(date) {
    year = date.getYear() + 1900;
    month = date.getMonth() + 1;
    }

    monthFirstDay= year + "-" + (Number(month)<10?("0"+month):month) + "-01";
    console.log(monthFirstDay);
}
function  yesterday(){           //  后去昨天时间
    var now = new Date();
    // var preDate = new Date(now.getTime() - 24*60*60*1000); //前一天
    // console.log(preDate);
    now.setTime(now.getTime()-24*60*60*1000);
    var _yesterday = now.getFullYear()+"-" +((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1) + "-" +((now.getDate()<10?"0":"")+now.getDate())+ " " +((now.getHours()<10?"0":"")+now.getHours());
    var _yesterday2 = now.getFullYear()+"-" +((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1) + "-" +((now.getDate()<10?"0":"")+now.getDate());
    STARTTIME5 = _yesterday2.replace(/\./ig,"-");
    ENDTIME5 = _yesterday.replace(/\./ig,"-"); 
    // console.log(STARTTIME5);
    // console.log(ENDTIME5);
}
