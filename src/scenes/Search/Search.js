import './Search.css'

import React, { useState } from 'react'
import search from 'youtube-search'

import SidePanel from '../../components/SidePanel/SidePanel'
import CandidateVideosList from './CandidateVideosList'

// Search scene where you can search videos to get candidates and filter them
export default function Search() {

  const [textInput, setTextInput] = useState('')

  const [videos, setVideos] = useState([])

  function handleTextChange(e) {
    setTextInput(e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault()

    var opts = {
      maxResults: 10,
      key: ''
    }

    search(textInput, opts, function (err, results) {
      if (err) return console.log(err)
      console.dir(results)

      setVideos(results)
    })
  }

  return (
    <div className="Search">
      <SidePanel>
        <h2>Input</h2>
        <h3>Search</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Search query
            <input type="text" onChange={handleTextChange}></input>
          </label>

        </form>
      </SidePanel>

      <CandidateVideosList videos={videos || ''} />

      <SidePanel>
        <h2>Output</h2>
        <h3>Videos</h3>
        <button>Start download</button>
        <h3>Filtered videos list</h3>
        <button>Load list</button>
        <button>Export list</button>
      </SidePanel>
    </div>
  )
}
