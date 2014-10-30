// Config
var _myConfig = {
  subject: '返信メールのタイトル',
  address: 'admin@gmail.com', // 投稿が合った場合に通知するアドレス
  form: '', // 自動返信メールの送信元をgmailと連携をしている別のメールアドレスからにしたい時に設定
  name: ''  // 自動返信メールの送信者名を指定したい時に設定
};

// フォームの質問のタイトル
var _formLabels = {
  name: '名前',
  email: '連絡先'
};

// メール本文を作成して返す
function mailBodyTemplate(userName, msg) {
  var body = userName + '様 \n'
  + 'この度は回答有難うございます\n'
  + '以下のとおり受け付けいたしました。\n'
  + '------------------------------\n'
  + msg
  + '------------------------------\n\n'
  + '会社名\n'
  + 'info@exapmple.mailaddress';

  return body;
}

// メールを送信する
function sendMail(id, userName, userMail, msg) {
  Logger.log("%s %s %s %s", id, userName, userMail, msg);
  var subject = _myConfig.subject;
  var content;
  var option = {};

  if(_myConfig.form) {
    option.from = _myConfig.form;
  }
  if(_myConfig.name) {
    option.name = _myConfig.name;
  }

  content = '以下の内容でフォームが送信されました。\n\n' + msg;
  // Send Email to Admin
  try {
    GmailApp.sendEmail(_myConfig.address, subject, content, option);
  } catch (e) {
    Logger.log('Send mail to admin Error: ' + e.message);
    GmailApp.sendEmail(_myConfig.address, 'Error report', e.message);
  }

  // Send Email to User
  subject += '控え';
  content = mailBodyTemplate(userName, msg);
  try {
    GmailApp.sendEmail(userMail, subject, content, option);
  } catch (e) {
    Logger.log('Send mail to User Error: ' + e.message);
    try {
      GmailApp.sendEmail(_myConfig.addressm, 'Send mail to User Error', e.message + '\n' + content);
    } catch (err) {
      Logger.log('Send Error Report to admin Error: ' + err.message);
      GmailApp.sendEmail(_myConfig.address, 'Send Error Report Error', err.message + '\n' + content);
    }
  }
}

// onFormSubmitに Spredsheet フォーム送信時 のトリガーを登録する
function onFormSubmit(event) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("フォームの回答");
  var id = sheet.getLastRow() - 1;
  var userName = event.namedValues['名前'];
  var userMail = event.namedValues['連絡先'];
  var message = '予約番号: ' + id + '\n'
  + '名前: ' + userName + '\n'
  + '連絡先: ' + userMail + '\n'
  + 'メッセージ: \n' + event.namedValues['メッセージ'] + '\n';

  sendMail(id, userName, userMail, message);
}
