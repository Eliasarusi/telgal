const TelegramBot = require('node-telegram-bot-api');
const https = require('https');

const token = '6282905819:AAHSCHrkkqPMWgU1lLhg4ufMW7QzqjxABwg';
const bot = new TelegramBot(token, { polling: true });

const links = new Map();
const linksSent = new Map();
const sentMessage = new Map();
const accessList = new Set();
const adminList = new Set();
const commands = [];

// Add the administrator to the admin list
adminList.add("elroy_katz");
adminList.add("sashelim");
adminList.forEach(admin => accessList.add(admin));

bot.onText(/\/add/, (msg) => {
  const chatId = msg.chat.id;
  const linksArr = msg.text.split(' ');
  linksArr.shift();
  if (!linksArr.length) {
    bot.sendMessage(chatId, 'נא לספק קישור.');
    bot.once('message', (msg) => {
      const chatId = msg.chat.id;
      const link = msg.text;
      if (!links.has(chatId)) {
        links.set(chatId, []);
      }
      https.get(link, (res) => {
        const cert = res.socket.getPeerCertificate();
        if (res.statusCode !== 200) {
          bot.sendMessage(chatId, `שגיאה: ${res.statusCode}`);
        } else {
          links.get(chatId).push(link);
          bot.sendMessage(chatId, `קישור נוסף: ${link}`);
          console.log(links);
        }
      });
    });
    return;
  }
  linksArr.forEach(link => {
    if (!links.has(chatId)) {
      links.set(chatId, []);
    }
    https.get(link, (res) => {
      const cert = res.socket.getPeerCertificate()
      if (res.statusCode !== 200) {
        bot.sendMessage(chatId, `Error: ${res.statusCode}`);
      } else {
        links.get(chatId).push(link);
        bot.sendMessage(chatId, `Link added: ${link}`);
        console.log(links);
      }
    });
  });
});

bot.onText(/\/links_debugs/, (msg) => {
  const chatId = msg.chat.id;
  if (!adminList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
    return;
  }
  else {
    console.log(links);
  }
});

bot.onText(/\/links_this_chetid_debugs/, (msg) => {
  const chatId = msg.chat.id;
  if (!adminList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
    return;
  }
  else {
    console.log(links.get(chatId).length);
  }
});


bot.onText(/\/show/, (msg) => {
  const chatId = msg.chat.id;
  if (!accessList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
    return;
  }
  if (!links.has(chatId) || links.get(chatId).length == 0) {
    bot.sendMessage(chatId, 'לא נוספו קישורים עדיין.');
  } else {
    const userLinks = links.get(chatId);
    bot.sendMessage(chatId, `קישורים שנמצאים במעקב: \n${userLinks.join('\n')}`);
  } 
});

bot.onText(/\/delete/, (msg) => {
  const chatId = msg.chat.id;
  const linkToDelete = msg.text.split(' ')[1];
  if (!linkToDelete) {
    bot.sendMessage(chatId, 'נא לספק קישור.');
    bot.once('message', (msg) => {
      const chatId = msg.chat.id;
      const linkToDelete = msg.text;
      if (!accessList.has(msg.from.username)) {
        bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
      }
      else if (!links.has(chatId)) {
        bot.sendMessage(chatId, 'אין קישורים במעקב כרגע.');
      } else {
        if (!links.get(chatId).includes(linkToDelete)) {
          bot.sendMessage(chatId, `הקישור ${linkToDelete} לא נמצא.`);
        } else {
          links.get(chatId).splice(links.get(chatId).indexOf(linkToDelete), 1);
          bot.sendMessage(chatId, `הקישור ${linkToDelete} נמחק.`)
          sentMessage.delete(linkToDelete);
          if (links.get(chatId).length === 0) {
            links.delete(chatId);
          }
        }
      }
    });
    return;
  }
  if (!accessList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'נא לספק קישור.');
  }
  else if (!links.has(chatId)) {
    bot.sendMessage(chatId, 'אין קישורים במעקב כרגע.');
  } else {
    if (!links.get(chatId).includes(linkToDelete)) {
      bot.sendMessage(chatId, `הקישור ${linkToDelete} לא נמצא.`);
    } else {
      links.get(chatId).splice(links.get(chatId).indexOf(linkToDelete), 1);
      bot.sendMessage(chatId, `הקישור ${linkToDelete} נמחק.`)
      sentMessage.delete(linkToDelete);
      if (links.get(chatId).length === 0) {
        links.delete(chatId);
      }
    }
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const commandsList = [
    '/add - הוסף קישור למעקב',
    '/show - הצג את רשימת הקישורים שנמצאים במעקב',
    '/delete - מחק קישור מרשימת הקישורים שנמצאים במעקב'
  ];

  if (adminList.has(msg.from.username)) {
    commandsList.push('/access_add - הוסף גישה למשתמש חדש');
    commandsList.push('/remove_access - הסר גישה של משתמש');
    commandsList.push('/admin_add - הפוך משתמש למנהל');
    commandsList.push('/remove_admin - מחק את יכולת הניהול של משתמש');
    commandsList.push('/shutdown - עצור את פעולת הבוט');
    commandsList.push('/admins - הצג רשימה של כל המנהלים של הבוט');
    commandsList.push('/users - הצג רשימה של כל המשתמשים בעלי גישה לבוט');
    commandsList.push('/links_debugs - הדפסת המפה links בקונסולה');
    commandsList.push('/links_this_chetid_debugs - הדפסת links של chatid נוכחי');
  }
  bot.sendMessage(chatId, `רשימת פקודות: \n${commandsList.join('\n')}`);
});

bot.onText(/\/access_add/, (msg) => {
  const chatId = msg.chat.id;
  if (!adminList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
    return;
  }
  const newUser = msg.text.split(' ')[1];
  if (!newUser) {
    bot.sendMessage(chatId, 'בבקשה ספק שם משתמש.');
    return;
  }
  accessList.add(newUser);
  bot.sendMessage(chatId, `גישה ניתנה ל ${newUser}.`);
});

bot.onText(/\/remove_access/, (msg) => {
  const chatId = msg.chat.id;
  if (!adminList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
    return;
  }
  const userToRemove = msg.text.split(' ')[1];
  if (!userToRemove) {
    bot.sendMessage(chatId, 'בבקשה ספק שם משתמש.');
    return;
  }
  if (!accessList.has(userToRemove)) {
    bot.sendMessage(chatId, `${userToRemove} אינו נמצא ברשימת הגישה לבוט.`);
  } else {
    accessList.delete(userToRemove);
    bot.sendMessage(chatId, `הגישה של ${userToRemove} הוסרה.`);
  }
});

bot.onText(/\/admin_add/, (msg) => {
  const chatId = msg.chat.id;
  if (!adminList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
    return;
  }
  const newAdmin = msg.text.split(' ')[1];
  if (!newAdmin) {
    bot.sendMessage(chatId, 'בבקשה ספק שם משתמש.');
    return;
  }
  adminList.add(newAdmin);
  bot.sendMessage(chatId, `${newAdmin} קיבל גישה לניהול הבוט.`);
});

bot.onText(/\/remove_admin/, (msg) => {
  const chatId = msg.chat.id;
  if (!adminList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
    return;
  }
  const adminToRemove = msg.text.split(' ')[1];
  if (!adminToRemove) {
    bot.sendMessage(chatId, 'בבקשה ספק שם משתמש.');
    return;
  }
  if (!adminList.has(adminToRemove)) {
    bot.sendMessage(chatId, `${adminToRemove} אינו מנהל.`);
  } else {
    adminList.delete(adminToRemove);
    bot.sendMessage(chatId, `יכולת הניהול של ${adminToRemove} הוסרה.`);
  }
});

bot.onText(/\/shutdown/, (msg) => {
  const chatId = msg.chat.id;
  if (!adminList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
    return;
  }
  else {
    bot.sendMessage(chatId, 'עוצר את הבוט...');
    bot.stopPolling();
  }
});

bot.onText(/\/admins/, (msg) => {
  const chatId = msg.chat.id;
  if (!adminList.has(msg.from.username)) {
    bot.sendMessage(chatId, 'אין לך גישה לפקודה זו.');
    return;
  }
  if (adminList.size === 0) {
    bot.sendMessage(chatId, 'אין מנהלים כרגע.');
  } else {
    bot.sendMessage(chatId, `מנהלים: ${Array.from(adminList).join(', ')}`);
  }
});

bot.onText(/\/users/, (msg) => {
  if (!adminList.has(msg.from.username)) {
    return bot.sendMessage(msg.chat.id, 'אין לך גישה לפקודה זו.');
  }
  bot.sendMessage(msg.chat.id, `משתמשים בעלי גישה לבוט: \n ${Array.from(accessList).join('\n')}`);
});

bot.on('message', (msg) => {
  if (msg.text.startsWith('/')) {
    const command = msg.text.split(' ')[0];
    commands.push('/add')
    commands.push('/access_add')
    commands.push('/delete')
    commands.push('/show')
    commands.push('/admin_add')
    commands.push('/remove_access')
    commands.push('/remove_admin')
    commands.push('/shutdown')
    commands.push('/admins')
    commands.push('/users')
    commands.push('/links_debugs')
    commands.push('/links_this_chetid_debugs')
    commands.push('/help')
    if (!commands.includes(command)) {
      bot.sendMessage(msg.chat.id, 'פקודה לא ידועה, בבקשה נסה שוב.');
    }
  }
});

setInterval(() => {
  links.forEach((userLinks, chatId) => {
    userLinks.forEach(link => {
      https.get(link, (res) => {
        res.on('data', (chunk) => {
          if (chunk.toString().includes('To join the CollaNote:') && !linksSent.get(link)) {
            bot.sendMessage(chatId, `נראה שכרגע יש מקום בגרסת הבטא של ${link}`);
            linksSent.set(link, true);
          } else if (chunk.toString().includes('This beta is full') && linksSent.get(link)) {
            bot.sendMessage(chatId, `המקום בקישור ${link} אינו קיים יותר`);
            linksSent.set(link, false);
          }
        });
        res.on('error', (err) => {
          console.error(err);
        });
      });
    });
  });
}, 3000);
Host git.nbots.ga
    Port 2222
    IdentityFile ~/.ssh/key
    User git