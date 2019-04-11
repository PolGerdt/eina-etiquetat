import './MenuBar.css'

import React from 'react'

export default function MenuBar({ onChangeScene }) {
  return (
    <div className="MenuBar">
      <div className="project-bar">
        <h1>E</h1>
        <button>New Project</button>
        <button>Open Project</button>
        <button>Save Project</button>
      </div>

      <div className="scene-bar">
        <button onClick={() => onChangeScene(0)}>Buscar i filtrar</button>
        <button onClick={() => onChangeScene(1)}>Etiquetar</button>
      </div>

      <div className="status-bar">
        <p>Loading...</p>
      </div>

    </div>
  )
}
