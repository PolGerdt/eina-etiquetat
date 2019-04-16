import './Search.css'

import React, { useState, useEffect } from 'react'
import youtubeSearch from 'youtube-search'

import SidePanel from '../../components/SidePanel/SidePanel'
import CandidateVideoCard from './CandidateVideoCard'
import SetYoutubeApiKey from './SetYoutubeApiKey'

const Store = require('electron-store')
const fs = require('fs')
const { dialog } = require('electron').remote

const store = new Store()

// Search scene where you can search videos to get candidates and filter them
export default function Search() {

  const [textInput, setTextInput] = useState('')
  function handleTextChange(e) {
    setTextInput(e.target.value)
  }

  const [youtubeApiKey, setYoutubeApiKey] = useState('')
  useEffect(() => {
    setYoutubeApiKey(store.get('youtube-api-key', ''))
  }, [])

  // All candidate videos with youtube data and isAccepted state
  const [candidateVideos, setCandidateVideos] = useState([])
  function handleSubmit(e) {
    e.preventDefault()

    setYoutubeApiKey(store.get('youtube-api-key', ''))

    if (!youtubeApiKey) {
      return
    }

    var opts = {
      maxResults: 10,
      key: youtubeApiKey,
      type: 'video'
      // order?
    }

    youtubeSearch(textInput, opts, function (err, youtubeResults) {
      if (err) {
        console.log(err)
      } else {
        console.log(youtubeResults)
        let searchCandidateVideos = youtubeResults.map(result =>
          ({ youtubeData: result, isAccepted: false })
        )
        setCandidateVideos(searchCandidateVideos)
      }
    })
  }

  function handleVideoCardClick(id) {
    // Toggle the accepted state of the clicked video
    let updatedCandidateVideos = candidateVideos.map(
      (candidate) => (candidate.youtubeData.id === id) ?
        ({ youtubeData: candidate.youtubeData, isAccepted: !candidate.isAccepted })
        :
        candidate
    )
    setCandidateVideos(updatedCandidateVideos)
  }

  function saveAcceptedCandidatesId() {
    dialog.showSaveDialog(null, null, (filename) => {
      let acceptedCandidatesId = candidateVideos
        .filter(candidate => candidate.isAccepted)
        .map(accepted => ({ id: accepted.youtubeData.id }))

      let data = JSON.stringify(acceptedCandidatesId)
      fs.writeFileSync(filename + '.json', data)
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
        (youtubeApiKey) ?
          <div className="candidateVideosList">
            {candidateVideos.map(candidateVideo =>
              <CandidateVideoCard
                videoData={candidateVideo}
                onClickCard={() => handleVideoCardClick(candidateVideo.youtubeData.id)}
                key={candidateVideo.youtubeData.id}
              />
            )}
          </div>
          :
          <SetYoutubeApiKey />
      }

      <SidePanel>
        <h2>Output</h2>
        <h3>Videos</h3>
        <button>Start download</button>
        <h3>Filtered videos list</h3>
        <button>Load list</button>
        <button onClick={saveAcceptedCandidatesId}>Save filtered list</button>
      </SidePanel>
    </div>
  )
}
