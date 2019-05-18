import './SidePanel.css'

import React from 'react'

import { Paper } from '@material-ui/core'

export default function SidePanel({ children }) {
  return (
    <Paper className="SidePanel">
      {children}
    </Paper>
  )
}
