
var group_map = {};
var chatHub = $.connection.chatHub;
var chatProxy = $.connection.GroupChatHub;
$(document).ready(function () {
    
    $('<audio id="chatAudio"><source src="' + srp + 'images/notify.ogg" type="audio/ogg"><source src="' + srp + 'images/notify.mp3" type="audio/mpeg"><source src="' + srp + 'images/notify.wav" type="audio/wav"></audio>').appendTo('body');

    // Declare a proxy to reference the hub. 
    var chatHub = $.connection.chatHub;
    registerClientMethods(chatHub);
    // Start Hub
    $.connection.hub.start().done(function () {
        registerEvents(chatHub);
        //registerEvents_group(chatProxy);
    });

    $("#chat_min_button").click(function () {
        if ($(this).html() == "<i class=\"fa fa-minus-square\"></i>") {
            $(this).html("<i class=\"fa fa-plus-square\"></i>");
        }
        else {
            $(this).html("<i class=\"fa fa-minus-square\"></i>");
        }
        $("#chat_box").slideToggle();
        //$("#chat_box").append("<button type='button' class='btn btn-info btn-sm' data-toggle='modal' data-target='#myModal'>Create Group</button>");
        //$("#chat_box").append("<button type='button' class='btn btn-info btn-sm' data-toggle='modal' data-target='#myModal_new'>Join Group</button>");
    });
    $("#chat_box").append("<button type='button' class='btn btn-info btn-sm' data-toggle='modal' data-target='#myModal'>Create Group</button>");
    setInterval(ResetTypingFlag, 6000);
    //setInterval(function () { $('#chat_widnow').load('').fadeIn("slow"); }, 15000); // refreshing after every 15000 milliseconds
});


function registerEvents(chatHub) {
    var UserName = $("[id$=hdnCurrentUserName]").val();
    var UserID = parseInt($("[id$=hdnCurrentUserID]").val());
    chatHub.server.connect(UserName, UserID);

    //chatProxy.server.connect($("#spnName").text(), $("#connID").text(), $("#connID").text());
}



function registerClientMethods(chatHub) {
    // Calls when user successfully logged in
    chatHub.client.onConnected = function (id, userName, allUsers, messages, userid, login_status) {
        $('#hdId').val(id);
        $('#hdUserName').val(userName);

        // Add All Users
        //console.log("Adding User from on Connected")
        for (i = 0; i < allUsers.length; i++) {
            //AddUser(chatHub, allUsers[i].ConnectionId, allUsers[i].UserName, userid);
            
            AddUser(chatHub, allUsers[i].UserID, allUsers[i].UserName, userid, allUsers[i].loginStatus);
        }

        // Add Existing Messages
        for (i = 0; i < messages.length; i++) {
            AddMessage(messages[i].UserName, messages[i].Message);
        }

    }
}

// On New User Connected
chatHub.client.onNewUserConnected = function (id, name, userid, loginstatus, allUsers) {
    AddUser(chatHub, id, name, userid, loginstatus);
}

// On User Disconnected
chatHub.client.onUserDisconnected = function (id, userName) {
    temp_name = userName.split("-");
    $('#' + temp_name[1]).remove();
    var connectionid = $('#hdId').val();
    var status = "f";
    code = $('<a id="' + temp_name[1] + '" class="col-sm-12 bg-success" > <i class=\"fa fa-user\"></i> ' + temp_name[0] + ' ' + status + '<a>');
    $(code).dblclick(function () {
        var id = $(this).attr('id');
        if (connectionid != id) {
            OpenPrivateChatWindow(chatHub, id, temp_name[0]);
        }
    });
    $("#chat_box").append(code);
}

chatHub.client.messageReceived = function (userName, message) {
    AddMessage(userName, message);
    //var code = "<p>" + message + "</p>";
    //$("#chat_box").append(code);
}


chatHub.client.sendPrivateMessage = function (windowId, fromUserName, chatTitle, message) {
    var ctrId = 'private_' + windowId;
    if ($('#' + ctrId).length == 0) {
        createPrivateChatWindow(chatHub, windowId, ctrId, fromUserName, chatTitle);
        $('#chatAudio')[0].play();
    }
    else {
        var rType = CheckHiddenWindow();
        if ($('#' + ctrId).parent().css('display') == "none") {
            $('#' + ctrId).parent().parent().effect("shake", { times: 2 }, 1000);
            rType = true;
        }
        if (rType == true) {
            $('#chatAudio')[0].play();
        }
    }

    // To Be changed - Ravi 
    //$('#' + ctrId).chatbox("option", "boxManager").addMsg(fromUserName, message);
    //
    temp_fromUserName = fromUserName.split("-")
    $('#' + ctrId).chatbox("option", "boxManager").addMsg(temp_fromUserName[0], message);
    $('#typing_' + windowId).hide();
}
// Ravi

chatHub.client.sendGroupMessage = function (chatTitle, windowId, message, fromUserName) {
    //console.log("Send Group Message:", message);
    var ctrId = "group_" + windowId;
    if ($('#' + ctrId).length == 0) {
        //createPrivateChatWindow(chatHub, windowId, ctrId, fromUserName, chatTitle);
        createPrivateChatWindow(chatHub, ctrId, ctrId, fromUserName, chatTitle);
        $('#chatAudio')[0].play();
    }
    else {
        var rType = CheckHiddenWindow();
        if ($('#' + ctrId).parent().css('display') == "none") {
            $('#' + ctrId).parent().parent().effect("shake", { times: 2 }, 1000);
            rType = true;
        }
        if (rType == true) {
            $('#chatAudio')[0].play();
        }
    }

    // To Be changed - Ravi 
    //$('#' + ctrId).chatbox("option", "boxManager").addMsg(fromUserName, message);
    //
    temp_fromUserName = fromUserName.split("-")
    //console.log("sendGroupMessage 1:", temp_fromUserName[0]);
    //console.log("sendGroupMessage 2:", message);
    $('#' + ctrId).chatbox("option", "boxManager").addMsg(temp_fromUserName[0], message);
    $('#typing_' + windowId).hide();
}


// Testing



chatHub.client.receiveMessage = function (msgFrom, msg, senderid) {

    if (msgFrom == "NewConnection") {
        ////////console.log("msg:", msg);
        $("#usersCount").text(senderid);
        $('#divUsers').append('<li>' + msg + '</li>')
    }
    else if (msgFrom == "ChatHub") {
        ////////console.log("msg:", msg);
        $("#usersCount").text(senderid);
        $("#connID").text(msg);
    }
    else if (msgFrom == "RU") {
        ////////console.log("msg:", msg);
        var online = senderid.split('#');
        var length = online.length;
        for (var i = 0; i < length; i++) {
            $('#divUsers').append('<li>' + online[i] + '</li>')
        }

        $('#divChat').append('<li><strong>' + msgFrom
            + '</strong>:&nbsp;&nbsp;' + msg + '</li>')
    }
    else {
        ////////console.log("msg:", msg);
        $("#txtTo").val(senderid);
        $('#divChat').append('<li><strong>' + msgFrom
            + '</strong>:&nbsp;&nbsp;' + msg + '</li>')
    }
};

chatHub.client.GetLastMessages = function (TouserID, CurrentChatMessages) {
    //debugger;
    var ctrId = 'private_' + TouserID;

    var AllmsgHtml = "";
    for (i = 0; i < CurrentChatMessages.length; i++) {
        if (CurrentChatMessages[i].Message.includes("#")) {
            var array = CurrentChatMessages[i].Message.split("#");
            var fileName = array[1].split('\\');
            var msg = '<a href="' + array[1] + '">' + fileName[fileName.length - 1] + '</a>';
            CurrentChatMessages[i].Message = msg;


        }

        AllmsgHtml += "<div id='divChatWindow' style=\"display: block; max-width: 200px;\" class=\"ui-chatbox-msg\">";
        temp_username = CurrentChatMessages[i].FromUserName.split("-") //  Spliting for jsut username 
        if (i == CurrentChatMessages.length - 1) {
            
            if ($('#' + ctrId).children().last().html() != "<b>" + temp_username[0] + ": </b><span>" + CurrentChatMessages[i].Message + "</span>") {
                //console.log("&&&&&&&&" + CurrentChatMessages[i].FromUserName)
                
                AllmsgHtml += "<b>" + temp_username[0] + ": </b><span>" + CurrentChatMessages[i].Message + "</span>";
            }
        }
        else {
            //console.log("********"+CurrentChatMessages[i].FromUserName)
            AllmsgHtml += "<b>" + temp_username[0] + ": </b><span>" + CurrentChatMessages[i].Message + "</span>";
        }
        AllmsgHtml += "</div>";
    }
    $('#' + ctrId).prepend(AllmsgHtml);


}


chatHub.client.GetGroupLastMessages = function (TouserID, CurrentChatMessages) {
    //debugger;
    var TouserID = TouserID;
    //console.log("TouserID: " + TouserID);
    if (TouserID.includes("group_")) {
        //////console.log("in Get Messages - group");
        var ctrId = TouserID;
        ////console.log('Helo' + CurrentChatMessages[0].txt)
        var AllmsgHtml = "";
        for (i = 0; i < CurrentChatMessages.length; i++) {
            if (CurrentChatMessages[i].txt.includes("#")) {
                var array = CurrentChatMessages[i].txt.split("#");
                var fileName = array[1].split('\\');
                var msg = '<a href="' + array[1] + '">' + fileName[fileName.length - 1] + '</a>';
                CurrentChatMessages[i].txt = msg;


            }

            AllmsgHtml += "<div id='divChatWindow' style=\"display: block; max-width: 200px;\" class=\"ui-chatbox-msg\">";
            //console.log("$$$$$$$$$$$$$$" + CurrentChatMessages[0].txt + CurrentChatMessages[0].sender);
            temp_username = CurrentChatMessages[i].sender.split("-") //  Spliting for jsut username
            if (i == CurrentChatMessages.length - 1) {
                 
                if ($('#' + ctrId).children().last().html() != "<b>" + temp_username[0] + ": </b><span>" + CurrentChatMessages[i].txt + "</span>") {
                    AllmsgHtml += "<b>" + temp_username[0] + ": </b><span>" + CurrentChatMessages[i].txt + "</span>";
                }
            }
            else {
                AllmsgHtml += "<b>" + temp_username[0] + ": </b><span>" + CurrentChatMessages[i].txt + "</span>";
            }
            AllmsgHtml += "</div>";
        }
        $('#' + ctrId).prepend(AllmsgHtml);
    }

}
chatHub.client.sampleMessage = function (toUser, fromUser, fromUserid, groupid, groupName, msg) {
    ////console.log(" groupName" + groupName + "groupid" + groupid);
    //var sel = document.getElementById('join_groups');
    //var opt = document.createElement('option');
    //opt.appendChild(document.createTextNode(groupName));
    //opt.value = groupName;
    //sel.appendChild(opt);
    var connectionid = $('#hdId').val();
    code = $('<div id="' + groupName + '" class="col-sm-12 bg-success"  ><i class=\"fa fa-user\"></i> ' + groupName + '<div>');
    $("#chat_box").append(code);
    $(".mydiv").append(code);
    var id = groupid;
    //OpenPrivateChatWindow(chatHub, id, groupName);
    ////////console.log(" hdUsername--------------------" + $('#hdUserName').val());
    //chatHub.server.broadCastMessage($('#hdUserName').val(), msg, groupName);
    $(code).dblclick(function () {
        var id = $(this).attr('id');
        ////////console.log("samplemessghae:", id)
        if (connectionid != id) {
            ////////console.log("groupid ---id"+id)
            OpenPrivateChatWindow(chatHub, "group_" + id, groupName);
        }
    });
}



function sendtoGroup(groupName) {
    //console.log("SenttoGROUP:", groupName)
    chatHub.server.broadCastMessage($("#spnName").text(), $("#txtMsg").val(), groupName);
    $('#txtMsg').val('').focus();
}
function CheckHiddenWindow() {
    var hidden, state;

    if (typeof document.hidden !== "undefined") {
        state = "visibilityState";
    } else if (typeof document.mozHidden !== "undefined") {
        state = "mozVisibilityState";
    } else if (typeof document.msHidden !== "undefined") {
        state = "msVisibilityState";
    } else if (typeof document.webkitHidden !== "undefined") {
        state = "webkitVisibilityState";
    }

    if (document[state] == "hidden")
        return true;
    else
        return false;

}

function AddUser(chatHub, id, name, userid, loginstatus) {
    var currentuserid = parseInt($("[id$=hdnCurrentUserID]").val());
    var connectionid = $('#hdId').val();
    var code = "";
    if (connectionid == "") {
        if (userid == currentuserid) {
            $('#hdId').val(id);
            connectionid = id;
            $('#hdUserName').val(name);
        }
    }
    var temp_name = name.split("-")
    var status = "f";
    if (loginstatus == true) {
        status = "t"
    }
    if (connectionid != id) {
        if ($('#' + id).length == 0) {
            code = $('<a id="' + id + '" class="col-sm-12 bg-success" > <i class=\"fa fa-user\"></i> ' + temp_name[0] + ' ' + status + '<a>');    
            //code = $('<a id="' + id + '" class="col-sm-12 bg-success" > <i class=\"fa fa-user\"></i> ' + temp_name + ' ' + loginstatus + '<a>');    
            //if (loginstatus === true) {
            //    //console.log("Other logged in " + loginstatus)
            //    code = $('<a id="' + id + '" class="col-sm-12 bg-success" > <i class=\"fa fa-user\"></i> ' + name + '-' + loginstatus + '<a>');
            //} else {
            //    ////console.log("Else Other logged in " + loginstatus)
                
                
            //}

            $(code).dblclick(function () {
                var id = $(this).attr('id');
                if (connectionid != id) {
                    OpenPrivateChatWindow(chatHub, id, name);
                }
            });
        } else {
            $("#" + id).remove();
            //console.log("in id.length else part" + name + loginstatus)
            //code = $('<a id="' + id + '" class="col-sm-12 bg-success" > <i class=\"fa fa-user\"></i> ' + name + ' ' + loginstatus + '<a>');
            code = $('<a id="' + id + '" class="col-sm-12 bg-success" > <i class=\"fa fa-user\"></i> ' + temp_name[0] + ' ' + status + '<a>');
            $(code).dblclick(function () {
                var id = $(this).attr('id');
                if (connectionid != id) {
                    OpenPrivateChatWindow(chatHub, id, name);
                }
            });
        }
    }
    else {
        if ($('#curruser_' + id).length == 0) {

            //code = $('<div id="curruser_' + id + '" class="col-sm-12 bg-info"  ><i class=\"fa fa-user\"></i> ' + name + ' ' + loginstatus + '<div>');
            code = $('<div id="curruser_' + id + '" class="col-sm-12 bg-info"  ><i class=\"fa fa-user\"></i> ' + temp_name[0] + ' ' + status + '<div>');


        }
    }

    //file_image = $('<div><button type="button">Click Me!</button><div>');
    $("#chat_box").append(code);


    //$("#chat_box").append(file_image);
}


function AddUsertoGroup(chatHub, id, name, userid) {
    var currentuserid = parseInt($("[id$=hdnCurrentUserID]").val());
    ////////console.log("currentuserid:" + currentuserid);
    var connectionid = $('#hdId').val();
    ////////console.log("connectionid:" + connectionid);
    var code = "";
    if (connectionid == "") {
        if (userid == currentuserid) {
            $('#hdId').val(id);
            connectionid = id;
            $('#hdUserName').val(name);
        }
    }


    if (connectionid != id) {
        if ($('#' + id).length == 0) {
            code = $('<a id="' + id + '" class="col-sm-12 bg-success" > <i class=\"fa fa-user\"></i> ' + name + '<a>');
            $(code).dblclick(function () {
                var id = $(this).attr('id');
                if (connectionid != id) {
                    OpenPrivateChatWindow(chatHub, id, name);
                }
            });
        }
    }
    else {
        if ($('#curruser_' + id).length == 0) {
            code = $('<div id="curruser_' + id + '" class="col-sm-12 bg-info"  ><i class=\"fa fa-user\"></i> ' + name + '<div>');

        }
    }

    //file_image = $('<div><button type="button">Click Me!</button><div>');
    $("#chat_box").append(code);
    //$("#chat_box").append("<button id='btnSend' onclick='sendtoGroup()' >Send Message</button>");
    //$("#chat_box").append(file_image);
}

//function OpenPrivateChatWindow(chatHub, id, userName) {
//    var ctrId = 'private_' + id;
//    if ($('#' + ctrId).length > 0) return;
//    createPrivateChatWindow(chatHub, id, ctrId, userName, userName);
//}
function OpenPrivateChatWindow(chatHub, id, userName) {
    var ctrId = "";
    //////console.log("Username: " + userName + "  ID:"+ id)
    if (id.includes("group_")) {
        ctrId = id
        //////////console.log("crtd group_:" + ctrId);
    } else {
        ctrId = 'private_' + id;
    }

    if ($('#' + ctrId).length > 0) return;
    console.log("OpenPrivateChatWindow ID:", id );
    createPrivateChatWindow(chatHub, id, ctrId, userName, userName);

}

function createPrivateChatWindow(chatHub, userId, ctrId, userName, chatTitle) {
    console.log("createPrivateChatWindow userId:" + userId);
    temp_title = chatTitle.split("-");
    $("#chat_div").append("<div id=\"" + ctrId + "\"></div>")
    showList.push(ctrId);

    $('#' + ctrId).chatbox({
        id: ctrId,
        //title: chatTitle,
        title: temp_title[0],
        user: temp_title[0],
        offset: getNextOffset(),
        width: 200,
        messageSent: function (id, user, msg) {
            if (id.includes("group_")) {
                var group_name = id.split("_");
                //console.log("createPrivateChatWindow2 MSG:", group_name)
                chatHub.server.broadCastMessage($('#hdUserName').val(), msg, group_name[1])
            } else {
                //console.log("^^^^^^" + userId); 
                chatHub.server.sendPrivateMessage(userId, msg);
            }


            //chatHub.server.sendmessagetoall(userId, msg);
            TypingFlag = true;
        },
        boxClosed: function (removeid) {
            $('#' + removeid).remove();
            var idx = showList.indexOf(removeid);
            if (idx != -1) {
                showList.splice(idx, 1);
                diff = config.width + config.gap;
                for (var i = idx; i < showList.length; i++) {
                    offset = $("#" + showList[i]).chatbox("option", "offset");
                    $("#" + showList[i]).chatbox("option", "offset", offset - diff);
                }
            }
        }

    });

    $('#' + ctrId).siblings().css("position", "relative");
    $('#' + ctrId).siblings().append("<div id=\"typing_" + userId + "\" style=\"width:20px; height:20px; display:none; position:absolute; right:14px; top:8px\"><img height=\"20\" src=\"" + srp + "images/pencil.gif\" /></div>");
    $('#' + ctrId).siblings().append("<input type='file' id='fileUpload_" + userId + "' /> ");
    ////console.log("Sending UserId", userId);
    //$('#' + ctrId).siblings().append("<input type='button' id='btnUploadFile' value='Send' onclick='onUploadButton(" + userId + "," + ctrId + ")'/>");
    $('#' + ctrId).siblings().append("<input type='button' id='btnUploadFile' value='Send' onclick='onUploadButton(" + userId + "," + ctrId + ")'/>");
    $('#' + ctrId).siblings().find('textarea').on('input', function (e) {
        if (TypingFlag == true) {
            chatHub.server.sendUserTypingRequest(userId);
        }
        TypingFlag = false;
    });

    var FromUserID = parseInt($("[id$=hdnCurrentUserID]").val());
    var ToUserID = userId;
    //////console.log("For Last Messages:", ToUserID);
    if (ToUserID.includes("group_")) {
        //////console.log("Calling  RequestLastGroupMessage");
        //var group_name = ToUserID.split("_");
        chatHub.server.RequestLastGroupMessage(FromUserID, ToUserID);
    } else {
        chatHub.server.requestLastMessage(FromUserID, ToUserID);
    }

}

chatHub.client.ReceiveTypingRequest = function (userId) {
    var ctrId = 'private_' + userId;
    if ($('#' + ctrId).length > 0) {
        jQuery('#typing_' + userId).show();
        jQuery('#typing_' + userId).delay(6000).fadeOut("slow");
    }
}

// list of boxes shown on the page
var showList = new Array();
var config = {
    width: 200, //px
    gap: 20,
    maxBoxes: 5
};

var getNextOffset = function () {
    return (config.width + config.gap) * showList.length;
};

var TypingFlag = true;

function ResetTypingFlag() {
    TypingFlag = true;
}

function AddMessage(userName, message) {
    //////////console.log("Called Addmesssge from group");
    //$('#divChatWindow').append('<div class="message"><span class="userName">' + userName + '</span>: ' + message + '</div>');
    //var height = $('#divChatWindow')[0].scrollHeight;
    //$('#divChatWindow').scrollTop(height);
}

function saveFile() {
    ////////console.log("Clicked on save file");
    var firstName = $("#fileContainer").val();
    ////////console.log(firstName.files[0])
    localStorage.setItem("file", firstName)
}

function showfileName(userId, ctrId) {
    var x = document.getElementById('fileContainer');
    ////////console.log(x.files.length);
    if (x.files.length > 0) {
        ////////console.log("Inside length");
        getBase64(x.files[0], userId);

    }


}

function onUploadButton(userId, ctrId) {
    console.log("onUpload Button userID:", userId);
    var data = new FormData();
    var filename_v;
    
    if (typeof userId.id === 'undefined') {
        //console.log("Userid**********" + userId.id)
        var files = $("#fileUpload_" + userId).get(0).files;
    } else {
            var files = $("#fileUpload_" + userId.id).get(0).files;
        
    }
    
    // Add the uploaded image content to the form data collection
    ////console.log("Length of files", files.length)
    if (files.length > 0) {
        data.append("UploadedImage", files[0]);
        filename_v = files[0].filename;
        ////console.log(files[0])
    }

    var flag = false;

    if (typeof userId.id === 'undefined') {
        flag = false;
    } else {
            flag = true
    }


    // Make Ajax request with the contentType = false, and procesDate = false
    if (flag) {
        //console.log("File Upload UserID", userId.id)
        var group_name = userId.id.split("_");
        var ajaxRequest = $.ajax({
            type: "POST",
            url: "/api/FileUpload/UploadFile",
            contentType: false,
            processData: false,
            data: data
        });
        ajaxRequest.done(function (xhr, textStatus) {
            var f_tag = "#" + xhr.Value;
            //console.log("Group Name- AJAX CAll:" + group_name);
            chatHub.server.broadCastMessage($('#hdUserName').val(), f_tag, group_name[1]);
            //chatHub.server.broadCastMessage($('#hdUserName').val(), f_tag, group_name);
        });
        //$("#fileUpload").val('');
    } else {
        var ajaxRequest = $.ajax({
            type: "POST",
            url: "/api/FileUpload/UploadFile",
            contentType: false,
            processData: false,
            data: data
        });

        ajaxRequest.done(function (xhr, textStatus) {
            var f_tag = "#" + xhr.Value;
            chatHub.server.sendPrivateMessage(userId, f_tag);

        });
        //$("#fileUpload").val('');
    }
    //
    //files = '';
}

function btnUpload() {
    ////////console.log("Helloword")
    // Checking whether FormData is available in browser  
    if (window.FormData !== undefined) {
        ////////console.log("Inside Ajax function")
        var fileUpload = document.getElementById("FileUpload1").get(0);
        var files = fileUpload.files;

        // Create FormData object  
        var fileData = new FormData();

        // Looping over all files and add it to FormData object  
        for (var i = 0; i < files.length; i++) {
            fileData.append(files[i].name, files[i]);
            //////////console.log(files[i]);
        }

        // Adding one more key to FormData object  
        fileData.append('username', 'Manas');

        $.ajax({
            type: "POST",
            url: 'StartChat.aspx/UploadFiles',
            contentType: false, // Not to set any content header  
            processData: false, // Not to process data  
            data: fileData,
            dataType: "json",
            success: function (result) {
                alert(result.d);

            },
            error: function (err) {
                alert(err.statusText);
            }
        });
    } else {
        alert("FormData is not supported.");
    }
}