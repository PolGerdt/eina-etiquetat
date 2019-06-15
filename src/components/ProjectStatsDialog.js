import './ProjectStatsDialog.css'

import React, { useMemo } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Grid } from '@material-ui/core'

export default function ProjectStatsDialog({ onClose, isOpen, downloadedVideos, assignedLabels }) {

  const numDownloadedVideos = downloadedVideos.length

  // Create object with label names as keys and its total count 
  const numLabelsByName = useMemo(() => {
    return assignedLabels.reduce((acum, videoLabels) => {
      let newAcum = { ...acum }

      videoLabels.labels.forEach(label => {
        if (newAcum[label.labelName] === undefined) {
          newAcum = { ...newAcum, [label.labelName]: 1 }
        } else {
          newAcum = { ...newAcum, [label.labelName]: newAcum[label.labelName] + 1 }
        }
      })
      return newAcum
    }, {})
  }, [assignedLabels])

  return (
    <div className="ProjectStatsDialog">
      <Dialog
        open={isOpen}
        onClose={onClose}
      >
        <DialogTitle>Project Statistics</DialogTitle>

        <DialogContent>
          <Grid container spacing={16}>
            <Grid item>
              <List component="nav">
                <ListItemText primary="Downloaded videos" secondary={numDownloadedVideos} />
              </List>

            </Grid>

            <Grid item>
              <List component="nav">
                <ListItemText key={name} primary="Number of assigned labels" />
                {
                  Object.entries(numLabelsByName).map(([name, count]) =>
                    <ListItem key={name} >
                      <ListItemText primary={name} secondary={count} />
                    </ListItem>
                  )
                }
              </List>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="primary" autoFocus> Close </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
