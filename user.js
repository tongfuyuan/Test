/**
 *  @author: zyx;
 *  @time:   2017-06-12;
 *  @content:  长期用户维护js逻辑;
 *
 */

// ceshi
var urlArgsObj = getUrl();  // url中的参数集合;
var CARPARKID = urlArgsObj.parkId;       //  车场ID;
var CARPARKNAME = decodeURIComponent(urlArgsObj.parkName);
var PLATENO = decodeURIComponent(urlArgsObj.plateNo);         //  车牌号码;
var OPERATOR = "";        //  操作员;
var PARKINGSPACE = "";    //  车位数;
var ISEXPIRE = "";      //  是否有效期内  0--是，1--否;
var USERID = "";    //  操作人ID;
var USERNAME = "";  //  操作人名称;
var RULETYPE = "";  //  规则类型;  1--线下；2--云停车；3--路侧停车
var _USERTEL = "";
var _USERNAME = "";
var gridObj;         //  bsgrid 的表格对象
var gridObj1;        //  表单内的表格;
var LONG_USER_DATA_OBJ = new Object();    //  长期用户表格数据参数对象;

var onePeriodObj = new Object();  //  一个周期的对象;
var ruleTypeObj = new Object();   //  根据车场ID获取规则和车场对应分公司的储存对象;
var initOnePeriodObj = new Object();  //  点击续费时，第一次加载续费信息的规则和开始结束、结束时间;
var clickBol = true;

$(document).ready(function(){
    search.init();                                                     //  搜索条件初始化
    table.init();                                                      //  表格初始化
    addPopupTags();                                                    //  提示弹窗、删除弹窗;
    // addPopupTags2();                                                   //  同步提示框；

    getForm({"formId":"longuserForm"},"detailPopupForm","Detail");     //  创建新增、修改form表单;
    getPopupCompany();                                                 //  获取弹窗内的分公司下拉框;
    var _companyName = $("#companyNameDetail").val();
    getPopupPark(_companyName);                                        //  获取弹窗内的分公司下拉框;
    var _parkId = $("#parkIdDetail").val();
    getPopupRules(_parkId);                                            //  获取弹窗内的分公司下拉框;
    detailPopupEvent();                                                //  新增、弹窗内的操作事件;

    getForm({"formId":"feeForm"},"renewPopupForm","Charge");           //  创建续费form表单;
    addRenewPopupEvent();                                              //  续费弹窗操作事件;
    getText();   //限制字数；
    // explain();
});

var search = {
    init : function(){
        search.view.checkUrlArgs();  //   验证url中的参数;
        search.model.getUserInfo();  //   获取当前登录用户信息;
        search.model.getPark();      //   获取车场自动补全的数据；
        search.view.eventFn();       //   事件
    }
};
search.model = {
    getUserInfo : function(){   //   获取当前登录用户信息;
        var _userId = "";
        var _userName = "";
        $.ajax({
            url :"/SaaS-Platform/queryUserControls",
            async : false,
            type:"post",
            dataType:"json",
            contentType : "application/json",
            success:function(data){
                var _arr = data.employee;
                var createPeople = _arr.id;
                var createPeopleName = _arr.name;
                _userId = createPeople;
                _userName = createPeopleName;
            }
        });
        USERID = _userId;
        USERNAME = _userName;
    },

    getPark : function(){
        $.ajax({
            url : interfaceObj.parkUrl,
            async : false,
            type : "post",
            data : {"companyId":""},
            dataType : "json",
            // contentType : "application/json",
            success : function(data){
                var _arr = data.resultObj;
                if(_arr == undefined || _arr.length == "0" || !_arr){
                    return false;
                }

                parkAutoComplete.setParkNameFirst(_arr);     //  初始化页面时，赋值有权限的第一个车场;
                var arr = $.map(_arr,function (value,key) { return { value:value.parkName,data:value.parkId}});
                $(".parkName").autocomplete({
                    lookup: arr
                });
                parkAutoComplete.blurFn(_arr);      //  车场输入框失去焦点时；
            }
        });
    },

    syncData : function(){                 //  同步数据;
        clickBol = false;
        var _obj1 = getRuleType(CARPARKID);
        var _obj = {"carParkId":_obj1.carParkId,"commandType":"2","initiatorName":USERNAME};
        $.ajax({
            url : interfaceObj.syncDataUrl,
            type : "post",
            data : JSON.stringify(_obj),
            dataType : "json",
            contentType : "application/json",
            success : function(data){
                clickBol = true;
                if(data.message.errorCode == "200"){
                    warning("同步成功！");
                }else{
                    warning("同步失败！");
                }
            }
        });
    }
};

search.view = {
    checkUrlArgs : function(){
        if(CARPARKID != undefined && CARPARKID != "" && CARPARKID != null && CARPARKID != "undefined"){
            $(".parkName").attr("data-code",CARPARKID);
            $(".parkName").val(CARPARKNAME)
        }else{
            CARPARKID = "";
            CARPARKNAME = "";
        }

        if(PLATENO != "" && PLATENO != undefined && PLATENO != "undefined" && PLATENO != null){
            $(".plateNo").val(PLATENO);
        }else{
            PLATENO = "";
        }
    },

    eventFn : function(){
        $(".searchBtn").click(function(){    //  点击查询按钮;
            CARPARKID = $(".parkName").attr("data-code");
            OPERATOR = $(".operator").val();
            PLATENO = $(".plateNo").val();
            PARKINGSPACE = $(".parkingSpace").val();
            ISEXPIRE = $(".isExpire").val();
            USERNAME = $(".userName").val();
            USERTEL = $(".userTel").val();
            if(CARPARKID != undefined && CARPARKID != "" && CARPARKID != null && CARPARKID != "undefined"){
                CARPARKID = $(".parkName").attr("data-code");
            }else{
                CARPARKID = "";
            }
            LONG_USER_DATA_OBJ = {"userTel":USERTEL,"userName":USERNAME,"parkId":CARPARKID,"licensePlateNumber":PLATENO,"operaterName":OPERATOR,"parkingSpaceNumber":PARKINGSPACE,"isExpire":ISEXPIRE};
            gridObj.search(LONG_USER_DATA_OBJ);
        });

        $(".addBtn").click(function(){
            if(clickBol){
                emptyDetailPopup();
                addRemoveDisabled();    //  新增长期用户信息时，移除分公司、车场、规则、用户属性不可修改的属性；
                $("#chargeRuleIdDetail").removeAttr("disabled","disabled");
                $(".detailPopupTop span").html("新增信息");
                removeDisabledLookDetail();
                showDetailPopup($(".detailPopup"));    //  显示弹窗;
                $(".freeTableForm").hide();
                var _parkId = $(".parkName").attr("data-code");
                changeRuleType(_parkId);

                $(".uploadFile").unbind("change");
                $(".uploadFile").on("change",function(){
                    uploadFileFn({});
                });

                $(".detailPopupSureBtn").unbind("click");
                $(".detailPopupSureBtn").click(function(){
                    if(!checkNecessary()){
                        warning("必填项不能为空");
                        return false;
                    }

                    var _obj1 = new Object();
                    var _obj = getPopupValue(_obj1)  //  获取弹窗内的参数;
                    _obj["operaterName"] = USERNAME;
                    _obj["action"] = "i";
                    submitFn(_obj);        //  保存信息
                });
            }
        });

        $(".syncDataBtn").click(function(){
            search.model.syncData();
        });
    }
};

var table = {
    init : function(){
        table.model.getTableHeader();
        table.model.getTableData();
        // extendBsgrid();
        // addPageFn()

    }
};

table.model = {
    getTableHeader : function(){
        $.ajax({
            url : interfaceObj.tableHeaderUrl,
            async : false,
            type : "post",
            data : JSON.stringify({"gridId":"longuserTables"}),
            dataType : "json",
            contentType:"application/json",
            success : function(data){
                var _arr = data.resultObj;
                // var _arr = tableHeaderObj.resultObj;
                table.view.createTableHeader(_arr);
            }
        });
    },

    getTableData : function(){
        CARPARKID = $(".parkName").attr("data-code");
        CARPARKID == undefined ? CARPARKID = "" : CARPARKID = CARPARKID;
        OPERATOR = $(".operator").val();
        PLATENO = $(".plateNo").val();
        PARKINGSPACE = $(".parkingSpace").val();
        ISEXPIRE = $(".isExpire").val();
        if(CARPARKID != undefined && CARPARKID != "" && CARPARKID != null && CARPARKID != "undefined"){
            CARPARKID = $(".parkName").attr("data-code");
        }else{
            CARPARKID = "";
        }
        LONG_USER_DATA_OBJ = {"userName":_USERNAME,"userTel":_USERTEL,"parkId":CARPARKID,"licensePlateNumber":PLATENO,"operaterName":OPERATOR,"parkingSpaceNumber":PARKINGSPACE,"isExpire":ISEXPIRE,"action":"s"};

        gridObj = $.fn.bsgrid.init('longUserTable', {
            url:interfaceObj.tableDataUrl,
            otherParames : LONG_USER_DATA_OBJ,
            // localData : tableDataObj.data,
            pageSize: 15,
            // pageSizeSelect:true,
            // pagingLittleToolbar : true,
            // showPageToolbar: true,    //是否显示分页工具条；
            stripeRows : true,        //  隔行变色;
            isProcessLockScreen : true,
            //  数据渲染后，执行的操作；
            additionalAfterRenderGrid:function(){
                addPageFn();
                refreshTotalPages();

                var _num1 = "";  // 车牌号表头下标;
                var _num2 = "";  // 规则描述表头下标;
                $(".tableHeader th").each(function(i){
                    var _wIndex = $(this).attr("w_index");
                    if(_wIndex == "licensePlateNumber"){
                        _num1 = $(this).index();
                    }else if(_wIndex == "userInfomation"){
                        _num2 = $(this).index();
                    }
                });

                var _num3 = gridObj.getEndRow();
                for (var i = 0; i < _num3; i++) {
                    $("#longUserTable tbody tr").eq(i).children("td").eq(_num1).css({"max-width":"150px","word-wrap":"break-word","word-break":"break-all"});
                    $("#longUserTable tbody tr").eq(i).children("td").eq(_num2).css({"max-width":"150px","word-wrap":"break-word","word-break":"break-all"});
                }

            }
        });
    },
};

table.view = {
    createTableHeader : function(_ARR){
        $.each(_ARR, function(i, value) {
            $("<th>").text(value.columnName).attr(value.className,value.functionName).attr("w_align","center").appendTo(".tableHeader");
        });
    }
};

// function extendBsgrid(){    //  扩展的分页工具条;
$.fn.bsgrid.initPaging = function (options) {

};

$.fn.bsgrid.setPagingValues = function (options) {
    // $("#longUserTable_pt").pagination(options.totalRows, {
    $('#' + options.pagingOutTabId + ' td').pagination(options.totalRows, {
        current_page: options.curPage - 1,
        num_display_entries: 5,
        num_edge_entries: 2,
        items_per_page: options.settings.pageSize,
        prev_text: $.bsgridLanguage.pagingToolbar.prevPage,
        next_text: $.bsgridLanguage.pagingToolbar.nextPage,
        callback: function (page_index, jq) {
            $.fn.bsgrid.getGridObj(options.gridId).page(page_index + 1);
            return false;
        }
    });
};
// }

function addPageFn(){     //  扩展的分页工具条;
    var _str1 = "<div class='gotoPage'><span>跳转到</span><input id='numPageTxt' type='text' data-current-page='1'  value=''><span>页</span><a id='gotoTargetPage' href='javascript:goFn()'>GO</a></div>";
    var _str2 = "<div class='pages'>共<span id='totalPages'></span>页/<span class='totalDatas'></span>条数据</div>";
    var _str3 = "<div class='priExpBtns'><a class='exportBtn' onclick='exportFn(\"\")' href='javascript:void(0)'></a><a class='printBtn' onclick='printdiv(\"longUserTable\")' href='javascript:void(0)'></a></div>";
    $("#longUserTable_pt_outTab tbody tr td").append(_str1);
    $("#longUserTable_pt_outTab tbody tr td").append(_str2);
    $("#longUserTable_pt_outTab tbody tr td").append(_str3);

    $("#numPageTxt").blur(function(){
        var _numPage = $("#numPageTxt").val();
        var reg = /^\d+$/;
        if(!reg.test(_numPage)){
            $("#numPageTxt").val("");
        }
    });
}

//打印功能；
function printdiv(printpage){
    $("#"+printpage).jqprint();
}

$.fn.bsgrid.sort = function (obj,options){
    options.sortName = '';
    options.sortOrder = '';
    var aObj = $(obj).find('a');
    var field = $(aObj).attr('sortName');
    var columnsModel = options.columnsModel;
    $.fn.bsgrid.getGridHeaderObject(options).each(function (i) {
        var sortName = columnsModel[i].sortName;
        if (sortName != '') {
            var sortOrder = $.fn.bsgrid.getSortOrder($(this), options);

            if (!options.settings.multiSort && sortName != field) {
                // revert style
                $(this).find('a').attr('class', 'sort sort-view');
            } else {
                if (sortName == field) {
                    if (sortOrder == '') {
                        sortOrder = 'desc';
                    } else if (sortOrder == 'desc') {
                        sortOrder = 'asc';
                    } else if (sortOrder == 'asc') {
                        sortOrder = '';
                    }
                    $(this).find('a').attr('class', 'sort sort-' + (sortOrder == '' ? 'view' : sortOrder));
                }
                if (sortOrder != '') {
                    options.sortName = ($.trim(options.sortName) == '') ? sortName : (options.sortName + ',' + sortName);
                    options.sortOrder = ($.trim(options.sortOrder) == '') ? sortOrder : (options.sortOrder + ',' + sortOrder);
                }
            }
        }
    });
    $.fn.bsgrid.page(1,options);
};

$.fn.bsgrid.gotoPage = function (options, goPage) {
    if (goPage == undefined) {
        return;
    }
    if ($.trim(goPage) == '' || isNaN(goPage)) {
        if (options.settings.pageIncorrectTurnAlert) {
            // alert("--"+$.bsgridLanguage.needInteger);
        }
    } else if (parseInt(goPage) < 1 || parseInt(goPage) > options.totalPages) {
        if (options.settings.pageIncorrectTurnAlert) {
            // alert("--"+$.bsgridLanguage.needRange(1, options.totalPages));
        }
    } else {
        $.fn.bsgrid.getGridObj(options.gridId).page(parseInt(goPage));
    }
};

function goFn(){    //   表格页码跳转;
    var _obj = new Object();
    var _numPage = $("#numPageTxt").val();
    if(_numPage == ""){
        return false;
    };

    gridObj.gotoPage(Number(_numPage));
}

function refreshTotalPages(){    //  获取当前页数，数据总条数
    var _pages = gridObj.getTotalPages();
    var _totalRows = gridObj.getTotalRows();
    if(_pages == "0"){
        _pages = "1"
    };
    $("#totalPages").html(_pages);
    $(".totalDatas").html(_totalRows);
}


//   表格数据的自定义操作;
function getProductOrChargeName(record, rowIndex, colIndex, options){   // 规则/计费包; //   parkType  1--线下；2--云停车；3--路侧停车
    var _rowObj = gridObj.getRecord(rowIndex);
    return "<a href='javascript:turnRuleView("+rowIndex+")'>"+_rowObj.chargeRuleName+"</a>";
}

function turnRuleView(rowIndex){
    var _rowObj = gridObj.getRecord(rowIndex);
    var _parkId = _rowObj.parkId;
    var _parkTypeObj = getRuleType(_parkId);
    var _parkName = _parkTypeObj.parkName;
    if(_parkTypeObj.parkType == "1"){
        http://101.37.96.80/PortalParking/rule/js/longRuleRealTime.js
            window.open("/PortalParking/rule/html/longRuleRealTime.html?parkId="+_parkId+"&parkName="+_parkName);
    }else if(_parkTypeObj.parkType == "2" || _parkTypeObj.parkType == "3"){
        window.open("/PortalParking/html/ruleBilling.html?webType=5&parkId="+_parkId+"&parkName="+_parkName);
    }
}

function action(record, rowIndex, colIndex, options){   //  清除操作;
    var _rowObj = gridObj.getRecord(rowIndex);
    var _auditingStatus = _rowObj.auditingStatus;
    var _isSendStatus = _rowObj.isSendStatus;
    if(_auditingStatus == "00"){
        return "<span class='noUpdateBtn'>修改</span><span class='noUpdateBtn'>删除</span><span class='noUpdateBtn'>续费</span><a class='lookA' href='javascript:lookDetailFn("+rowIndex+")'>查看详情</a>";
    }else if(_isSendStatus == "1" && _auditingStatus == "13"){
        return "<a class='updateA' href='javascript:updateFn("+rowIndex+")'>修改</a><a class='deleteA' href='javascript:deleteFn("+rowIndex+")'>删除</a><span class='noUpdateBtn'>续费</span><a class='lookA' href='javascript:lookDetailFn("+rowIndex+")'>查看详情</a>";
    }else{
        return "<a class='updateA' href='javascript:updateFn("+rowIndex+")'>修改</a><a class='deleteA' href='javascript:deleteFn("+rowIndex+")'>删除</a><a class='renewA' href='javascript:renewFn("+rowIndex+")'>续费</a><a class='lookA' href='javascript:lookDetailFn("+rowIndex+")'>查看详情</a>";
    }
}

function lookDetailFn(rowIndex){                    //  查看详情;
    emptyDetailPopup();
    emptyRenewPopup2();
    showDetailPopup($(".detailPopup"));             //  显示弹窗;
    $(".detailPopupTop span").html("查看详情信息");     //  修改弹窗标题;
    addDisabledLookDetail();
    var _rowObj = gridObj.getRecord(rowIndex);
    $(".freeTableForm").show();
    setDetailValue(_rowObj);                        //  弹窗赋值;
    getRenewTableHeader2();                                                         //  创建表头;
    var _obj = {"carParkId":_rowObj.parkId,"plateNo":_rowObj.licensePlateNumber};
    getRenewTableData2(_obj);
    $("#licensePlateNumberDetail input").attr("disabled","disabled");
    $("#licensePlateNumberDetail .plateNoDeleteBtn").hide();
    $(".uploadFileForm .uploadList li img").hide();
}

function addDisabledLookDetail(){                   //  点击查看详情时，弹窗修改窗口,让所有标签不可操作;
    $(".popupFormListDetail input,.popupFormListDetail select,.popupFormListDetail textarea").attr("disabled","disabled");
    $("#uploadFile").hide();
    $(".detailPopupSureBtn").hide();
    $(".addPlateNoBtn").hide();
    $(".deleteImg").unbind("click");
}

function removeDisabledLookDetail(){                //  新增、修改时，让部分标签可操作;
    $(".popupFormListDetail input,.popupFormListDetail select,.popupFormListDetail textarea").removeAttr("disabled");
    $(".inputDoms input").removeAttr("disabled");
    $("#uploadFile").show();
    $(".detailPopupSureBtn").show();
    $(".addPlateNoBtn").show();
    $("#licensePlateNumberDetail input").removeAttr("disabled");
    $("#licensePlateNumberDetail .plateNoDeleteBtn").show();
    $("#companyNameDetail").attr("disabled","disabled");
    $("#parkIdDetail").attr("disabled","disabled");
    $(".popupFormListDetail .chargeRuleIdForm select").attr("disabled","disabled");
    $("#chargeRuleIdDetail").removeAttr("disabled");
    // $("#userPropertiyDetail").attr("disabled","disabled");
}

function addPopupTags(){  //  提示弹窗、删除弹窗
    var _warning = "<div class='warning'><div class='black'></div><div class='warningContent'></div></div>";
    var _delete = "<div class='deletePopupDiv'><div class='deleteBlack'></div><div class='deletePopup'><div class='deletePopupContent'>确定删除吗？</div><div class='deletePopupBtns'><a class='sureBtn' href='javascript:void(0)'>确定</a><a class='cancelBtn' href='javascript:void(0)'>取消</a></div></div></div>";
    $(".all").append(_warning);
    $(".all").append(_delete);
}

// function addPopupTags2(){  //  提示弹窗、删除弹窗
//     var _warning2 = "<div class='warning'><div class='black'></div><div class='warningContent'></div></div>";
//     var _delete2 = "<div class='deletePopupDiv2'><div class='deleteBlack'></div><div class='deletePopup'><div class='deletePopupContent'>会清空审核内容，弹出框内容。</div><div class='deletePopupBtns'><a class='sureBtn' href='javascript:void(0)'>确定</a><a class='cancelBtn' href='javascript:void(0)'>取消</a></div></div></div>";
//     $(".all").append(_warning2);
//     $(".all").append(_delete2);
// }

function getText(){
    $("#userInfomationDetail").on("input propertychange", function() {
        var $this = $(this),
            _val = $this.val(),
            count = "";
        if (_val.length > 120) {
            alert("规则描述最大输入文字为120字");
            return false;
        }
        return true;
    });
}

function getRuleType(_parkId){     //   获取规则类型;
    var _obj = new Object();
    $.ajax({
        url : interfaceObj.ruleTypeUrl,
        type : "post",
        async : false,
        data : JSON.stringify({"parkId":_parkId}),
        dataType : "json",
        contentType : "application/json",
        success : function(data){
            _obj = data.result;
        }
    });
    return _obj;
}

function changeRuleType(_parkId){      //  根据车场ID获取规则类型及分公司code;
    console.log(_parkId);
    var _ruleTypeObj = getRuleType(_parkId);       //  获取规则类型;
    console.log(_ruleTypeObj);
    $("#companyNameDetail").val(_ruleTypeObj.companyName);
    getPopupPark(_ruleTypeObj.companyName)
    $("#parkIdDetail").val(_ruleTypeObj.serialNo);

    var _ruleType = _ruleTypeObj.parkType;    //  1--线下；2--云停车；3--路侧停车
    if(_ruleType == "1"){
        $(".popupFormListDetail .chargeRuleIdForm label").html("长期收费规则");
        $(".popupFormListDetail .chargeRuleIdForm select").attr("id","chargeRuleIdDetail");
        getPopupRules(_ruleTypeObj.serialNo);
    }else{
        $(".popupFormListDetail .chargeRuleIdForm label").html("计费包");
        $(".popupFormListDetail .chargeRuleIdForm select").attr("id","productIdDetail");
        getYunRules(_ruleTypeObj.serialNo,$("#productIdDetail"));
    }
}

function updateFn(rowIndex){                        //  修改
    if(clickBol){
        emptyDetailPopup();
        showDetailPopup($(".detailPopup"));             //  显示弹窗;
        $(".detailPopupTop span").html("修改信息");     //  修改弹窗标题;
        removeDisabledLookDetail();
        var _rowObj = gridObj.getRecord(rowIndex);
        var _effectiveEventTime =_rowObj.effectiveEventTime;
        $(".freeTableForm").hide();
        setDetailValue(_rowObj);                        //  弹窗赋值;
        $(".uploadFile").unbind("change");
        $(".uploadFile").on("change",function(){
            uploadFileFn(_rowObj);
        });

        $(".detailPopupSureBtn").unbind("click");
        $(".detailPopupSureBtn").click(function(){      //  点击保存按钮;
            if(!checkNecessary()){
                warning("必填项不能为空");
                return false;
            }
            var _rowObj = gridObj.getRecord(rowIndex);

            var _effectiveEventTime =_rowObj.effectiveEventTime;
            var _obj = getPopupValue(_rowObj);           //  获取弹窗内的参数;
            _obj["action"] = "u";
            _obj["operaterName"] = USERNAME;
            _obj["effectiveEventTime"] = _effectiveEventTime;
            submitFn(_obj);                             //  保存信息
        });
    }
}

function renewFn(rowIndex){
    emptyRenewPopup();                                                             //  清空续费弹窗;
    showDetailPopup($(".renewPopup"));                                             //  显示弹窗;
    $(".renewPopupTop span").html("续费信息");
    var _rowObj = gridObj.getRecord(rowIndex);                                     //  获取操作的当前行数据：
    var _ruleTypeObj = getRuleType(_rowObj.parkId);                                //  获取规则类型;
    changeRenewRuleType(_ruleTypeObj);                                             //  判断车场类型，区分规则;
    setRenewPopupValue(_rowObj);                                                   //  赋值;
    checkUserIsChange();                                                           //  判断是否为一次性用户，按天用户，这类用户不能续费;
    getRenewTimeMoney(_rowObj,"init");                                                //  获取开始时间、结束时间、收费金额;
    // renewIsChecked(_rowObj);                                                       //

    renewPopupFormEvent(_rowObj,_ruleTypeObj);                                     //  续费弹窗内的操作事件;
    getRenewTableHeader();                                                         //  创建表头;
    var _obj = {"carParkId":_rowObj.parkId,"plateNo":_rowObj.licensePlateNumber};
    getRenewTableData(_obj);                                                       //  创建续费表格对象;

    $(".searchBtnCharge").unbind("click");
    $(".searchBtnCharge").click(function(){
        var _plateNo = $("#licensePlateNumberCharge").val();
        var _obj = {"carParkId":_rowObj.parkId,"plateNo":_plateNo};
        gridObj1.search(_obj);
    });

    $(".renewPopupSureBtn").unbind("click");
    $(".renewPopupSureBtn").click(function(){
        if(!checkRenewNecessary()){
            warning("必填项不能为空");
            return false;
        };
        var _obj = getRenewPopupValue(_rowObj);
        _obj["startTime"] = getRenewStartTime(_rowObj);      // 根据重新续费的checkbox是否被选中，决定续费开始时间;
        _obj["renewTime"] = $("#startTimeCharge").val();
        _obj["action"] = "n";
        _obj["operaterName"] = USERNAME;
        saveRenewPopupValue(_obj);
    });
}

function updateAddDisabled(){    //  修改信息时，分公司、车场、规则、用户属性不可修改;
    $("#companyNameDetail").attr("disabled","disabled");
    $("#parkIdDetail").attr("disabled","disabled");
    $(".popupFormListDetail .chargeRuleIdForm select").attr("disabled","disabled");
    $("#userPropertiyDetail").attr("disabled","disabled");
}

function addRemoveDisabled(){   //  新增长期用户信息时，移除分公司、车场、规则、用户属性不可修改的属性；
    $("#companyNameDetail").removeAttr("disabled","disabled");
    $("#parkIdDetail").removeAttr("disabled","disabled");
    $(".popupFormListDetail .chargeRuleIdForm select").removeAttr("disabled","disabled");
    $("#userPropertiyDetail").removeAttr("disabled","disabled");
    $("#chargeRuleIdDetail").removeAttr("disabled");
}


function deleteFn(rowIndex){   //   删除
    $(".deletePopupDiv").show();
    $(".cancelBtn").unbind("click");
    $(".cancelBtn").on("click",function(){
        $(".deletePopupDiv").hide();
    });

    $(".sureBtn").unbind("click");
    $(".sureBtn").on("click",function(){
        $(".deletePopupDiv").hide();
        var _rowObj = gridObj.getRecord(rowIndex);
        var _effectiveEventTime =_rowObj.effectiveEventTime;
        var _obj = {"recordId":_rowObj.recordId,"parkId":_rowObj.parkId,"action":"d","operaterId":USERID,"operaterName":USERNAME,"effectiveEventTime":_effectiveEventTime};
        $.ajax({
            url : interfaceObj.operateUrl,
            type : "post",
            data : JSON.stringify(_obj),
            dataType : "json",
            contentType : "application/json",
            success : function(data){
                if(data.message.errorCode == "200"){
                    warning("删除成功");
                    // window.location.reload();
                    gridObj.search(LONG_USER_DATA_OBJ);
                }else{
                    warning("删除失败");
                }
            }
        });
    });
}

function getForm(_obj,_dom,_afterId){   //  获取form表单;
    $.ajax({
        url : interfaceObj.formUrl,
        type : 'post',
        async : false,
        data : JSON.stringify(_obj),
        dataType : 'json',
        contentType:"application/json",
        success : function(data){
            var dataObj = data.resultObj;
            form.view.createFormTag(dataObj,_dom,_afterId);
        }
    });
}

function getPopupCompany(){   // 获取弹窗内分公司
    $.ajax({
        url : interfaceObj.companyUrl,
        type : "post",
        async : false,
        data : JSON.stringify({"frameworkType": "Company","isExternal": 0,"frameworkMethod": "1", "UID": cookie}),
        dataType : 'json',
        success : function(data){
            var _arr = data.resultObj;
            var _options = "";
            _options = "<option value=''>全部</option>";
            $.each(_arr,function(i,value){
                _options += "<option data-name='companyName' value='"+value.companyId+"'>"+value.companyName+"</option>";
            });
            $("#companyNameDetail").html(_options);
        }
    });
}

function getPopupPark(_companyName){    //  创建弹窗内车场下拉框；
    $.ajax({
        url : interfaceObj.parkUrl,
        type : 'post',
        async : false,
        data : {"companyId": _companyName},
        dataType : 'json',
        success : function(data){
            var _arr = data.resultObj;
            var _options = "";
            $.each(_arr,function(i,value){
                _options += "<option data-name='parkName' value='"+value.parkId+"'>"+value.parkName+"</option>";
            });
            $("#parkIdDetail").html(_options);
        }
    });
}

function getPopupRules(_parkId){    //  创建弹窗内车场下拉框；
    $.ajax({
        url : interfaceObj.ruleUrl,
        type:"post",
        async : false,
        dataType:"json",
        data:JSON.stringify({"parkId":_parkId}),
        contentType:"application/json",
        success : function(data){
            var _arr = data.data;
            var _options = "";
            $.each(_arr,function(i,value){
                _options += "<option data-name='chargeRuleName' value='"+value.ruleId+"'>"+value.chargeRuleName+"</option>";
            });
            $("#chargeRuleIdDetail").html(_options);
        }
    });
}

function getYunRules(_parkId,_dom){    //  获取云停车的规则;
    $.ajax({
        url : interfaceObj.ytcUrl,
        type:"post",
        async : false,
        dataType:"json",
        data:{"parkId":_parkId,"pageSize":"99","curPage":"1"},
        // contentType:"application/json",
        success : function(data){
            var _arr = data.data;
            var _options = "";
            $.each(_arr,function(i,value){
                _options += "<option data-name='chargeRuleName' value='"+value.productId+"'>"+value.productName+"</option>";
            });
            _dom.html(_options);
        }
    });
}

function detailPopupEvent(){      //  新增、修改弹窗的事件操作;
    hidePopup($(".detailPopupClose,.detailPopupCancelBtn"),$(".detailPopup"));   //  新增、修改关闭弹窗
    tabChange($(".popupFormTabDetail li"),$(".popupFormListDetail"));  //  新增、修改表单选项卡切换;

    $("#companyNameDetail").on("change",function(){    //  分公司变化时，停车变化;
        var _companyName = $("#companyNameDetail").val();
        getPopupPark(_companyName);
        var _parkId = $("#parkIdDetail").val();
        // getPopupRules(_parkId);
        changeRuleType(_parkId);
    });

    $("#parkIdDetail").on("change",function(){     //  停车场变化时，收费规则变化
        var _parkId = $("#parkIdDetail").val();
        // getPopupRules(_parkId);
        changeRuleType(_parkId);
    });

    $(".addPlateNoBtn").click(function(){   //   车牌号输入框新增;
        var _dom = '<div class="inputDoms"><input class="licensePlateNumber" type="text" placeholder="请输入车牌号"><img class="plateNoDeleteBtn" src="../images/plateNoDelete.png"></div>';
        $(".plateNoInputList").append(_dom);
        deletePlateNo();
    });
    deletePlateNo();
}

function deletePlateNo(){   //  删除车牌号;
    $(".plateNoDeleteBtn").unbind("click");
    $(".plateNoDeleteBtn").click(function(){
        if($(".plateNoDeleteBtn").length > 1){
            $(this).parent("div").remove();
        }
    });
}

function addRenewPopupEvent(){   //  续费弹窗操作;
    $("#userNameCharge").attr({"disabled":"true","cursor":"not-allowed"});
    $("#startTimeCharge").attr({"disabled":"true","cursor":"not-allowed","readonly":"readonly"});
    $("#endTimeCharge").attr({"disabled":"true","cursor":"not-allowed"});
    $("#amountCharge").attr({"disabled":"true","cursor":"not-allowed"});
    $("#licensePlateNumberCharge").attr({"disabled":"true","cursor":"not-allowed"});
    $(".popupFormListCharge .chargeRuleIdForm select").attr({"disabled":"true","cursor":"not-allowed"});
    $(".popupFormListCharge .searchForm").hide();

    hidePopup($(".renewPopupClose,.renewPopupCancelBtn"),$(".renewPopup"));  // 隐藏续费弹窗;
    tabChange($(".popupFormTabCharge li"),$(".popupFormListCharge"));       //  续费信息的选项卡切换;

    $("#startTimeCharge").focus(function(){     //   开始时间，输入获取焦点时，出现日期框；
        WdatePicker({maxDate:'#F{$dp.$D(\'endTimeCharge\')}',dateFmt:'yyyy-MM-dd HH:mm:ss',skin:'twoer',isShowClear:false,onpicked:changeRenewEndTime});
    });
    $("#endTimeCharge").focus(function(){      //   结束时间，输入获取焦点时，出现日期框；
        WdatePicker({minDate:'#F{$dp.$D(\'startTimeCharge\')}',dateFmt:'yyyy-MM-dd HH:mm:ss',skin:'twoer',isShowClear:false});
    });
}

function changeRenewEndTime(){      //  修改开始时间时，执行的方法;

    var _inputStartTime = $("#startTimeCharge").val();
    var _chargeOrderNum = $("#chargeOrderNumCharge").val();

    var _endTimes = new Date(_inputStartTime).getTime() + onePeriodObj.dayTimes*_chargeOrderNum;
    var _end = new Date(_endTimes);
    var _endTime = _end.getFullYear() +"-"+ ((_end.getMonth()+1)<10?"0":"") + (_end.getMonth()+1) +"-"
        + (_end.getDate()<10?"0":"") + _end.getDate() +" 23:59:59";
    $("#endTimeCharge").val(_endTime)
}

//  新增、修改的操作方法;
function emptyDetailPopup(){   //  置空新增、修改弹窗
    $(".popupFormListDetail input").val("");
    $(".popupFormListDetail select").children("option").eq(0).removeAttr("selected");
    $(".popupFormListDetail select").val("");
    var _dom = $(".inputDoms").eq(0);
    $(".plateNoInputList").html(_dom);
    $(".inputDoms").children("input").eq(0).val("");
    $(".popupFormListDetail textarea").val("");
    $("#balanceDetail").val("0");
    $(".uploadList").html("");
}

function setDetailValue(_obj){   //  弹框赋值;
                                 // getPopupPark(_obj["companyName"]);
    changeRuleType(_obj["parkId"]);
    // getPopupRules(_obj["parkId"]);
    $(".popupFormListDetail input,.popupFormListDetail select,.popupFormListDetail textarea").each(function(i){
        var _id = $(this).attr("id");
        if(_id && _id != "undefined" && _id != undefined && _id != null){
            _id = _id.substr(0,_id.length-6);
            $(this).val(_obj[_id]);
        }
    });
    updateAddDisabled();    //  修改信息时，分公司、车场、规则、用户属性不可修改;
    setPlateNo(_obj);
    var _strs = _obj["licensePlateNumber"];
    if(_strs == ""){
        return false;
    };
    var _strsArr = _strs.split(",");
    var _plateNo = _strsArr[0];
    getFileListData(_obj["parkId"],_plateNo);
}

function setPlateNo(_obj){
    if(!_obj.hasOwnProperty("licensePlateNumber") || _obj.licensePlateNumber == ""){
        return false;
    }
    var _divs = "";
    if(_obj.licensePlateNumber.indexOf(",") < 0 && _obj.licensePlateNumber.indexOf(";") < 0){
        _divs = '<div class="inputDoms"><input value='+_obj.licensePlateNumber+' class="licensePlateNumber" type="text" placeholder="请输入车牌号"><img class="plateNoDeleteBtn" src="../images/plateNoDelete.png"></div>';
    }else{
        var _arr = _obj.licensePlateNumber.split(/[,;]/);
        $.each(_arr,function(i,value){
            _divs += '<div class="inputDoms"><input value="'+value+'" class="licensePlateNumber" type="text" placeholder="请输入车牌号"><img class="plateNoDeleteBtn" src="../images/plateNoDelete.png"></div>';
        });
    }
    $(".plateNoInputList").html(_divs);
    deletePlateNo();
}

function uploadFileFn(_rowObj){    //  上传图片的方法;
    clickBol = false;
    var _carParkId = $("#parkIdDetail").val();
    var _strs = "";
    $("#licensePlateNumberDetail .inputDoms input").each(function(i){   //  获取车牌号的值;
        _strs += $(this).val() + ",";
    });
    _strs = _strs.substr(0,_strs.length-1);
    if(_strs == ""){
        warning("车牌不能为空!");
        return false;
    };
    var _strsArr = _strs.split(",");
    var _plateNo = _strsArr[0];
    $.ajax({
        url:$("#uploadFile").attr("action")+"?imageType=1&UID="+cookie+"&carParkId="+_carParkId+"&plateNo="+_plateNo,
        type: "POST",
        async : false,
        data: new FormData($('#uploadFile')[0]),
        processData: false,
        cache: false,
        contentType: false,
        success : function(data){
            clickBol = true;
            var data = JSON.parse(data);
            if(data.message.errorCode == "200"){
                getFileListData(_carParkId,_plateNo);  //   查询文件列表;
            }
        },
        error: function (xh,yh,error) {
            alert("上传出错");
        }
    });
}

function getFileListData(_carParkId,_plateNo){   //  查询上传的文件列表;
    $.ajax({
        url : interfaceObj.queryFileUrl,
        type : "post",
        async :false,
        data : {"carParkId":_carParkId,"plateNo":_plateNo,"UID":cookie},
        dataType : 'json',
        success : function(data){
            var _arr = data.data;
            createFileList(_arr,$(".uploadList"),_carParkId,_plateNo);
        }

    });
}

function createFileList(_ARR,_dom,_carParkId,_plateNo){   //  创建列表;
    var _lis = "";
    $.each(_ARR,function(i,value){
        _lis += "<li data-id="+value.id+" data-url="+value.fileUrl+" data-park="+value.carParkId+" ><a target='_blank' href='"+value.fileAliyunUrl+"' class='fileListA' >"+value.fileName+"</a><img class='deleteImg' src='../images/deleteImg.png' /></li>";
    });
    _dom.html(_lis);
    fileListEvent(_carParkId,_plateNo);
}

function fileListEvent(_carParkId,_plateNo){    //  文件列表的事件
    $(".deleteImg").unbind("click");
    $(".deleteImg").click(function(){
        var _id = $(this).parent("li").attr("data-id");
        var _fileName = $(this).parent("li").children("a").text();
        var _obj = {"id":_id,"fileName":_fileName,"carParkId":_carParkId,"plateNo":_plateNo,"UID":cookie};
        deleteFileFn(_obj,_carParkId,_plateNo);
    });
}

function deleteFileFn(_obj,_carParkId,_plateNo){    //  删除文件的方法;
    $.ajax({
        url:interfaceObj.deleteFileUrl,
        type : "post",
        contentType: "application/json",
        data : JSON.stringify(_obj),
        dataType : "json",
        success : function(data){
            if(data.message.errorCode == "200"){
                getFileListData(_carParkId,_plateNo);
            }
        }
    });
}

function checkNecessary(){      //  验证必填项;
    var _bol = true;
    $(".popupFormListDetail .popupFormListLiT").children("input,select").each(function(i){
        var _val = $(this).val();
        if(_val == ""){
            _bol = false;
        }
    });

    var _plateNos = "";
    $(".popupFormListDetail .inputDoms input").each(function(i){
        var _val = $(this).val();
        if(_val != "" && _val != undefined ){
            _plateNos += $(this).val() + ",";
        }
    });

    var _plateNoNum = _plateNos.substr(0,_plateNos.length-1);
    if(_plateNoNum == ""){
        _bol = false;
    };
    return _bol;
}

function getPopupValue(_obj){    //  获取弹窗的value值;
    setObjValue($(".popupFormListDetail input"),_obj);
    setObjValue($(".popupFormListDetail select"),_obj);
    setObjValue($(".popupFormListDetail textarea"),_obj);

    var _values = "";
    $("#licensePlateNumberDetail .inputDoms input").each(function(i){   //  获取车牌号的值;
        var _val = $(this).val();
        if(_val != "" && _val != null){
            _values += _val + ";";
        }
    });
    _values = _values.substr(0,_values.length-1);
    _obj["licensePlateNumber"] = _values;
    return _obj;
}

function submitFn(_obj){   //  弹窗提交;
    clickBol = false;
    $.ajax({
        url : interfaceObj.operateUrl,
        type : "post",
        data : JSON.stringify(_obj),
        dataType : "json",
        contentType : "application/json",
        success : function(data){
            clickBol = true;
            if(data.message.errorCode == "200"){
                warning("信息保存成功");
                hideDetailPopup($(".detailPopup"));
                gridObj.search(LONG_USER_DATA_OBJ);
            }else if(data.message.errorCode == "204"){
                var _errorDsc = data.message.errorDsc;
                warning(_errorDsc);
            }else{
                warning("信息保存失败");
                return false;
            }
        }
    });
}


//  续费弹窗内的所有操作;
function emptyRenewPopup(){         //  情况续费的弹窗;
    $(".popupFormListCharge input[type=text]").val("");
    $(".popupFormListCharge select option").removeAttr("selected");
    $(".popupFormListCharge input[type=checkbox]").removeAttr("checked");
    $("#startTimeCharge").attr("disabled","true").css("cursor","not-allowed");
    $(".popupFormListCharge .chargeRuleIdForm select").attr({"disabled":"true","cursor":"not-allowed"});
    gridObj1 = "";                                 //  点击续费时，清除上一次的学费表格对象;
    $("#feeTableHeader").html("");                 //  清除续费表格额的表头;
    $("#feeTable tbody").html("");
    $("#feeTable_pt_outTab").remove();
}
function emptyRenewPopup2(){         //  情况续费的弹窗;
    gridObj1 = "";                                 //  点击续费时，清除上一次的学费表格对象;
    $("#freeTableHeader").html("");                 //  清除续费表格额的表头;
    $("#freeTable tbody").html("");
    $("#freeTable_pt_outTab").remove();
}
function changeRenewRuleType(_ruleTypeObj){      //  根据车场ID获取规则类型及分公司code;
    var _ruleType = _ruleTypeObj.parkType;    //  1--线下；2--云停车；3--路侧停车
    if(_ruleType == "1"){
        $(".popupFormListCharge .chargeRuleIdForm label").html("长期收费规则");
        $(".popupFormListCharge .chargeRuleIdForm select").attr("id","chargeRuleIdCharge");
        getRenewRules(_ruleTypeObj.serialNo);
    }else{
        $(".popupFormListCharge .chargeRuleIdForm label").html("计费包");
        $(".popupFormListCharge .chargeRuleIdForm select").attr("id","productIdCharge");
        getYunRules(_ruleTypeObj.serialNo,$("#productIdCharge"));
    }
}

function setRenewPopupValue(_obj){            // 续费弹窗赋值;

    $(".popupFormListCharge input[type=text],.popupFormListCharge select").each(function(i){
        var _id = $(this).attr("id");
        if(_id && _id != "undefined" && _id != undefined && _id != null){
            _id = _id.substr(0,_id.length-6);
            if(_id != "startTime" && _id != "endTime"){
                $(this).val(_obj[_id]);
            }
        }
    });
    $("#chargeOrderNumCharge").val("1");
}

function getRenewRules(_parkId){                       //   创建规则列表;
    $.ajax({
        url : interfaceObj.ruleUrl,
        type:"post",
        async : false,
        dataType:"json",
        data:JSON.stringify({"parkId":_parkId}),
        contentType:"application/json",
        success : function(data){
            var _arr = data.data;
            var _options = "";
            _options = "<option value=''>--请选择规则--</option>";
            $.each(_arr,function(i,value){
                _options += "<option value="+value.ruleId+">"+value.chargeRuleName+"</option>";
            });

            $("#chargeRuleIdCharge").html(_options);
        }
    });
}

function checkUserIsChange(){                         //  是否为一次性用户，按天用户，这类用户不能续费;
    var _ruleId = $("#chargeRuleIdCharge").val();
    if(_ruleId == "" || _ruleId == null){
        return false;
    }
    $.ajax({
        url : interfaceObj.ruleUrl,
        type:"post",
        dataType:"json",
        data:JSON.stringify({"ruleId":_ruleId}),
        contentType:"application/json",
        success : function(data){
            var _obj = data.data[0];
            var _chargeType = _obj.chargeType;
            if(_chargeType == "0"){
                $(".renewPopupSureBtn").attr("disabled","disabled");
                $(".renewPopupSureBtn").css({"cursor":"not-allowed","background":"#eee"});
            }else{
                $(".renewPopupSureBtn").removeAttr("disabled");
                $(".renewPopupSureBtn").css({"cursor":"pointer","background":"#FFA00A"});
            }

        }
    });
}

function getRenewTimeMoney(_rowObj,_type){               //  查询新一期的续费起始时间及金额;
    var _carParkId = _rowObj.parkId;
    var _startTime = _rowObj.startTime;
    var _endTime = _rowObj.endTime;
    var _ruleId = $("#chargeRuleIdCharge").val();
    var _userId = _rowObj.recordId;
    $("#chargeOrderNumCharge").val("1")
    var _obj = {"carParkId":_carParkId,"chargeOrderNum":"1","startTime":_startTime,"endTime":_endTime,"reTime":"","ruleId":_ruleId,"userId":_userId};

    var _periodObj = new Object();  //  一个周期的对象;
    $.ajax({
        url :interfaceObj.renewTimeMoneyUrl,
        type:"post",
        dataType:"json",
        contentType:"application/json",
        data:JSON.stringify(_obj),
        async:false,
        success : function(data){
            if(!data.hasOwnProperty("resultObj") || data.resultObj == undefined || data.resultObj == ""){
                return false;
            }
            var _timeMoneyObj = data.resultObj;
            var _start = _timeMoneyObj.startTime.substr(0,10) + " 00:00:00";
            var _end = _timeMoneyObj.endTime.substr(0,10) + " 23:59:59";
            var _money = _timeMoneyObj.money;
            var dayTimes = new Date(_end).getTime() - new Date(_start).getTime();
            var days = Math.ceil(dayTimes/1000/60/60/24);

            //   startTime--一周期的开始时间;  endTime--一周期的结束时间; money--一周期的金额; days--一周期的天数;
            _periodObj = {"startTime":_start,"endTime":_end,"money":_money,"days":days,"dayTimes":dayTimes};

            $("#startTimeCharge").val(_start);
            $("#endTimeCharge").val(_end);
            $("#amountCharge").val(_money);
        }
    });

    if(_type == "init"){          //  第一次时，保存初始信息;
        onePeriodObj = _periodObj;
        initOnePeriodObj = _periodObj;
    }else{
        onePeriodObj = _periodObj;
    }
}

// function showOthersFn(){
//     var _str = "<div class='tableOthersPopup'><span class='triangle'></span><span class='headerOperateTitle'>"+_txt+"</span></div>";
//     $(".tableHeader th[w_render="+key+"]").css("position","relative");
//     $(".tableHeader th[w_render="+key+"]").append(_str);
//     var _height = $(".tableHeader th[w_render="+key+"]").height();
//     $(".tableOthersPopup").css("top",_height+5);
//     $(".tableHeader th[w_render="+key+"]").get(0).onmouseover=function(){
//         $(this).children(".tableOthersPopup").show();
//     };

//     $(".tableHeader th[w_render="+key+"]").get(0).onmouseout=function(){
//         $(this).children(".tableOthersPopup").hide();
//     };
// };

function renewPopupFormEvent(_rowObj,_ruleTypeObj){             //  规则切换
    $("#chargeRuleIdCharge").unbind("change");
    $("#chargeRuleIdCharge").on("change",function(){
        onePeriodObj = new Object();
        var _ruleId = $(this).val();
        checkUserIsChange();                    //  是否为一次性用户，按天用户，这类用户不能续费;
        getRenewTimeMoney(_rowObj,"afterOne");             //  查询新一期的续费起始时间及金额;
    });

    $("#chargeOrderNumCharge").blur(function(){  //  缴费期数输入框失去焦点时;
        var _num = parseInt($(this).val());
        var _money = onePeriodObj.money*_num;
        $("#amountCharge").val(_money);
        var _startTime = $("#startTimeCharge").val();
        if(_startTime == "" || _startTime == undefined || _startTime == "undefined"){
            return false;
        }
        var _dayTimes = new Date(_startTime).getTime() + onePeriodObj.dayTimes*_num;
        var _end = new Date(_dayTimes);
        var _endDay = _end.getFullYear() + "-"
            + ((_end.getMonth()+1)<10?"0":"") + (_end.getMonth()+1) + "-"
            + (_end.getDate()<10?"0":"") + (_end.getDate())
            + " 23:59:59";
        $("#endTimeCharge").val(_endDay);
    });

    $(".isRecountCheckboxCharge").click(function(){
        if(this.checked){
            $("#startTimeCharge").removeAttr("disabled");
            $("#startTimeCharge").css("cursor","text");
            $(".popupFormListCharge .chargeRuleIdForm select").removeAttr("disabled").css("cursor","pointer")
        }else{
            $("#startTimeCharge").css("cursor","not-allowed").attr("disabled","true");
            $(".popupFormListCharge .chargeRuleIdForm select").css("cursor","not-allowed").attr("disabled","true");
            $("#startTimeCharge").val(initOnePeriodObj.startTime);
            $("#endTimeCharge").val(initOnePeriodObj.endTime);
            $("#amountCharge").val(initOnePeriodObj.money);
            $("#chargeOrderNumCharge").val("1");
            if(_ruleTypeObj.parkType == "1"){      //  1--线下  2--云停车  3--路测;
                $(".popupFormListCharge .chargeRuleIdForm select").val(_rowObj.chargeRuleId);
            }else{
                $(".popupFormListCharge .chargeRuleIdForm select").val(_rowObj.productId);
            }
        }
    });
}

// function renewIsChecked(_rowObj){    //  判断重新续费是否哦勾选;
// 	if($(".isRecountCheckboxCharge").checked){
//         $("#startTimeCharge").val(initOnePeriodObj.startTime);
// 	}else{
// 		$("#startTimeCharge").val(_rowObj.startTime);
// 	}
// }

function getRenewTableHeader(){   //   获取表头;
    $.ajax({
        url :interfaceObj.tableHeaderUrl,
        async : false,
        type:"post",
        dataType:"json",
        data:JSON.stringify({"gridId":"feeTable"}),
        contentType:"application/json",
        success : function(data){
            var dataHeader = data.resultObj;
            createRenewTableHeader(dataHeader,"feeTableHeader");
        }
    })
}
function getRenewTableHeader2(){   //   获取表头;
    $.ajax({
        url :interfaceObj.tableHeaderUrl,
        async : false,
        type:"post",
        dataType:"json",
        data:JSON.stringify({"gridId":"feeTable"}),
        contentType:"application/json",
        success : function(data){
            var dataHeader = data.resultObj;
            createRenewTableHeader(dataHeader,"freeTableHeader");
        }
    })
}
//创建表单内表头header栏
function createRenewTableHeader(data,_id){
    $.each(data,function(i,value){
        $("<th>").text(value.columnName).attr(value.className,value.functionName).appendTo($("#"+_id));
    })
}
// function explain(){
//     $(".syncDataBtn").mouseover(function(){
//         $(".tableOthersPopup").show();
//     });
//     $(".syncDataBtn").mouseout(function(){
//         $(".tableOthersPopup").hide();
//     });
// }

function getRenewTableData(_dataObj){
    gridObj1 = $.fn.bsgrid.init('feeTable', {
        url:interfaceObj.renewTableDataUrl,
        otherParames:_dataObj,
        pageSizeSelect: true,
        // pagingLittleToolbar:true,
        showPageToolbar:false,
        pageSize: 10,
        additionalAfterRenderGrid:function(){

        }
    });
}
function getRenewTableData2(_dataObj){
    gridObj1 = $.fn.bsgrid.init('freeTable', {
        url:interfaceObj.renewTableDataUrl,
        otherParames:_dataObj,
        pageSizeSelect: true,
        // pagingLittleToolbar:true,
        showPageToolbar:false,
        pageSize: 10,
        additionalAfterRenderGrid:function(){

        }
    });
}
function checkRenewNecessary(){   //  续费弹窗内的必填项验证;
    var _bol = true;
    $(".popupFormListCharge .popupFormListLiT input[type=text],.popupFormListCharge .popupFormListLiT select").each(function(i){
        var _id = $(this).attr("id");
        if(_id && _id != "undefined" && _id != undefined && _id != null){
            var _val = $(this).val();
            if(_val == ""){
                _bol = false;
            }
        }else{
            _bol = false;
        }
    });
    return _bol;
}

function getRenewPopupValue(_obj){    //  获取续费弹窗value值;
    setObjValue($(".popupFormListCharge input[type=text]"),_obj);
    setObjValue($(".popupFormListCharge select"),_obj);
    return _obj;
}

function setObjValue(_dom,_obj){     //  给obj赋值;
    _dom.each(function(i){
        var _id = $(this).attr("id");
        if(_id && _id != "undefined" && _id != undefined && _id != null){
            _id = _id.substr(0,_id.length-6);
            if(_id != "startTime"){
                _obj[_id] = $(this).val();
            }
        }
    });
}

function getRenewStartTime(_rowObj){    // 根据重新续费的checkbox是否被选中，决定续费开始时间;
    var _startTime = "";
    if($(".isRecountCheckboxCharge").get(0).checked){
        _startTime = $("#startTimeCharge").val();
    }else{
        _startTime = _rowObj.startTime;
    }
    return _startTime;
}

function saveRenewPopupValue(_obj){     //  保存续费信息;
    $.ajax({
        url : interfaceObj.renewInfoSubmitUrl,
        type : "POST",
        dataType : "JSON",
        contentType:"application/json",
        data:JSON.stringify(_obj),
        success: function(data){
            if(data.message.errorCode == "200"){
                warning("保存成功");
                hideDetailPopup($(".renewPopup"));  // 隐藏续费弹窗;
                gridObj.search(LONG_USER_DATA_OBJ);
            }else{
                warning("保存失败");
            }
        }
    });
}

function showDetailPopup(_dom){   //  显示弹窗;
    _dom.animate({
        right: "0"
    },500);
};

function hideDetailPopup(_dom){  //   隐藏弹窗
    _dom.animate({
        right: "-580px"
    },500);
};

function hidePopup(_closeDom,_popupDom){      //  新增、修改、续费关闭弹窗
    _closeDom.unbind("click");
    _closeDom.click(function(){
        _popupDom.animate({
            right:"-580px"
        },500);
    });
};

function tabChange(_tabDom,_formDom){    //   弹窗头部选项卡 切换
    _tabDom.click(function(){
        _tabDom.css({"background":"#eee","color":"#333"});
        $(this).css({"background":"#337ab7","color":"#fff"});
        var _index = $(this).index();
        _formDom.children("ul").hide();
        _formDom.children("ul").eq(_index).show();
    });
};


function warning(_txt){
    $(".warningContent").html(_txt);
    $(".warning").show();

    setTimeout(function(){
        $(".warning").hide();
        $(".warningContent").html("");
    },1000);
}

//  获取url后面的参数；
function getUrl(){
    var url=location.search;
    var num=url.indexOf("?");
    var theRequest=new Object();
    if(num!=-1){
        var str=url.substr(Number(num)+1);
        strs=str.split("&");
        for(var i=0,l=strs.length;i<l;i++){
            var urlArr =strs[i].split("=");
            theRequest[urlArr[0]]=(urlArr[1]);
        }
    }
    return theRequest;
}

//  自动补全的方法;
var parkAutoComplete = {
    setParkNameFirst : function(_dataArr){              //   初始化页面赋值 input框为空时，默认有权限的第一个车场;
        var _name = $('.parkName').val();
        if(_name == ""){
            var _id = _dataArr[0].parkId;
            var _name1 = _dataArr[0].parkName;
            $(".parkName").val(_name1);
            $(".parkName").removeAttr("data-code");
            $(".parkName").attr("data-code",_id);
        }
    },

    blurFn : function(dataParkList){
        $(".parkName").blur(function(){
            var _doms = $(".autocomplete-suggestion");
            var _name = $(".parkName").val();
            parkAutoComplete.domsExist(dataParkList,_doms,_name);
        });
    },

    domsExist : function(dataParkList,_doms,_name){    //   第一步：先判断input内是否有值;
        if(_name != ""){                               //   _name有值时；
            parkAutoComplete.checkParkDoms(dataParkList,_doms,_name);
        }else{
            parkAutoComplete.setParkNameFirst(dataParkList);        // _name无值时, 赋值有权限的第一个车场;
        }
    },

    checkParkDoms : function(dataParkList,_doms,_name){
        if(_doms.length>0){                                          //   判断是否创建了匹配的车场dom节点;
            parkAutoComplete.checkParkName(_doms,_name);            //    存在，赋值
        }else{                                                      //    不存在时车场dom节点；
            for (var i = 0; i < dataParkList.length; i++) {
                if(_name == dataParkList[i].parkName){
                    $(".parkName").attr("data-code",dataParkList[i].parkId);
                    break;
                }
            }
            parkAutoComplete.setParkNameFirst(dataParkList);        //   不存在，赋值有权限的第一个车场;
        }
    },

    checkParkName : function(_doms,_name){
        for (var i = 0; i < _doms.length; i++) {
            var _domName = $(_doms[i]).text();
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
        $(".parkName").removeAttr("data-code");
        $(".parkName").attr("data-code",_id);
        $(".parkName").val(_text);
    }

}

