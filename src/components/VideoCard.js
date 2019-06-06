import './VideoCard.css'

import React from 'react'

import { Card, CardActionArea, CardMedia, CardContent, Typography, LinearProgress, Tooltip } from '@material-ui/core'

import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import TurnedInIcon from '@material-ui/icons/TurnedIn'

const selectedStyle = {
  backgroundColor: '#000'
}

const entities = require("entities")

export default function VideoCard({ videoData, onClick, isLabeled }) {

  const { youtubeData, downloadState, downloadPercent, isSelected } = videoData

  let rightIcon = null

  if (isLabeled) {
    rightIcon = <TurnedInIcon color="secondary" fontSize="large" />
  } else if (isSelected) {
    rightIcon = <CheckCircleIcon color="secondary" fontSize="large" />
  }

  return (
    <div className="VideoCard" >
      <div className="overlay" style={isSelected ? selectedStyle : null}></div>
      <Card square>
        <div className="card-icon-right"> {rightIcon} </div>

        <CardActionArea onClick={onClick}>
          <CardMedia
            draggable="false"
            component="img"
            width={youtubeData.thumbnails.medium.width}
            image={youtubeData.thumbnails.medium.url}
          />

          <CardContent>
            <Tooltip title={entities.decodeHTML(youtubeData.title)} enterDelay={500}>
              <Typography gutterBottom variant="h6" component="h3" noWrap>{entities.decodeHTML(youtubeData.title)}</Typography>
            </Tooltip>
            <LinearProgress variant={downloadState === 'requested' ? "query" : "determinate"} value={100 * downloadPercent} color="primary" />
          </CardContent>
        </CardActionArea>
      </Card>
    </div >
  )
}
