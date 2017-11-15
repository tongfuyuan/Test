function showhide(arr) {
    $("input[type=button]").hide();
    if(arr.button){
        var arrbb=arr.button.className;
        var arrb=arrbb.split(",");
        $.each(arrb,function (i,v) {
            $("."+v).show()
        })

    };
//        $("input[type=input]").hide();
//        if(arr.input){
//            var arrbb=arr.input.className;
//            var arrb=arrbb.split(",");
//            $.each(arrb,function (i,v) {
//                $("."+v).show()
//            })
//
//        }
}