import './SearchScene.css'

import React, { useState } from 'react'

import SidePanel from '../../components/SidePanel/SidePanel'
import CandidateVideoCard from '../../components/CandidateVideoCard/CandidateVideoCard'
import Main from '../../components/Main/Main'

// Search videos to get candidates and filter them
export default function SearchScene({ videos, onTextSubmit, onDownloadVideoRequest, onCancelDownload }) {

  const [textInput, setTextInput] = useState('')

  function handleTextChange(e) {
    setTextInput(e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onTextSubmit(textInput)
  }

  return (
    <div className="SearchScene">
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

      <Main>
        <div className="candidate-videos-grid">
          {videos.map(candidateVideo =>
            <CandidateVideoCard
              videoData={candidateVideo}
              onRequestDownload={() => onDownloadVideoRequest(candidateVideo.youtubeData.id)}
              onCancelDownload={() => onCancelDownload(candidateVideo.youtubeData.id)}
              key={candidateVideo.youtubeData.id}
            />
          )}
        </div>
      </Main>

      <SidePanel>
        <h2>Output</h2>
        <h3>Videos</h3>
        <h3>Filtered videos list</h3>
      </SidePanel>
    </div>
  )
}
