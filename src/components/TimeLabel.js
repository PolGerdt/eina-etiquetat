import './TimeLabel.css'
import React from 'react'

import { IconButton, Typography } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

import yellow from '@material-ui/core/colors/yellow'
import grey from '@material-ui/core/colors/grey'

const openColor = yellow[500]
const greyColor = grey[300]

export default function TimeLabel({ totalTime, label, isOpen, onClickDelete }) {
  // If out percent is smaller than in percent set start to the min value and width to absolute difference
  const startPct = (100 * Math.min(label.inTime, label.outTime) / totalTime) + '%'
  const widthPct = (100 * Math.abs(label.outTime - label.inTime) / totalTime) + '%'

  return (
    <div
      className="TimeLabel"
      style={{
        left: startPct,
        width: widthPct,
        borderTopColor: isOpen ? openColor : greyColor
      }}
    >
      <div className="label-info">
        <Typography variant="body1"> {label.labelName} </Typography>
        <IconButton variant="text" color="secondary" size="small" onClick={onClickDelete}>
          <CloseIcon fontSize="small" />
        </IconButton >
      </div>
    </div>
  )
}
