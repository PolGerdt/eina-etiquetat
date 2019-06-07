import './StartScreen.css'

import React from 'react'

import { Grid, Fab } from '@material-ui/core'
import NoteAddIcon from '@material-ui/icons/NoteAdd'
import FolderIcon from '@material-ui/icons/Folder'

export default function StartScreen({ onClickNew, onClickOpen }) {

  return (
    <div className="StartScreen">
      <Grid container justify="center" spacing={16}>
        <Grid item>
          <Fab variant="extended" color="secondary" onClick={onClickNew}>
            <NoteAddIcon fontSize="large" className="start-button" />
            New Project
          </Fab>
        </Grid>

        <Grid item>
          <Fab variant="extended" color="secondary" onClick={onClickOpen}>
            <FolderIcon fontSize="large" className="start-button" />
            Open Project
          </Fab>
        </Grid>
      </Grid>
    </div>
  )
}
