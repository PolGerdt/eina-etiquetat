import './CandidateVideoCard.css'

import React from 'react'

export default function CandidateVideoCard({ videoData, onRequestDownload, onCancelDownload }) {

  const { youtubeData, downloadState, downloadPercent } = videoData

  const formattedDownloadPercent = Math.round(100 * downloadPercent)

  return (
    <div className='CandidateVideoCard' >
      <img src={youtubeData.thumbnails.medium.url}></img>

      <div className="video-info">
        <p className='video-title' dangerouslySetInnerHTML={{ __html: videoData.youtubeData.title }}></p>
        <div className='download-video-info'>
          <button onClick={onRequestDownload} disabled={downloadState !== 'none'} > ▼ </button>
          <p>{formattedDownloadPercent} %</p>
          <button onClick={onCancelDownload} disabled={downloadState !== 'downloading'}> X </button>
        </div>
      </div>
    </div >
  )
}
