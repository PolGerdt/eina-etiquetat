import './CandidateVideoCard.css'
import React from 'react'

export default function CandidateVideoCard({ videoData }) {
  return (
    <div className="CandidateVideoCard">
      <p>{videoData.title}</p>
      <a href={videoData.link}>Link</a>
      <img src={videoData.thumbnails.default.url}
        width={videoData.thumbnails.default.width}
        height={videoData.thumbnails.default.height}>
      </img>
    </div>
  )
}
