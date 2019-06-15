import './VideoCard.css'

import React from 'react'

import { Card, CardActionArea, CardMedia, CardContent, Typography, LinearProgress, Tooltip } from '@material-ui/core'

import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import TurnedInIcon from '@material-ui/icons/TurnedIn'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import SaveAltIcon from '@material-ui/icons/SaveAlt'

const entities = require("entities")

export default function VideoCard({ videoData, onClick, isDisabled, thumbnailPath, iconType, showDarkOverlay }) {

  const { youtubeData, downloadState, downloadPercent } = videoData

  let topRightIcon = null

  switch (iconType) {
    case 'selected':
      topRightIcon = <CheckCircleIcon color="secondary" fontSize="large" />
      break
    case 'downloaded':
      topRightIcon = <SaveAltIcon color="secondary" fontSize="large" />
      break
    case 'done':
      topRightIcon = <TurnedInIcon color="secondary" fontSize="large" />
      break
    case 'playing':
      topRightIcon = <PlayCircleFilledIcon color="secondary" fontSize="large" />
      break

  }

  return (
    <div className="VideoCard" >
      {showDarkOverlay ? <div className="overlay"></div> : null}

      <Card
        square
      >
        <div className="card-icon-right"> {topRightIcon} </div>

        <CardActionArea onClick={onClick} disabled={isDisabled}>
          <CardMedia
            draggable="false"
            component="img"
            width={youtubeData.mediumThumbnail.width}
            image={thumbnailPath || youtubeData.mediumThumbnail.url}
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
