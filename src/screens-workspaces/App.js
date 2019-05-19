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

let projectDataDb = undefined
let appConfigDb = new JsonDB(path.join(app.getPath('appData'), 'config-eina-etiquetat.json'), true, false)
try {
  const storedYoutubeApiKey = appConfigDb.getData('/youtubeApiKey')
} catch (error) {
  appConfigDb.push('/youtubeApiKey', '')
}

function useYoutubeApiKeyDb(defaultState) {
  const [youtubeApiKey, setYoutubeApiKey] = useState(appConfigDb.getData('/youtubeApiKey') || defaultState)

  useEffect(() => {
    appConfigDb.push('/youtubeApiKey', youtubeApiKey)
  }, [youtubeApiKey])

  return [youtubeApiKey, setYoutubeApiKey]
}

export default function App() {

  const [youtubeApiKeyDb, setYoutubeApiKeyDb] = useYoutubeApiKeyDb('')

  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  function handleApiKeyDialogClose(result) {
    if (result) {
      setYoutubeApiKeyDb(result)
      openProjectFromUserData()
    }

    setIsApiKeyDialogOpen(false)
  }

  const [isProjectSetup, setIsProjectSetup] = useState(false)

  const [isEditProjectDialog, setIsEditProjectDialog] = useState(false)

  const [projectConfig, setProjectConfig] = useState({ name: '', labels: [] })

  function showEditProjectDialog() {
    setIsEditProjectDialog(true)
  }

  function handleEditProjectDialogClose(result) {
    if (result) {
      if (result.isEdit) {
        editProjectConfig(result.config)
      } else {
        createNewProject(result.config)
      }
    }

    setIsEditProjectDialog(false)
  }

  function openProjectFromUserData() {
    const projectDataDb = new JsonDB(path.join(app.getPath('userData'), 'projectData.json'), true, false)

    const projectConfig = projectDataDb.getData('/config')

    setProjectConfig(projectConfig)
    setIsProjectSetup(true)
  }

  function editProjectConfig(projectConfig) {
    app.setPath('userData', projectConfig.projectPath)

    projectDataDb = new JsonDB(path.join(projectConfig.projectPath, 'projectData.json'), true, false)
    projectDataDb.push('/config', { name: projectConfig.projectName, labels: projectConfig.projectLabels })
    projectDataDb.push('/downloadedVideos', [])
    projectDataDb.push('/assignedLabels', [])

    openProjectFromUserData()
  }

  function createNewProject(projectConfig) {
    app.setPath('userData', projectConfig.projectPath)

    // Create project folders
    fs.mkdirSync(path.join(projectConfig.projectPath, 'videos_full'))
    fs.mkdirSync(path.join(projectConfig.projectPath, 'videos_segments'))

    projectDataDb = new JsonDB(path.join(projectConfig.projectPath, 'projectData.json'), true, false)
    projectDataDb.push('/config', { name: projectConfig.projectName, labels: projectConfig.projectLabels })
    projectDataDb.push('/downloadedVideos', [])
    projectDataDb.push('/assignedLabels', [])

    openProjectFromUserData()
  }

  function showOpenProjectDialog() {
    const options = {
      properties: ['openDirectory']
    }
    dialog.showOpenDialog(null, options, (directoryPaths) => {
      if (directoryPaths) {
        app.setPath('userData', directoryPaths[0])

        openProjectFromUserData()
      }
    })
  }

  const [currentWorkspace, setCurrentWorkspace] = useState(0)

  const [isOpenShortcutsDialog, setIsOpenShortcutsDialog] = useState(false)

  function onClickMenuItem(item) {
    switch (item) {
      case 0:
        showEditProjectDialog()
        break
      case 1:
        showOpenProjectDialog()
        break
      case 2:
        showEditProjectDialog()
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
        disabledTabs={!isProjectSetup}
        onClickMenuItem={onClickMenuItem}
      />

      <EditApiKeyDialog isOpen={isApiKeyDialogOpen} onClose={handleApiKeyDialogClose} />
      <EditProjectDialog
        isOpen={isEditProjectDialog} onClose={handleEditProjectDialogClose}
        previousConfig={isProjectSetup ? { ...projectConfig, path: app.getPath('userData') } : null}
      />
      <ShortcutsDialog isOpen={isOpenShortcutsDialog} onClose={() => setIsOpenShortcutsDialog(false)} />

      {
        isProjectSetup ?
          <ProjectScreen youtubeApiKey={youtubeApiKeyDb} workspace={currentWorkspace} projectConfig={projectConfig} /> :
          <StartScreen onClickNew={showEditProjectDialog} onClickOpen={showOpenProjectDialog} />
      }
    </div>
  )
}
