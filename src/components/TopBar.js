import './TopBar.css'

import React from 'react'

export default function TopBar({ title, onChangeScene, isDisabled }) {
  return (
    <div className="TopBar">
      <div className="project-bar">
        <button>Api</button>
        <h1>{title}</h1>
      </div>

      <div className="scene-bar">
        <button onClick={() => onChangeScene(0)} disabled={isDisabled}>Search</button>
        <button onClick={() => onChangeScene(1)} disabled={isDisabled}>Label</button>
      </div>

      <div className="status-bar">
        <p>Status...</p>
      </div>

    </div>
  )
}
