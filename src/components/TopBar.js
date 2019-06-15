import './TopBar.css'

import React, { useState } from 'react'

import MenuIcon from '@material-ui/icons/Menu'
import FolderIcon from '@material-ui/icons/Folder'
import NoteAddIcon from '@material-ui/icons/NoteAdd'
import SettingsIcon from '@material-ui/icons/Settings'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import PollIcon from '@material-ui/icons/Poll'
import KeyboardIcon from '@material-ui/icons/Keyboard'

import { AppBar, Toolbar, IconButton, Typography, Tabs, Tab, Menu, MenuItem, Divider } from '@material-ui/core'

export default function TopBar({ title, onChangeScene, disabledTabs, onClickMenuItem }) {

  const [selectedTab, setSelectedTab] = useState(0)

  function handleTabChange(event, newValue) {
    setSelectedTab(newValue)
    onChangeScene(newValue)
  }

  const [anchorEl, setAnchorEl] = useState(null)
  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function handleClickMenuItem(event, value) {
    onClickMenuItem(value)
    handleClose()
  }

  return (
    <div className="TopBar">
      <AppBar position="static" className="app-bar">
        <Toolbar>
          <IconButton color="inherit" onClick={handleClick}>
            <MenuIcon />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={(e) => handleClickMenuItem(e, 0)}>
              <NoteAddIcon className="margin-right" />
              New Project
            </MenuItem>
            <MenuItem onClick={(e) => handleClickMenuItem(e, 1)}>
              <FolderIcon className="margin-right" />
              Open Project
            </MenuItem>
            <MenuItem onClick={(e) => handleClickMenuItem(e, 2)}>
              <SettingsIcon className="margin-right" />
              Edit Project Settings
              </MenuItem>
            <MenuItem onClick={(e) => handleClickMenuItem(e, 3)}>
              <PollIcon className="margin-right" />
              Show Project Statistics
              </MenuItem>
            <Divider />
            <MenuItem onClick={(e) => handleClickMenuItem(e, 4)}>
              <VpnKeyIcon className="margin-right" />
              Set Youtube Api Key
              </MenuItem>
            <Divider />
            <MenuItem onClick={(e) => handleClickMenuItem(e, 5)}>
              <KeyboardIcon className="margin-right" />
              Shortcuts
              </MenuItem>
          </Menu>

          <Typography variant="h6" color="inherit" className="title"> {title} </Typography>

          <div className="tab-grow">
            <Tabs value={selectedTab} onChange={handleTabChange} centered>
              <Tab label="Search" disabled={disabledTabs} />
              <Tab label="Label" disabled={disabledTabs} />
            </Tabs>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  )
}
