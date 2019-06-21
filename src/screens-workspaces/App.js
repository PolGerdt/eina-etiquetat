import './App.css'

import React, { useState, useEffect } from 'react'

import StartScreen from './StartScreen'
import ProjectScreen from './ProjectScreen'
import EditProjectDialog from '../components/EditProjectDialog'
import EditApiKeyDialog from '../components/EditApiKeyDialog'
import ShortcutsDialog from '../components/ShortcutsDialog'

import TopBar from '../components/TopBar'

import { Paper } from '@material-ui/core'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import yellow from '@material-ui/core/colors/yellow'

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: { main: blue[500] },
    secondary: { main: yellow[500] },
  },
  typography: { useNextVariants: true }
})

const { app, dialog } = require('electron').remote
const fs = require('fs')
const path = require('path')
const JsonDB = require('node-json-db')

const CryptoJS = require("crypto-js")

let projectDataDb = undefined
let appConfigDb = new JsonDB(path.join(app.getPath('appData'), 'config-eina-etiquetat.json'), true, false)

let storedInitKey = ''

try {
  const storedInitKeyStr = appConfigDb.getData('/youtubeApiKey')
  const storedKeyBytes = CryptoJS.AES.decrypt(storedInitKeyStr.toString(), 'ThisIsN0tS3cr3t')
  storedInitKey = storedKeyBytes.toString(CryptoJS.enc.Utf8)
} catch (error) {
  appConfigDb.push('/youtubeApiKey', '')
}

// Add some security with crypto js and AES
// ! It is not very secure because someone could read the AES secret key from the source code
function useYoutubeApiKeyDb() {
  const [youtubeApiKey, setYoutubeApiKey] = useState(storedInitKey)

  useEffect(() => {
    const cipherKey = CryptoJS.AES.encrypt(youtubeApiKey, 'ThisIsN0tS3cr3t')
    appConfigDb.push('/youtubeApiKey', cipherKey.toString())
  }, [youtubeApiKey])

  return [youtubeApiKey, setYoutubeApiKey]
}

export default function App() {

  const [youtubeApiKeyDb, setYoutubeApiKeyDb] = useYoutubeApiKeyDb()

  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  function handleApiKeyDialogClose(result) {
    if (result) {
      setYoutubeApiKeyDb(result)
    }

    setIsApiKeyDialogOpen(false)
  }

  const [isProjectOpen, setIsProjectOpen] = useState(false)
  const [projectConfig, setProjectConfig] = useState({ name: '', labels: [] })
  const [projectPath, setProjectPath] = useState('')

  const [isOpenProjectDialog, setIsOpenProjectDialog] = useState(false)
  const [isProjectDialogForNew, setIsProjectDialogForNew] = useState(true)

  function showProjectDialog(isTypeNew) {
    setIsProjectDialogForNew(isTypeNew)

    setIsOpenProjectDialog(true)
  }

  function handleEditProjectDialogClose(config) {
    if (config) {
      if (isProjectDialogForNew) {
        createNewProject(config)
      } else {
        editProjectConfig(config)
      }
    }

    setIsOpenProjectDialog(false)
  }

  function openProjectFromPath(newPath) {
    const projectDataDb = new JsonDB(path.join(newPath, 'projectData.json'), true, false)

    try {
      const projectConfig = projectDataDb.getData('/config')
      setProjectConfig(projectConfig)
      setProjectPath(newPath)
      setIsProjectOpen(true)
    } catch (error) {
      // Not a project folder
    }
  }

  function editProjectConfig(projectConfig) {
    projectDataDb = new JsonDB(path.join(projectConfig.projectPath, 'projectData.json'), true, false)

    projectDataDb.push('/config', { name: projectConfig.projectName, labels: projectConfig.projectLabels })
    projectDataDb.push('/downloadedVideos', [])
    projectDataDb.push('/assignedLabels', [])

    openProjectFromPath(projectConfig.projectPath)
  }

  function createNewProject(projectConfig) {
    // Create project folders
    fs.mkdirSync(path.join(projectConfig.projectPath, 'videos_full'))
    fs.mkdirSync(path.join(projectConfig.projectPath, 'video_segments'))
    fs.mkdirSync(path.join(projectConfig.projectPath, 'extracted_fps_frames'))
    fs.mkdirSync(path.join(projectConfig.projectPath, 'extracted_n_frames'))
    fs.mkdirSync(path.join(projectConfig.projectPath, 'videos_full', 'thumbnails'))

    projectDataDb = new JsonDB(path.join(projectConfig.projectPath, 'projectData.json'), true, false)
    projectDataDb.push('/config', { name: projectConfig.projectName, labels: projectConfig.projectLabels })
    projectDataDb.push('/downloadedVideos', [])
    projectDataDb.push('/assignedLabels', [])

    openProjectFromPath(projectConfig.projectPath)
  }

  function showOpenProjectDialog() {
    const options = {
      properties: ['openDirectory']
    }
    dialog.showOpenDialog(null, options, (directoryPaths) => {
      if (directoryPaths) {
        openProjectFromPath(directoryPaths[0])
      }
    })
  }

  const [currentWorkspace, setCurrentWorkspace] = useState(0)

  const [isOpenShortcutsDialog, setIsOpenShortcutsDialog] = useState(false)

  const [isOpenStatsDialog, setIsOpenStatsDialog] = useState(false)

  function onClickMenuItem(item) {
    switch (item) {
      case 0:
        showProjectDialog(true)
        break
      case 1:
        showOpenProjectDialog()
        break
      case 2:
        showProjectDialog(false)
        break
      case 3:
        setIsOpenStatsDialog(true)
        break
      case 4:
        setIsApiKeyDialogOpen(true)
        break
      case 5:
        setIsOpenShortcutsDialog(true)
        break
    }
  }

  const [isWorking, setIsWorking] = useState(false)
  function onChangeWorkingState(state) {
    setIsWorking(state)
  }

  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <Paper square={true}>
          <TopBar
            title={projectConfig.name}
            onChangeScene={setCurrentWorkspace}
            disabledTabs={!isProjectOpen}
            onClickMenuItem={onClickMenuItem}
            isWorking={isWorking}
          />

          <EditApiKeyDialog
            isOpen={isApiKeyDialogOpen}
            onClose={handleApiKeyDialogClose}
            previousKey={youtubeApiKeyDb}
          />
          <EditProjectDialog
            isOpen={isOpenProjectDialog}
            onClose={handleEditProjectDialogClose}
            previousInfo={isProjectDialogForNew ? null : { projectConfig, path: projectPath }}
          />
          <ShortcutsDialog
            isOpen={isOpenShortcutsDialog}
            onClose={() => setIsOpenShortcutsDialog(false)}
          />

          {
            isProjectOpen ?
              <ProjectScreen
                youtubeApiKey={youtubeApiKeyDb}
                workspace={currentWorkspace}
                projectConfig={projectConfig}
                projectPath={projectPath}
                isShowingStatsDialog={isOpenStatsDialog}
                onCloseStatsDialog={() => setIsOpenStatsDialog(false)}
                onChangeWorkingState={onChangeWorkingState}
              /> :
              <StartScreen
                onClickNew={() => showProjectDialog(true)}
                onClickOpen={showOpenProjectDialog}
              />
          }
        </Paper>
      </div>
    </MuiThemeProvider>

  )
}
