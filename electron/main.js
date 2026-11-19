const {app,BrowserWindow,shell}=require('electron');const path=require('path');
function create(){const w=new BrowserWindow({width:520,height:880,minWidth:380,backgroundColor:'#05060d',autoHideMenuBar:true,webPreferences:{contextIsolation:true,sandbox:true}});
 w.loadFile(path.join(__dirname,'..','www','index.html'));
 w.webContents.setWindowOpenHandler(({url})=>{shell.openExternal(url);return{action:'deny'};});}
app.whenReady().then(()=>{create();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)create();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
