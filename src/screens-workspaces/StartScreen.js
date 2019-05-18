import './StartScreen.css'

import React from 'react'

import { Card, CardActionArea, CardContent, Typography, Grid } from '@material-ui/core'
import NoteAddIcon from '@material-ui/icons/NoteAdd'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'

export default function StartScreen({ onClickNew, onClickOpen }) {

  return (
    <div className="StartScreen">
      <Grid container justify="center" spacing={16}>
        <Grid item>
          <Card>
            <CardActionArea onClick={onClickNew}>
              <div className="card-icon-container">
                <NoteAddIcon fontSize="large" />
              </div>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2"> New Project </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item>
          <Card>
            <CardActionArea onClick={onClickOpen}>
              <div className="card-icon-container">
                <FolderOpenIcon fontSize="large" />
              </div>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2"> Open Project </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
