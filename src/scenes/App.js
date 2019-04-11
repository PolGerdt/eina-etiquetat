import './App.css'

import React, { useState } from 'react'

import MenuBar from '../components/MenuBar/MenuBar'
import Buscar from './Search/Search'
import Etiquetar from './Label/Label'

export default function App() {
  const [scene, setScene] = useState(0)

  return (
    <div>
      <MenuBar onChangeScene={setScene} />
      {(scene === 0) ? <Buscar /> : <Etiquetar />}
    </div>
  )
}
