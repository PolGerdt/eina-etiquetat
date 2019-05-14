import './SearchWorkspace.css'

import React, { useState } from 'react'

import SidePanel from '../components/SidePanel'
import CandidateVideoCard from '../components/CandidateVideoCard'
import Main from '../components/Main'

// Search videos to get candidates and filter them
export default function SearchWorkspace({
  videos,
  onSelectAll, onInvertSelection, onCardClick,
  onSubmitSearch,
  onClickDownloadSelectedVideos }) {

  const [textInput, setTextInput] = useState('')
  const [maxResults, setMaxResults] = useState(10)
  const [order, setOrder] = useState('relevance')
  const [videoDuration, setVideoDuration] = useState('short')
  const [videoLicense, setVideoLicense] = useState('any')

  /*
  {
    text,
    options: {
      maxResults,
      order,
      videoDuration,
      videoLicense,
      ...
    }
  }
  */

  function handleSubmit(e) {
    e.preventDefault()

    let query = {
      text: textInput,
      options: {
        maxResults,
        order,
        videoDuration,
        videoLicense
      }
    }

    onSubmitSearch(query)
  }

  const [numCols, setNumCols] = useState(2)

  return (
    <div className="SearchWorkspace">
      <SidePanel>
        <h2>Input</h2>
        <h3>Search</h3>
        <form onSubmit={handleSubmit}>

          <p>
            <label>
              Search query
            <input type="text" onChange={e => setTextInput(e.target.value)}></input>
            </label>
          </p>


          <p>
            <label>
              Max results
              <input
                type="number"
                min="0"
                defaultValue="10"
                onChange={e => setMaxResults(e.target.value)}></input>
            </label>
          </p>


          <p>
            <label>
              Order
            <select defaultValue="relevance" onChange={e => setOrder(e.target.value)}>
                <option value='date'>Date</option>
                <option value='rating'>Rating</option>
                <option value='relevance'>Relevance</option>
                <option value='title'>Title</option>
                <option value='videoCount'>Video count</option>
                <option value='viewCount'>View count</option>
              </select>
            </label>
          </p>


          <p>
            <label>
              Video duration
            <select defaultValue="short" onChange={e => setVideoDuration(e.target.value)}>
                <option value='short'>Short</option>
                <option value='medium'>Medium</option>
                <option value='long'>Long</option>
                <option value='any'>Any</option>
              </select>
            </label>
          </p>


          <p>
            <label>
              Video license
            <select defaultValue="any" onChange={e => setVideoLicense(e.target.value)}>
                <option value='creativeCommon'>Creative Common</option>
                <option value='youtube'>Youtube</option>
                <option value='any'>Any</option>
              </select>
            </label>
          </p>

          <button type="submit">Search</button>
        </form>

        <h3>Selection</h3>

        <button onClick={onSelectAll}>Select All</button>
        <button onClick={onInvertSelection}>Invert Selection</button>
      </SidePanel>

      <Main>
        <select
          defaultValue="2"
          style={{ width: '100%', margin: 0 }}
          onChange={e => setNumCols(e.target.value)}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <div
          className="candidate-videos-grid"
          style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}
        >

          {videos.map(candidateVideo =>
            <CandidateVideoCard
              videoData={candidateVideo}
              onClick={() => onCardClick(candidateVideo.youtubeData.id)}
              key={candidateVideo.youtubeData.id}
            />
          )}
        </div>
      </Main>

      <SidePanel>
        <h2>Output</h2>
        <h3>Download</h3>
        <button onClick={onClickDownloadSelectedVideos}>Download Selected Videos</button>
      </SidePanel>
    </div>
  )
}
