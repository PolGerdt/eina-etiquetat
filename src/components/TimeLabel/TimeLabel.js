import './TimeLabel.css'
import React from 'react'

export default function TimeLabel({ label, isOpen, onClickDelete }) {
  // If out percent is smaller than in percent set start to the min value and width to absolute difference
  const startPct = (Math.min(label.inPct, label.outPct) * 100) + '%'
  const widthPct = (Math.abs(label.outPct - label.inPct) * 100) + '%'

  return (
    <div
      className="TimeLabel"
      style={{
        left: startPct,
        width: widthPct,
        borderTopColor: isOpen ? '#fdd' : '#ddd'
      }}
    >
      <div className="label-info">
        <p>{label.name}</p>
        <button onClick={onClickDelete}>X</button>
      </div>
    </div>
  )
}
