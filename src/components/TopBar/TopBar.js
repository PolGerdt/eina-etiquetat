import './TopBar.css'

import React from 'react'

export default function TopBar({ onChangeScene }) {
  return (
    <div className="TopBar">
      <div className="project-bar">
        <p>Project name</p>
      </div>

      <div className="scene-bar">
        <button onClick={() => onChangeScene(0)}>Search and filter</button>
        <button onClick={() => onChangeScene(1)}>Label</button>
      </div>

      <div className="status-bar">
        <p>Status...</p>
      </div>

    </div>
  )
}
