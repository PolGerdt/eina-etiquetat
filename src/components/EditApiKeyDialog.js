import './EditApiKeyDialog.css'

import React, { useState } from 'react'

import {
  Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, TextField, Button
} from '@material-ui/core'

export default function EditApiKeyDialog({ isOpen, onClose }) {

  const [tempApiKey, setTempApiKey] = useState('')

  return (
    <div className="EditApiKeyDialog">
      <Dialog open={isOpen}>
        <DialogTitle>Set Youtube Api Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To search for youtube videos yoyu need a Youtube Api Key.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Youtube Api key"
            type="text"
            fullWidth
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
    </div>
  )
}
