function doGet() {
  // 表示したいHTMLのファイル名を指定(拡張子は不要)
  return HtmlService.createTemplateFromFile(“index”).evaluate();
}

//========================================================================
//webページから送られた情報で登録作業
//========================================================================
function doPost(e) {
  var myCal = CalendarApp.getCalendarById(‘カレンダーID’); 
  //カレンダーIDでカレンダーを取得
  
  
  var ssId = ‘スプレッドシーtのSSID’;// SSIDからスプレッドシートの取得
   var lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(5000);
  } catch (e) {
    Logger.log(‘Could not obtain lock after 5 seconds.’);
    return “他の人が予約処理を実行しています。もう一度試してください”
  }
  
  var ss = SpreadsheetApp.openById(ssId);
  var sheet = ss.getSheetByName(“予約表”);// シート名からシートを取得  
  var lastRow = sheet.getLastRow();// シートの最終行を取得
  var evtStudnetID = e.parameter.userid;//学生　学籍番号
  var evtStudnetName = e.parameter.username;//学生　氏名
  var evtShisetu = e.parameter.shisetu;//施設名
  var evtJigen = e.parameter.time;//予約時限
  var evtTeacher = e.parameter.kyouin;//指導教員
  var evtDate = e.parameter.date;//予約希望日
  var mail = e.parameter.userid;//メールアドレス
  
   var evtStartTime = “9:00”;
   var evtEndTime = “10:30”;
   if(evtJigen == 1){
        var evtStartTime = “9:00”;
        var evtEndTime = “10:30”;
      }
      if(evtJigen == 2){
        var evtStartTime = “10:30”;
        var evtEndTime = “12:10”;
      }
      if(evtJigen == 3){
        var evtStartTime = “13:00”;
        var evtEndTime = “14:30”;
      }
      if(evtJigen == 4){
        var evtStartTime = “14:40”;
        var evtEndTime = “16:10”;
      }
      if(evtJigen == 5){
        var evtStartTime = “16:20”;
        var evtEndTime = “17:50”;
      }
 
  //施設の定員に収まっているかチェック
  var shisetuSheet = ss.getSheetByName(“施設一覧”);
  var shisetuData = shisetuSheet.getDataRange().getValues(); //シートデータを取得
  
   var teiinNumber;//施設の定員を入れるための変数
      
   for(var j=1;j<shisetuData.length;j++){
     shisetuData[j][0] = shisetuData[j][0].trim();//配列の空白文字列を削除する
   }
      
  //施設名を検索して施設の定員を求める。
  for(var j=1;j<shisetuData.length;j++){
      var shisetuName = shisetuData[j][0];
      var shisetuTeiinnNumber = shisetuData[j][1];
      if(shisetuName.trim() == evtShisetu.trim()){
          teiinNumber = shisetuTeiinnNumber;
       }
  }//施設名を元にして定員を求め終わり。teiinNumberに定員が入っているのでカレンダーでチェックする
  
  　//evtDateと時限からstarTimeとendTimeを求める
   //startTimeを求める。  入力によってsplitが-か/になるので注意。
   startTimeDay = evtDate.split(“/”);
   var year = startTimeDay[0];
   var month = startTimeDay[1]-1;
   var day = startTimeDay[2];
   console.log(year);

    startTimeArray = evtStartTime.split(“:”);
    var hour = startTimeArray[0];
    var min = startTimeArray[1];
    var startTime = new Date(year,month,day,hour,min,0);
      
    //endTimeを求める
    endTimeArray = evtEndTime.split(“:”);
    var hour = endTimeArray[0];
    var min = endTimeArray[1];
    var endTime = new Date(year,month,day,hour,min,0);

      
    //カレンダーを取得して予約件数を確認する
  const events = myCal.getEvents(startTime, endTime);
  var yoyakuNinzu = 0;
  //これから予約しようとしている施設の予約件数を確認する
  for(var i=0;i<events.length ;i++){
    calLoc = events[i].getLocation();
    if (calLoc.trim() == e.parameter.shisetu.trim()){
      yoyakuNinzu++;
    }
  }
  yoyakuNinzu++;//今の予約を考えてプラス１して人数のチェックをする
  if(yoyakuNinzu<=teiinNumber){//定員以下ならカレンダーに登録
    const option = {
     location: e.parameter.shisetu
 　 }
  var myEvt = myCal.createEvent( e.parameter.username　+”:” + evtStudnetID,startTime,endTime,option); //カレンダーにタスクをイベントとして追加
    
    var status = “OK”;
  } else {
   　　var status = “NG”;//定員がいっぱいで予約不可
  }
  // 最終行にデータ挿入
  sheet.appendRow([new Date(),e.parameter.userid,e.parameter.username,e.parameter.shisetu,e.parameter.time,e.parameter.kyouin,e.parameter.date,e.parameter.userid,status,teiinNumber,startTime,endTime,yoyakuNinzu]);
  
  //スプレッドシートをリフレッシュしてロック解除
  SpreadsheetApp.flush(); // applies all pending spreadsheet changes
  lock.releaseLock();
  
  return HtmlService.createTemplateFromFile(“index”).evaluate();//元の画面に戻る
 }
//========================================================================



function getData() {
  // 指定したシートからデータを取得
  var ssId = ‘スプレッドシートのSSID’;//スプレッドシートを取得
  var ss = SpreadsheetApp.openById(ssId);
  var sheet = ss.getSheetByName(‘予約表’);// シート名からシートを取得
  var values = sheet.getDataRange().getValues();
  return values;
}

//ユーザーの名前（loginしたメールアドレス)を取得して返す
function getmyName(e){
   var objUser = Session.getActiveUser();
   var name = objUser.getEmail();
  return name;
}

//施設のリストを取得してhtmlのJavaScriptに返す
function getFacilitiesList(){
  var ssId = ‘スプレッドシートのSSID’;//スプレッドシートを取得
  var ss = SpreadsheetApp.openById(ssId);
  var sheet = ss.getSheetByName(‘施設一覧’);//シート名からシートを取得
  var returnArray = sheet.getDataRange().getValues();
  
  Logger.log(returnArray);
  return returnArray;
}