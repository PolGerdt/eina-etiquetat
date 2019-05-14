import './App.css'

import React, { useState, useEffect } from 'react'

import StartScreen from './StartScreen'
import NewProjectDialog from '../components/NewProjectDialog'
import ProjectScreen from './ProjectScreen'


const { app, dialog } = require('electron').remote
const fs = require('fs')
const path = require('path')
const JsonDB = require('node-json-db')

let appConfigDb = new JsonDB(path.join(app.getPath('appData'), 'config-eina-etiquetat.json'), true, false)
appConfigDb.push('/youtubeApiKey', '') // !! needs key
let projectDataDb = null

function useYoutubeApiKeyDb(defaultState) {
  const [youtubeApiKey, setYoutubeApiKey] = useState(appConfigDb.getData('/youtubeApiKey') || defaultState)

  useEffect(() => {
    appConfigDb.push('/youtubeApiKey', youtubeApiKey)
  }, [youtubeApiKey])

  return [youtubeApiKey, setYoutubeApiKey]
}

export default function App() {

  const [isProjectSetup, setIsProjectSetup] = useState(false)

  const [isNewProjectDialog, setIsNewProjectDialog] = useState(false)

  function openNewProjectDialog() {
    setIsNewProjectDialog(true)
  }

  function createNewProject(projectConfig) {
    app.setPath('userData', projectConfig.projectPath)

    // Create project folders
    fs.mkdirSync(path.join(app.getPath('userData'), 'videos_full'))
    fs.mkdirSync(path.join(app.getPath('userData'), 'videos_segments'))

    projectDataDb = new JsonDB(path.join(projectConfig.projectPath, 'projectData.json'), true, false)
    projectDataDb.push('/config', { name: projectConfig.projectName, labels: projectConfig.projectLabels })
    projectDataDb.push('/downloadedVideos', [])
    projectDataDb.push('/lastLabelId', 0)
    projectDataDb.push('/assignedLabels', [])

    setIsProjectSetup(true)
    setIsNewProjectDialog(false)
  }

  function openProject() {
    const options = {
      properties: ['openDirectory']
    }
    dialog.showOpenDialog(null, options, (directoryPaths) => {
      if (directoryPaths) app.setPath('userData', directoryPaths[0])

      setIsProjectSetup(true)
    })
  }

  const [youtubeApiKey, setYoutubeApiKey] = useYoutubeApiKeyDb('')

  return (
    <div className="App">
      {
        isNewProjectDialog ?
          <NewProjectDialog onFinishEdit={createNewProject} /> :
          null
      }

      {
        isProjectSetup ?
          <ProjectScreen youtubeApiKey={youtubeApiKey} /> :
          <StartScreen onClickNew={openNewProjectDialog} onClickOpen={openProject} />
      }
    </div>
  )
}
