import './TopBar.css'

import React, { useState } from 'react'

import MenuIcon from '@material-ui/icons/Menu'
import { AppBar, Toolbar, IconButton, Typography, Tabs, Tab, Menu, MenuItem, Divider } from '@material-ui/core'

export default function TopBar({ title, onChangeScene, disabledTabs, onClickMenuItem }) {

  const [selectedTab, setSelectedTab] = useState(0);

  function handleTabChange(event, newValue) {
    setSelectedTab(newValue)
    onChangeScene(newValue)
  }

  const [anchorEl, setAnchorEl] = React.useState(null);
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
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={handleClick}>
            <MenuIcon />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={(e) => handleClickMenuItem(e, 0)}>New Project</MenuItem>
            <MenuItem onClick={(e) => handleClickMenuItem(e, 1)}>Open Project</MenuItem>
            <MenuItem onClick={(e) => handleClickMenuItem(e, 2)}>Edit Project Settings</MenuItem>
            <MenuItem onClick={(e) => handleClickMenuItem(e, 3)}>Show Project Statistics</MenuItem>
            <Divider />
            <MenuItem onClick={(e) => handleClickMenuItem(e, 4)}>Set Youtube Api Key</MenuItem>
            <Divider />
            <MenuItem onClick={(e) => handleClickMenuItem(e, 5)}>Shortcuts</MenuItem>
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
