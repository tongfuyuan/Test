/**
 *  @author: zyx;
 *  @time:   2017-06-12;
 *  @content:  长期用户维护 新增、修改弹窗js逻辑;
 *
 */
// var popupObj = {"message":{"errorCode":"200","errorDsc":"success!"},"resultObj":[{"itemList":[{"columnId":"companyCode","columnName":"分公司","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"select"},{"columnId":"parkId","columnName":"停车场","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"T","showType":"select"},{"columnId":"userName","columnName":"用户名","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"T","showType":"input"},{"columnId":"cardCode","columnName":"卡号","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"input"},{"columnId":"licensePlateNumber","columnName":"车牌号","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"T","showType":"plateNoInput"},{"columnId":"parkingSpaceNumber","columnName":"车位数","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"T","showType":"input"},{"columnId":"isFixed","columnName":"是否固定车位","dataSource":"[{\"value\":\"0\",\"label\":\"否\"},{\"value\":\"1\",\"label\":\"是\"}]","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"select"},{"columnId":"chargeRuleId","columnName":"长期收费规则","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"T","showType":"select"},{"columnId":"userPropertiy","columnName":"用户属性","dataSource":"[{\"value\":\"00\",\"label\":\"个人用户\"},{\"value\":\"01\",\"label\":\"单位用户\"}]","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"select"},{"columnId":"carLabel","columnName":"车辆品牌","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"input"},{"columnId":"carColor","columnName":"车辆颜色","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"input"},{"columnId":"carStyleid","columnName":"车辆类型","dataSource":"[{\"value\":\"0\",\"label\":\"未知\"},{\"value\":\"1\",\"label\":\"小型车\"},{\"value\":\"2\",\"label\":\"中型车\"},{\"value\":\"3\",\"label\":\"大型车\"}]","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"select"},{"columnId":"userTel","columnName":"联系电话","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"input"},{"columnId":"balance","columnName":"余额","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"input"},{"columnId":"userAddress","columnName":"联系地址","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"textarea"},{"columnId":"remarks1","columnName":"备注说明","dataSource":"","functionName":"","isEnabledInsert":"T","isEnabledUpdate":"T","isNecessary":"F","showType":"textarea"}],"tabDesc":"用户信息"}]};
var cookie = getCookie("UID");

var form = {
    init : function(){
          
    }
};

form.view = {
   options : {
       class : "popupForm"
   },

   createFormTag : function(_arr,formId,afterId){
      var options = this.options;
      var formListArr = _arr;        //  获取表单数据；
      form.view.createForm(formListArr,formId,options,afterId);     //  创建表单元素;
   },

   createForm : function(formListArr,formId,options,afterId){       //  创建form表单;
      var _formTab = $("<ul>",{class:options.class+"Tab "+options.class+"Tab"+afterId});          //  创建选项卡
      var _formList = $("<div>",{class:options.class+"List "+options.class+"List"+afterId});       //  创建表单容器;
      $.each(formListArr,function(i,v){
         var _tabLi = $("<li>",{text:v.tabDesc});
         var _formUl = $("<ul>",{class:options.class+"List"+i+" "+options.class+"List"+i+afterId}); 
         var _listArr = v.itemList;
         form.view.createTags(_listArr,_formUl,options,afterId);    //   创建设置板块;

         _formTab.append(_tabLi);
         _formList.append(_formUl);
         $("#"+formId).append(_formTab);
         $("#"+formId).append(_formList);
      });
   },

   createTags : function(_listArr,_formUl,options,afterId){
      if(_listArr && _listArr !="" && _listArr != undefined){
          $.each(_listArr,function(k,item){
              var _tagType = item.showType;   //  标签类型;
              var _li = $("<li>",{class:options.class+"ListLi"+item.isNecessary+" "+options.class+"ListLi"+afterId+" "+item.columnId+"Form"});   //   li容器
              var _label = $("<label>",{text:item.columnName});   //  label标签
              var _tag = eval("(form.view.extendFunction."+_tagType+"("+JSON.stringify(afterId)+","+JSON.stringify(item)+"))");
              _li.append(_label);
              _li.append(_tag);
              _formUl.append(_li);
          })
      }else{
        return false;
      }
      return _formUl;
   },

   extendFunction : {
       input : function(afterId,item){        //  input框;
          var _input;
          if(item.columnId == "balance"){
              _input = $("<input>",{id:item.columnId+afterId,class:"necessary"+item.isNecessary,type:"text",value:"0"});
          }else{
              _input = $("<input>",{id:item.columnId+afterId,class:"necessary"+item.isNecessary,type:"text"});
          };
          return _input;
       },

       select : function(afterId,item){       //  下拉框;
          var _select = $("<select>",{id:item.columnId+afterId,class:"necessary"+item.isNecessary});
          if(item.dataSource && item.dataSource != ""){
              var _arr = JSON.parse(item.dataSource);
              $.each(_arr,function(n,val){
                 $("<option>",{value:val.value,text:val.label}).appendTo(_select)
              });
          }
          return _select;
       },

       textarea : function(afterId,item){
          // var  _p = $("<p>");
          // var _span = $("<span>",{id:"text-count",class:"necessary"+item.isNecessary});
          var _textarea = $("<textarea>",{id:item.columnId+afterId,class:"necessary"+item.isNecessary});
          return _textarea;
       },
       // textarea2 : function(afterId,item){
       //    var _div = $("<div>",{id:item.columnId+afterId});
       //    var _textarea = $("<textarea>",{id:item.columnId+afterId,class:"necessary"+item.isNecessary});
       //    var  _p = $("<p>");
       //    var _span = $("<span>",{id:"text-count",class:"necessary"+item.isNecessary});
       //    _p.append(_span);
       //    _div.append(_p);
       //    _div.append(_span);
       // },       
       // p :function(afterId,item){
       //    var  _p = $("<p>");
       //    var _span = $("<span>",{id:"text-count",class:"necessary"+item.isNecessary});
       //    _p.append(_span);
       //    return _p;
       // },

       plateNoInput : function(afterId,item){
          var _div = $("<div>",{id:item.columnId+afterId});
          var _img1 = "<img class='addPlateNoBtn' src='../images/add.png'>";
          var _divContainer = $("<div>",{class:"plateNoInputList"});
          var _childDiv = $("<div>",{class:"inputDoms"});
          var _img2 = "<img class='plateNoDeleteBtn' src='../images/plateNoDelete.png'>";
          var _input = $("<input>",{class:item.columnId,type:"text",placeholder:"请输入车牌号"});
          
          _childDiv.append(_input);
          _childDiv.append(_img2);
          _divContainer.append(_childDiv);
          _div.append(_divContainer);
          _div.append(_img1);
          return _div;
       },

       time : function(afterId,item){
          return $("<input>",{id:item.columnId+afterId,class:"Wdate",type:"text"});
       },

       button : function(afterId,item){

          return $("<input>",{class:item.columnId+"Btn"+afterId,type:"button",value:item.columnName});
       },

       upFileBtn : function(afterId,item){
          var _formFileDiv = $("<div>",{class:"formFile"+afterId+"Div"});
          var _form = "<form id="+item.columnId+" action='/PortalParking/longuser/uploadImage.do' method='post' enctype='multipart/form-data' >"
                     +"<a href='javascript:void;' class='uploadButton'>"
                     + "<input type='file' name='upFile' class='upFileBtn "+item.columnId+"' >"+item.columnName+""
                     +"</a>"
                  + "</form>"
                  + "<h3>文件列表</h3>"
                  + "<ul class='uploadList'></ul>"
          _formFileDiv.append(_form);
          return _formFileDiv;        
       },

       checkbox : function(afterId,item){
          return $("<input>",{class:item.columnId+"Checkbox"+afterId,type:"checkbox"});
       },

       table : function(afterId,item){
          var _table = $('<table id="'+item.columnId+'"><thead><tr id="'+item.columnId+'Header"></tr></<thead><tbody></tbody></table>')
         
          return _table;
       },

       radio : function(afterId,item){        //   单选框;
          return;
       },

       hidden : function(afterId,item){
          return;
       }       
   },

   createCompany : function(_ARR){
       var _options = "";
       _options = "<option value=''>全部</option>";
       $.each(_ARR,function(i,value){
           _options += "<option data-name='companyName' value='"+value.companyId+"'>"+value.companyName+"</option>";
       });
       $("#companyCodeDetail").html(_options);       
   },

   createPark : function(_ARR){
       var _options = "";
       $.each(_ARR,function(i,value){
           _options += "<option data-name='parkName' value='"+value.parkId+"'>"+value.parkName+"</option>";
       });
       $("#parkIdDetail").html(_options);
   },

   createRules : function(_ARR){
       var _options = "";
       $.each(_ARR,function(i,value){
           _options += "<option data-name='chargeRuleName' value='"+value.ruleId+"'>"+value.chargeRuleName+"</option>";
       });
       $("#chargeRuleIdDetail").html(_options);
   }
};


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



