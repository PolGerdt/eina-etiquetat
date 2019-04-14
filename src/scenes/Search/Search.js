import './Search.css'

import React, { useState, useEffect } from 'react'
import youtubeSearch from 'youtube-search'

import SidePanel from '../../components/SidePanel/SidePanel'
import CandidateVideosList from './CandidateVideosList'
import SetYoutubeApiKey from './SetYoutubeApiKey'

const Store = require('electron-store')
const store = new Store();

// Search scene where you can search videos to get candidates and filter them
export default function Search() {

  const [youtubeApiKey, setYoutubeApiKey] = useState('')
  const [textInput, setTextInput] = useState('')
  const [videos, setVideos] = useState([])

  useEffect(() => {
    setYoutubeApiKey(store.get('youtube-api-key', ''))
  }, [] )

  function handleTextChange(e) {
    setTextInput(e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault()

    var opts = {
      maxResults: 10,
      key: store.get('youtube-api-key', '')
    }

    youtubeSearch(textInput, opts, function (err, results) {
      if (err) {
        console.log(err)
      } else {
        console.log(results)
        setVideos(results)
      }
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

      {
        youtubeApiKey ?
          <CandidateVideosList videos={videos || ''} />
          :
          <SetYoutubeApiKey />
      }

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
