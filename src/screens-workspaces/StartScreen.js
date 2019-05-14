import './StartScreen.css'

import React from 'react'
import TopBar from '../components/TopBar'

export default function StartScreen({ onClickNew, onClickOpen }) {

  return (
    <div className="StartScreen">
      <TopBar title="" onChangeScene={() => { }} isDisabled={true}/>
      <div className="mainContainer">
        <button onClick={onClickNew}>New Project</button>
        <button onClick={onClickOpen}>Open Project</button>
      </div>
    </div>
  )
}
