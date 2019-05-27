import './App.css'

import React, { useState, useEffect } from 'react'

import StartScreen from './StartScreen'
import ProjectScreen from './ProjectScreen'
import EditProjectDialog from '../components/EditProjectDialog'
import EditApiKeyDialog from '../components/EditApiKeyDialog'
import ShortcutsDialog from '../components/ShortcutsDialog'

import TopBar from '../components/TopBar'

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

// Add some security with crypto js and AES. ! It is not really secure
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

    const projectConfig = projectDataDb.getData('/config')

    setProjectConfig(projectConfig)
    setProjectPath(newPath)
    setIsProjectOpen(true)
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
    fs.mkdirSync(path.join(projectConfig.projectPath, 'extracted_frames'))

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
        setIsApiKeyDialogOpen(true)
        break
      case 4:
        setIsOpenShortcutsDialog(true)
        break
    }
  }

  return (
    <div className="App">
      <TopBar
        title={projectConfig.name}
        onChangeScene={setCurrentWorkspace}
        disabledTabs={!isProjectOpen}
        onClickMenuItem={onClickMenuItem}
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
          /> :
          <StartScreen
            onClickNew={() => showProjectDialog(true)}
            onClickOpen={showOpenProjectDialog}
          />
      }
    </div>
  )
}
