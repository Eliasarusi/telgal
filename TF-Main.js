numOfLoadedFiles = 0;
chat_id = 1756006350;
manager_chet_id = null;
noDubleBot = 0;
var bot;
noDubleReference = 0;
const appTrackingList = [];
const accessList = [1756006350, 5002879340];
const appListWereWarned = [];
LastRequest = "Nothing";
var numOfLastMessage;
var dataPath;

function loadJS(FILE_URL, async = true) {
    // Load scripts
    let scriptEle = document.createElement("script");

    scriptEle.setAttribute("src", FILE_URL);
    scriptEle.setAttribute("type", "text/javascript");
    scriptEle.setAttribute("async", async);

    document.body.appendChild(scriptEle);

    // success event
    scriptEle.addEventListener("load", () => {
        console.log("File loaded");
        numOfLoadedFiles++;
        startRunning();
    });
    // error event
    scriptEle.addEventListener("error", (ev) => {
        console.log("Error on loading file", ev);
    });
}
loadJS("https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js", true); // jquery
loadJS("https://ip9uk39kv26rml8wjjruzg-on.drv.tw/jsbot.js", true);
loadJS("https://rawgit.com/krakenjs/fetch-robot/master/dist/fetch-robot.min.js", true);

function startRunning() {
    if (numOfLoadedFiles >= 3) {
        bot = new Bot("5787733822:AAGlBFZOZQ5UZObX0QQ_JNH_xjYxgKbZIhU", chat_id);
        checkNewInput();
        CheckForAvailability();
        console.log("Created by Elroi Katz");
    }
}

function SendNewMessage(massageBody) {
    bot.sendMessage(massageBody, chat_id, "Markdown", true)
        .then((res) => {
            console.log("Success!", res);
        })
        .catch((err) => console.log(err));
}

function checkNewInput() {
    $.getJSON("https://api.telegram.org/bot5787733822:AAGlBFZOZQ5UZObX0QQ_JNH_xjYxgKbZIhU/getUpdates", function (data) {
        numOfLastMessage = data.result.length;
        dataPath = data.result[parseInt(numOfLastMessage) - 1];
        if (dataPath != undefined) {
            var LastMessage = dataPath.message.text;
            if (dataPath.message.message_id != noDubleReference) {
                identifyCommands(LastMessage, data);
                noDubleReference = dataPath.message.message_id;
                console.log(dataPath.message.message_id);
                offsetUrl = "https://api.telegram.org/bot5787733822:AAGlBFZOZQ5UZObX0QQ_JNH_xjYxgKbZIhU/getUpdates?offset=" + dataPath.update_id;
                offsetXMLHttpRequest = new XMLHttpRequest();
                offsetXMLHttpRequest.open("GET", offsetUrl, false);
                offsetXMLHttpRequest.send();
                if (LastRequest == "Nothing") {
                    chat_id = parseInt(data.result[parseInt(numOfLastMessage) - 1].message.chat.id);
                }
                if (LastMessage == "/start") {
                    console.log(chat_id);
                }
            }
        }
        setTimeout(checkNewInput, 3000); //How often to check data (milliseconds)
        CheckForAvailability();
    });
}

function identifyCommands(LastMessage, lastData) {
    console.log("Reference");
    if (accessCheck() && lastData.result[parseInt(numOfLastMessage) - 1].message.chat.id == chat_id) {
        if (LastRequest == "Nothing") {
            if (LastMessage == "/help") {
                printHelp();
            } else if (LastMessage == "/add") {
                addNewApp();
            } else if (LastMessage == "/remove") {
                removeApp();
            } else if (LastMessage == "/show") {
                showList();
            } else if (LastMessage == "/manager") {
                manager();
            } else if (LastMessage == "/setManager") {
                //manager command
                if (manager_chet_id == chat_id) {
                    setManager();
                } else {
                    SendNewMessage("אופס! נראה שאין לך גישה לפקודה הזאת...");
                }
            } else if (LastMessage == "/addAccess") {
                //manager command
                if (manager_chet_id == chat_id) {
                    addAccess();
                } else {
                    SendNewMessage("אופס! נראה שאין לך גישה לפקודה הזאת...");
                }
            } else if (LastMessage == "/removeAccess") {
                //manager command
                if (manager_chet_id == chat_id) {
                    removeAccess();
                } else {
                    SendNewMessage("אופס! נראה שאין לך גישה לפקודה הזאת...");
                }
            } else if (LastMessage == "/showAccess") {
                //manager command
                if (manager_chet_id == chat_id) {
                    showAccess();
                } else {
                    SendNewMessage("אופס! נראה שאין לך גישה לפקודה הזאת...");
                }
            } else {
                SendNewMessage("לא הצלחתי להבין למה התכוונת... יש לנסות שוב");
            }
        } else if (LastRequest == "AppBetaLink") {
            if (LastMessage.includes("https://") == true) {
                appTrackingList.push(chat_id);
                appTrackingList.push(LastMessage);
                SendNewMessage("הקישור נוסף בהצלחה!");
                LastRequest = "Nothing";
            } else {
                SendNewMessage("הלינק שהוזן אינו תקין");
                LastRequest = "Nothing";
            }
        } else if (LastRequest == "AppRemoveLink") {
            if (LastMessage.includes("https://") == true) {
                const index = appTrackingList.indexOf(LastMessage);
                if (index > -1) {
                    appTrackingList.splice(index, 1);
                    appTrackingList.splice(index - 1, 1);
                    SendNewMessage("המעקב בוטל בהצלחה");
                    LastRequest = "Nothing";
                }
            } else {
                SendNewMessage("הלינק שהוזן אינו תקין");
                LastRequest = "Nothing";
            }
        } else if (LastRequest == "SetManager") {
            if (chetIdLegality(LastMessage)) {
                manager_chet_id = parseInt(LastMessage);
                SendNewMessage(LastMessage + " הוגדר בהצלחה כמנהל הבוט");
            } else {
                SendNewMessage("המספר שהוזן אינו חוקי... יש לבצע את הפקודה מחדש ולנסות שוב");
            }
            LastRequest = "Nothing";
        } else if (LastRequest == "AddAccess") {
            if (chetIdLegality(LastMessage)) {
                accessList.push(parseInt(LastMessage));
                SendNewMessage("כעת ניתן לגשת לבוט מ " + LastMessage);
            } else {
                SendNewMessage("המספר שהוזן אינו חוקי... יש לבצע את הפקודה מחדש ולנסות שוב");
            }
            LastRequest = "Nothing";
        } else if (LastRequest == "RemoveAccess") {
            if (chetIdLegality(LastMessage)) {
                if (accessList.indexOf(parseInt(LastMessage)) != -1) {
                    const index = accessList.indexOf(parseInt(LastMessage));
                    if (index > -1) {
                        accessList.splice(index, 1);
                        SendNewMessage("הגישה של " + LastMessage + " בוטלה בהצלחה");
                    }
                } else {
                    SendNewMessage("המספר הזה לא נמצא ברשימת הגישה");
                }
            } else {
                SendNewMessage("המספר שהוזן אינו חוקי... יש לבצע את הפקודה מחדש ולנסות שוב");
            }
            LastRequest = "Nothing";
        }
    }
}

function printHelp() {
    SendNewMessage(
        "זאת רשימת הפקודות שאני מסוגל לבצע: 1./help: קבלת עזרה 2./add: הוסף מעקב אחרי מקום פנוי בתוכנית בטא של אפליקציה 3./remove: הסר מעקב אחרי מקום פנוי בתוכנית בטא של אפליקציה 4./start: הפעל את הבוט" +
            " 5./show: הצג רשימה של כל הקישורים שנמצאים כרגע במעקב" +
            "6./manager: שליטה על ניהול הבוט"
    );
}

function addNewApp() {
    SendNewMessage("נא לשלוח קישור לתוכנית הבטא של האפליקציה.");
    LastRequest = "AppBetaLink";
}

function removeApp() {
    SendNewMessage("נא לשלוח קישור לתוכנית הבטא של האפלקציה שברצונך להסיר.");
    LastRequest = "AppRemoveLink";
}

function showList() {
    if (appTrackingList.length == 0) {
        SendNewMessage("אין תוכניות במעקב כרגע...");
    } else {
        var listToPrint = "";
        num = -1;
        for (const element of appTrackingList) {
            num++;
            if (num % 2 != 0) {
                listToPrint += element + " ";
            }
        }
        SendNewMessage("זאת רשימת הקישורים לתוכניות הבטא שנמצאות במעקב כרגע:" + listToPrint);
    }
}

function manager() {
    if (manager_chet_id == null) {
        manager_chet_id = chat_id;
        SendNewMessage("משתמש זה הוגדר בהצלחה כמנהל הבוט.");
    } else if (chat_id == manager_chet_id) {
        SendNewMessage(
            "כדי לשנות את מנהל הבוט יש לשלוח את הפקודה" + " /setManager." + "כדי להוסיף גישה למישהו יש לשלוח" + " /addAccess." + "כדי להסיר למישהו גישה יש לשלוח" + " /removeAccess." + "כדי להציג את רשימת הגישה אפשר לשלוח" + " /showAccess"
        );
    } else {
        SendNewMessage("אופס! נראה שאין לך גישה לניהול הבוט");
    }
}

function setManager() {
    SendNewMessage("יש להזין את ה-chat id של המשתמש שברצונך למנות למנהל");
    LastRequest = "SetManager";
}

function addAccess() {
    SendNewMessage("הוסף את ה-chat id של מי שתרצה לתת לו גישה");
    LastRequest = "AddAccess";
}

function removeAccess() {
    SendNewMessage("הוסף את ה-chat id של מי שתרצה להסיר לו גישה");
    LastRequest = "RemoveAccess";
}

function showAccess() {
    var listToPrint = "";
    for (const element of accessList) {
        listToPrint += element + ", ";
    }
    SendNewMessage("לכתובות ה-chat id הבאות יש גישה לבוט:" + listToPrint);
}

function accessCheck() {
    for (const element of accessList) {
        if (element == chat_id) {
            return true;
        }
    }
    return false;
}

function chetIdLegality(str) {
    if (str.replace(/[^0-9]/g, "").length > 5) {
        return true;
    } else return false;
}

function CheckForAvailability() {
    num = -1;
    for (const element of appTrackingList) {
        num++;
        if (num % 2 != 0) {
            loadXMLDoc(element);
        }
    }
}

function Availability(appUrl) {
    if (appListWereWarned.includes(appUrl) == false) {
        // If no warning was previously displayed
        const indexOfURL = accessList.indexOf(appUrl);
        if (indexOfURL > -1) {
            chat_id = accessList[indexOfURL - 1];
        }
        SendNewMessage("יש כרגע מקום בתוכנית הבטא של האפליקציה בקישור הבא:" + appUrl);
        appListWereWarned.push(appUrl);
    }
}

function NoAvailability(appUrl) {
    if (appListWereWarned.includes(appUrl)) {
        // If no warning was previously displayed
        appListWereWarned.splice(indexOf(appUrl));
        SendNewMessage("המקום בקישור הבא אינו זמין יותר:" + appUrl);
    }
}

function loadXMLDoc(theURL) {
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari, SeaMonkey
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (xmlhttp.responseText.includes("To join the CollaNote:") == true) {
                Availability(theURL);
            } else {
                NoAvailability(appUrl);
            }
        }
    };
    xmlhttp.open("GET", theURL, false);
    xmlhttp.send();
}
//https://testflight.apple.com/join/u6iogfd0
//https://testflight.apple.com/join/isSJVuXJ
