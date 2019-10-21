var webSocket;

function init() {
    if (!window.WebSocket) {
        window.WebSocket = window.MozWebSocket;
    }
    if (window.WebSocket) {
        if (webSocket == null) {
            webSocket = new WebSocket("ws://hengsir.cn:8086/");
        }
        //打开webSokcet连接时，回调该函数
        webSocket.onopen = function (data) {
            console.log("onpen");
            getComment();
        }
        //接收到消息的回调方法
        webSocket.onmessage = function (event) {
            var str = event.data;
            var json = JSON.parse(str);
            //获取消息类型
            var type = json.type;
            var code = json.code;
            console.info("type :" + type);
            console.info("code :" + code);
            if (null != code && "" != code && "00" == code) {
                if (1 == type) {//如果是获取评论
                    var comments = json.comments;
                    console.log(comments);
                    for (var i = 0; i < comments.length; i++) {
                        var html = "";
                        html += '<div class="comment-li">'
                        html += '<b class="author">' + comments[i].author + ':</b>'
                        html += '</br>'
                        html += '<span class="text">' + comments[i].text + '</span>'
                        html += '</div>'
                        $("#add-flag").append(html)
                    }
                } else if (2 == type) {//如果是发布评论
                    window.location.reload();
                } else if (3 == type) {
                    if (Notification.permission === 'granted') {
                        for (var i = 0; i < 4; i++) {
                            var n = new Notification("文章有新留言", {
                                icon: 'favico.ico',
                                body: json.message
                            });

                            n.onshow = function () {
                                console.log('notification shows up');
                                //5秒后关闭消息框
                                setTimeout(function () {
                                    n.close();
                                }, 5000);
                            };
                        }
                    }
                }

            } else if (null != code && "" != code && "00" != code) {
                alert(json.message);
            }
        }
    }

//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function () {
        webSocket.close();
    }
}

//发送消息到服务端
function sendMessage(message) {
    webSocket.send(message);
}

/**
 * 评论
 *
 * @param text
 * @param author
 */
function toCommont(text, author) {
    var blogName = $("title").text();
    if (null == text || "" == text) {
        alert("评论内容不能为空")
        return;
    } else if (null == author || "" == author) {
        alert("您的大名还没写")
        return;
    } else {
        var json = {"type": 2, "text": text, "blogName": blogName, "author": author};
        var msg = JSON.stringify(json);
        sendMessage(msg);
    }
}

/**
 * 获取评论
 */
function getComment() {
    var blogName = $("title").text();
    var json = {"type": 1, "blogName": blogName};
    var msg = JSON.stringify(json);
    console.log("msg :" + msg);
    sendMessage(msg);
}

$(function () {
    init();

    $("#btn-comment").click(function () {
        $("#comment-form").removeClass("hide");
    })
    $("#close").click(function () {
        $("#comment-form").addClass("hide");
    })
    $("#submit").click(function () {

        toCommont($("#com-text").val(), $("#com-author").val());
    })
});