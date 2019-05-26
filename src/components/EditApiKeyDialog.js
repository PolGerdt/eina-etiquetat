import './EditApiKeyDialog.css'

import React, { useState } from 'react'

import {
  Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, TextField, Button
} from '@material-ui/core'

const { app } = require('electron').remote
const path = require('path')

export default function EditApiKeyDialog({ isOpen, onClose, previousKey }) {

  const [tempApiKey, setTempApiKey] = useState(previousKey || '')

  return (
    <div className="EditApiKeyDialog">
      <Dialog open={isOpen}>
        <DialogTitle>Edit Youtube Api Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To search for youtube videos you need a Youtube Api Key.
          </DialogContentText>
          <DialogContentText color="error">
            ! Warning ! Keep in mind that it will be stored in this machine at: {path.join(app.getPath('appData'), 'config-eina-etiquetat.json')}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Youtube Api key"
            type="text"
            fullWidth
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => onClose(tempApiKey)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div >
  )
}
