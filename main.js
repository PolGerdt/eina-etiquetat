'use strict'

// Import parts of electron to use
const { app, BrowserWindow, Menu, dialog } = require('electron')
const path = require('path')
const url = require('url')

// Import other modules
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let setApiKeyWindow

// Keep a reference for dev mode
let dev = false

if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
  dev = true
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true')
  app.commandLine.appendSwitch('force-device-scale-factor', '1')
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'Eina Etiquetat',
    show: false
  })

  // and load the index.html of the app.
  let indexPath

  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    })
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    })
  }

  mainWindow.loadURL(indexPath)

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()

    // Open the DevTools automatically if developing
    if (dev) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// Create a window to input the youtube data api key
function createSetApiKeyWindow() {

  setApiKeyWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Set YouTube API Key',
    parent: mainWindow,
    modal: true
  })

  setApiKeyWindow.setMenu(null)

  let indexPath = url.format({
    protocol: 'file:',
    pathname: path.join(__dirname, 'src', 'setYoutubeApiKey.html'),
    slashes: true
  })

  setApiKeyWindow.loadURL(indexPath)
}

// Create menu
const template = [
  {
    label: 'Project',
    submenu: [
      {
        label: 'New',
        click() {
          const options = {
            properties: ['openDirectory']
          }
          dialog.showOpenDialog(null, options, (directoryPaths) => {
            app.setPath('userData', directoryPaths[0])

            const projectDataPath = path.join(app.getPath('userData'), 'project_data')
            const downloadedVideosPath = path.join(app.getPath('userData'), 'downloaded_videos')

            fs.mkdirSync(projectDataPath)
            fs.mkdirSync(downloadedVideosPath)
            fs.mkdirSync(path.join(downloadedVideosPath, 'videos_full'))
            fs.mkdirSync(path.join(downloadedVideosPath, 'videos_segments'))

            let data = JSON.stringify({ test: true })

            fs.writeFileSync(path.join(projectDataPath, 'test.json'), data)
          })
        }
      },
      {
        label: 'Open',
        click() {

        }
      },
      {
        label: 'Save',
        click() {

        }
      }
    ]
  },
  {
    label: 'App Settings',
    submenu: [
      {
        label: 'Set Youtube Data API Key',
        click() {
          // Open Set Youtube Data API Key window
          createSetApiKeyWindow()
        }
      }
    ]
  }
]

if (dev) {
  template.push({
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  })
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)



