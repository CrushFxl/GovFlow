function changeTab(obj){
    let tabName = $(obj).attr("id").slice(0, -3);
    sessionStorage.setItem("tab", tabName);
    $(".dec").hide();
    $(".od_page").hide();
    $(".top_p").css("color", "#8F8F8F");
    $("#"+tabName+"Page").show();
    $(obj).children(".dec").show();
    $(obj).children(".top_p").css("color", "#C42A18");
    return tabName;
}

function changePage(obj){
    let pageName = $(obj).attr("id").slice(0, -3);
    sessionStorage.setItem("page", pageName);
    $(".page").hide();
    $("#"+pageName+"Page").show();
    $(".icon").attr("stroke","#3f3f3f");
    $(".ico_text").css("color", "#3f3f3f");
    $(obj).children("p").css("color","#C42A18");
    $(obj).children("svg").attr("stroke","#C42A18");
    $(obj).children("svg").attr("fill","#C42A18");
    return pageName;
}

/*点击返回按钮*/
$(document).on("click", "#back_btn", function () {history.back();});