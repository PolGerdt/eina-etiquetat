import './ShortcutsDialog.css'

import React from 'react'

import {
  Dialog, DialogTitle, DialogActions, DialogContent, Grid, Button, Divider,
  ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, List, ListItem, ListItemText
} from '@material-ui/core'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

export default function ShortcutsDialog({ isOpen, onClose }) {

  return (
    <div className="ShortcutsDialog">
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Shortcuts</DialogTitle>
        <DialogContent>
          <Grid container spacing={24}>
            <Grid item xs>
              <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Search workspace</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Select all videos"
                        secondary="Ctrl/Command + e"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Invert selection for all videos"
                        secondary="Ctrl/Command + d"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Search previous page of youtube results"
                        secondary="Ctrl/Command + Left Arrow"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Search next page of youtube results"
                        secondary="Ctrl/Command + Right Arrow"
                      />
                    </ListItem>
                  </List>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </Grid>
            <Grid item xs>
              <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Label workspace</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Video step backward"
                        secondary="Left Arrow"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Video step forward"
                        secondary="Right Arrow"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Video big step backward"
                        secondary="Ctrl/Command + Left Arrow"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Video big step forward"
                        secondary="Ctrl/Command + Right Arrow"
                      />
                    </ListItem>

                    <Divider />

                    <ListItem>
                      <ListItemText
                        primary="Open/Close label"
                        secondary="1-9"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Cancel open label"
                        secondary="Ctrl/Command + x"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Finish video labels"
                        secondary="Ctrl/Command + d"
                      />
                    </ListItem>
                  </List>
                </ExpansionPanelDetails>
              </ExpansionPanel>
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
