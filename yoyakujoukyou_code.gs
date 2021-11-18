function doGet() {
  // 表示したいHTMLのファイル名を指定(拡張子は不要)
  var t = HtmlService.createTemplateFromFile(“index”);
  t.msg = “”;
  //ページを開いた最初には”year”を入れておく。その時には現在時刻をJS側で求めて検索フィールドに入れる。
   t.myYear=”year”;
   t.myMonth=”month”;
  
  Logger.log(t.myYear);
  return t.evaluate();
}

//選択された施設名がeに入っている。それについての情報を返す
function doPost(e) {
  var myCal = CalendarApp.getCalendarById(‘カレンダーID’);
 //カレンダーIDでカレンダーを取得
  //12月を表示しようとするとエラーが起きる11月とそれ以外を分けて処理する
  var year = e.parameters.year.toString();
  var month = e.parameters.month.toString();
  var nextMonth;
  var nextYear;
  if (month ==12){
    nextMonth = 1;
    nextYear =Number(year) + 1;
    
  } else {
    nextMonth = Number(month) + 1;
    nextYear = year;
  }
  var startTimeString = year + “/” + month + “/1”  + “ 00:00:00 +0900”;
  var endTimeString = nextYear + “/” + nextMonth + “/1” + “ 00:00:00 +0900”;
  
  const startTime = new Date(startTimeString);
　const endTime = new Date(endTimeString);
   
  const events = myCal.getEvents(startTime, endTime);
 
 var msg=””;
  
  var t = HtmlService.createTemplateFromFile(“index”);
  t.myYear = year;
  t.myMonth = month;
  t.msg=events;//htmlのmsgにカレンダーの内容を渡す
  return t.evaluate();//元の画面に戻る
}

//カレンダーイベントの内容を返す
function getCalendarEvents(year,month,location) {
  var myCal = CalendarApp.getCalendarById(‘カレンダーID’); 
  //カレンダーIDでカレンダーを取得
  Logger.log(year + “/” + month + “:” + location);

  var nextMonth;
  var nextYear;
   if (month ==12){
    nextMonth = 1;
    nextYear =Number(year) + 1;
    
  } else {
    nextMonth = Number(month) + 1;
    nextYear = year;
  }
  
  var startTimeString = year + “/” + month + “/1”  + “ 00:00:00 +0900”;
  var endTimeString = nextYear + “/” + nextMonth + “/1” + “ 00:00:00 +0900”;
  
  const startTime = new Date(startTimeString);
  const endTime = new Date(endTimeString);
  Logger.log(startTime + “:” + endTime);
  var returncalEvents = myCal.getEvents(startTime, endTime);
  
  var calDataArray = [];
  for (var i = 0 ; i<returncalEvents.length; i++){
    var startTimeFormat = Utilities.formatDate(returncalEvents[i].getStartTime(), ‘Asia/Tokyo’, ‘yyyy-MM-dd HH:mm:ss’);//配列に入れるために文字列整形
    var endTimeFormat = Utilities.formatDate(returncalEvents[i].getEndTime(), ‘Asia/Tokyo’, ‘yyyy-MM-dd HH:mm:ss’);
    calDataArray[i] = [returncalEvents[i].getTitle(),returncalEvents[i].getLocation(),startTimeFormat,endTimeFormat];
  }
  return calDataArray;
}

//施設のリストを取得してhtmlのJavaScriptに返す
function getFacilitiesList(){
  var ssId = ‘スプレッドシートのSSID’;// SSIDからスプレッドシートの取得
  var ss = SpreadsheetApp.openById(ssId);

  var sheet = ss.getSheetByName(‘施設一覧’);//シート名からシートを取得
  var returnArray = sheet.getDataRange().getValues();
  
  Logger.log(returnArray);
  return returnArray;
}