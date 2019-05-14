import './NewProjectDialog.css'

import React, { useState } from 'react'

const { dialog } = require('electron').remote

export default function NewProjectDialog({ onFinishEdit }) {

  const [projectPath, setProjectPath] = useState('')
  function onClickFolder() {
    const options = {
      properties: ['openDirectory']
    }
    dialog.showOpenDialog(null, options, (directoryPaths) => {
      if (directoryPaths) setProjectPath(directoryPaths[0])
    })
  }

  const [projectName, setProjectName] = useState('')
  function onChangeProjectName(e) {
    setProjectName(e.target.value)
  }

  const [currentLabel, setCurrentLabel] = useState('')
  function onChangeLabel(e) {
    setCurrentLabel(e.target.value)
  }
  const [projectLabels, setProjectLabels] = useState([])
  function onClickAddLabel() {
    setProjectLabels(previous => [...previous, currentLabel])
    setCurrentLabel('')
  }

  function onSubmitProjectData(e) {
    e.preventDefault()

    if (projectPath) {
      onFinishEdit({ projectName, projectPath, projectLabels })
    }
  }

  return (
    <div className="NewProjectDialog">
      <form onSubmit={onSubmitProjectData}>
        <div>
          <button onClick={onClickFolder}>Select an empty folder</button>
          <p>{projectPath}</p>
        </div>

        <div>
          <label>
            Project name
            <input required type="text" onChange={onChangeProjectName}></input>
          </label>
        </div>

        <div>
          <p>Project Labels</p>
          <label>
            Add project label
            <input type="text" onChange={onChangeLabel} value={currentLabel}></input>
          </label>
          <button onClick={onClickAddLabel} type="button">Add</button>
          {
            projectLabels.map((label, i) => <p key={i}>{label}</p>)
          }
        </div>

        <button type="submit">SAVE</button>
      </form>
    </div>
  )
}
