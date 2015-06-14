javascript: (function() {
    var d = new Date();
    var threadIds = [];
    var threadTitle = [];
    var threadCounter = [];
    var count = 0;
    var start = Date.now();
    var myId;
    var alertText = "";
    $("body").empty();
    $("body").append("<table></table>");

    function getMyMessage(n, last, currentThread) {
        $.ajax({
            url: "https://www.yammer.com/api/v1/messages/in_thread/" + threadIds[currentThread] + ".json" + (last ? "?older_than=" + last : ""),
            dataType: "json",
            success: function(data) {
                console.log(currentThread + "/" + threadIds.length);
                var i;
                for (i = 0; i < data.messages.length; i++) {
                    d.setTime(Date.parse(data.messages[i].created_at));
                    var date = d.getDate();
                    d.setTime(Date.now());
                    if (data.messages[i].sender_id === myId && date === d.getDate()) {
                        count++;
                        threadCounter[currentThread]++;
                    }
                }
                if (date !== d.getDate()) {
                    n++;
                }
                if (n < 1) {
                    getMyMessage(0, data.messages[data.messages.length - 1].id, currentThread);
                } else if (currentThread < threadIds.length - 1) {
                    currentThread++;
                    getMyMessage(0, false, currentThread);
                } else {
                    var calcTime = (Date.now() - start) / 1000;
                    for (i = 0; i < threadCounter.length; i++) {
                        console.log(threadTitle[i] + "::" + threadCounter[i]);
                        alertText += threadTitle[i] + "::" + threadCounter[i] + "\n";
                    }
                    alert("total:" + count + "\n" + alertText + "time:" + calcTime);
                }
            },
            error: function() {
                getMyMessage(0, last, currentThread);
            }
        });
    }

    function get(url, n, last) {
        console.log("fetching thread ids...");
        $.ajax({
            url: url + (last ? "&older_than=" + last : ""),
            dataType: "json",
            success: function(data) {
                var i;
                var isFinalSearch = false;
                for (i = 0; i < data.messages.length; i++) {
                    if (data.threaded_extended[data.messages[i].thread_id].length > 0) {
                        d.setTime(Date.parse(data.threaded_extended[data.messages[i].thread_id][0].created_at));
                    }
                    var date = d.getDate();
                    d.setTime(Date.now());
                    if (date === d.getDate()) {
                        threadIds[threadIds.length] = data.messages[i].thread_id;
                        threadTitle.push(data.messages[i].content_excerpt.split("\n")[0]);
                        threadCounter.push(0);
                        $("table").append("<tr><td>%1</td></tr>".replace("%1", data.messages[i].content_excerpt.split("\n")[0]));
                        $("table").append("<tr><td>%1</td></tr>".replace("%1", date));
                    } else {
                        isFinalSearch = true;
                    }
                }
                if (!isFinalSearch && data.messages.length === 20) {
                    get(url, 0, data.threaded_extended[data.messages[data.messages.length - 1].thread_id][0].id);
                } else if (n === 1) {
                    getMyMessage(0, false, 0);
                }
            }
        });
    }
    $.ajax({
        url: "https://www.yammer.com/api/v1/users/current.json",
        success: function(data) {
            myId = data.id;
            get("https://www.yammer.com/api/v1/messages/inbox.json?filter=inbox_unseen", 0);
            get("https://www.yammer.com/api/v1/messages/inbox.json?filter=inbox_seen", 1);
        }
    });
})();
