import './CandidateVideoCard.css'

import React from 'react'

export default function CandidateVideoCard({ videoData, onClickCard }) {

  return (
    <div
      className={'CandidateVideoCard ' + (videoData.isAccepted ? 'accepted' : 'rejected')}
      onClick={onClickCard}
    >
      <img src={videoData.youtubeData.thumbnails.medium.url}>
      </img>
      <div className="video-info">
        <p dangerouslySetInnerHTML={{ __html: videoData.youtubeData.title }}></p>
      </div>
    </div>
  )
}
