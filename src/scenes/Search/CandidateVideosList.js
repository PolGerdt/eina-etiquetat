import './CandidateVideosList'
import React from 'react'
import CandidateVideoCard from './CandidateVideoCard';

export default function CandidateVideosList({ videos }) {

  return (
    <div className="CandidateVideosList">
      {videos.map(vid => <CandidateVideoCard videoData={vid} key={vid.id} />)}
    </div>
  )
}
