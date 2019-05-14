import './CandidateVideoCard.css'

import React from 'react'

export default function CandidateVideoCard({ videoData, onClick }) {

  const { youtubeData, downloadState, downloadPercent } = videoData

  const formattedDownloadPercent = Math.round(100 * downloadPercent)

  return (
    <div
      className={'CandidateVideoCard' + (videoData.isSelected ? ' selected-card' : '')}
      onClick={onClick}
    >
      <img src={youtubeData.thumbnails.medium.url}></img>

      <div className="video-info">
        <p className='video-title' dangerouslySetInnerHTML={{ __html: videoData.youtubeData.title }}></p>
        <div className='download-video-info'>
          <p>{formattedDownloadPercent} %</p>
          <p>{downloadState}</p>
        </div>
      </div>
    </div >
  )
}
