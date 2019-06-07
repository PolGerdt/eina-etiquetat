import './EditProjectDialog.css'

import React, { useState, useEffect } from 'react'

import {
  Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, TextField, Button, Typography,
  FormControl, InputLabel, Input, InputAdornment, IconButton, Chip
} from '@material-ui/core'

import AddCircleIcon from '@material-ui/icons/AddCircle'
import FolderIcon from '@material-ui/icons/Folder'

const { dialog } = require('electron').remote

export default function EditProjectDialog({ isOpen, onClose, previousInfo }) {

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

  function deleteLabel(labelName) {
    setProjectLabels(previous => previous.filter(label => label !== labelName))
  }

  function onClickSave() {
    if (projectPath) {
      onClose({ projectName, projectPath, projectLabels })
    }
  }

  function onClickCancel() {
    onClose(false)
  }

  useEffect(() => {
    if (previousInfo) {
      setProjectName(previousInfo.projectConfig.name)
      setProjectLabels(previousInfo.projectConfig.labels)
      setProjectPath(previousInfo.path)
    } else {
      setProjectName('')
      setProjectPath('')
      setProjectLabels([])
    }
  }, [previousInfo])

  return (
    <div className="EditProjectDialog">
      <Dialog open={isOpen}>
        <DialogTitle>Project settings</DialogTitle>
        <DialogContent>

          <DialogContentText>
            To start a project please enter a name, some initial labels (you can change them later) and a project folder.
            Keep in mind that you will need a Youtube Api Key setup in your app configuration to search videos.
          </DialogContentText>

          <TextField
            autoFocus
            margin="normal"
            label="Project Name"
            value={projectName}
            type="text"
            fullWidth
            required
            onChange={onChangeProjectName}
            variant="outlined"
          />

          <FormControl margin="normal" fullWidth>
            <InputLabel htmlFor="label">Label</InputLabel>
            <Input
              id="label"
              value={currentLabel}
              type="text"
              onChange={onChangeLabel}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={onClickAddLabel} color="secondary">
                    <AddCircleIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <FormControl margin="normal" fullWidth>
            <div>
              {
                projectLabels.map((label) =>
                  <Chip className="label-chip" key={label} label={label} onDelete={() => deleteLabel(label)} color="secondary" />
                )
              }
            </div>
          </FormControl>

          <FormControl margin="normal" fullWidth>
            <Button variant="contained" color="secondary" onClick={onClickFolder} fullWidth>
              <FolderIcon className="margin-right" />
              Select an empty folder
            </Button>
            <div className="folder-path">
              <Typography variant="body1" gutterBottom >Current folder:</Typography>
              <Typography variant="body1" gutterBottom color="secondary">{projectPath}</Typography>
            </div>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClickCancel} color="default" variant="contained"> Cancel </Button>
          <Button onClick={onClickSave} color="secondary" variant="contained"> Save </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
