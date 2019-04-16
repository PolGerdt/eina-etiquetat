import './App.css'

import React, { useState } from 'react'

import TopBar from '../components/TopBar/TopBar'
import Buscar from './Search/Search'
import Etiquetar from './Label/Label'

export default function App() {
  const [scene, setScene] = useState(0)

  return (
    <div className="App">
      <TopBar onChangeScene={setScene} />
      {(scene === 0) ? <Buscar /> : <Etiquetar />}
    </div>
  )
}
