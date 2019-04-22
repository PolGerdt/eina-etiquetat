import './TopBar.css'

import React from 'react'
const Store = require('electron-store')

const store = new Store()

export default function TopBar({ onChangeScene }) {
  return (
    <div className="TopBar">
      <div className="project-bar">
        <p>{store.get('project-name')}</p>
      </div>

      <div className="scene-bar">
        <button onClick={() => onChangeScene(0)}>Search</button>
        <button onClick={() => onChangeScene(1)}>Label</button>
      </div>

      <div className="status-bar">
        <p>Status...</p>
      </div>

    </div>
  )
}
