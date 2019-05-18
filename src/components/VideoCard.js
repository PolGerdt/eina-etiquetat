import './VideoCard.css'

import React from 'react'

import { Card, CardActionArea, CardMedia, CardContent, Typography, LinearProgress, Tooltip } from '@material-ui/core'

export default function VideoCard({ videoData, onClick, borderColor='#333' }) {

  const { youtubeData, downloadState, downloadPercent } = videoData

  const formattedDownloadPercent = Math.round(100 * downloadPercent)

  return (
    <div
      className="VideoCard"
      style={{ borderColor: borderColor }}
    >
      <Card square>
        <CardActionArea onClick={onClick}>
          <CardMedia
            draggable="false"
            component="img"
            width={youtubeData.thumbnails.medium.width}
            image={youtubeData.thumbnails.medium.url}
          />
          <CardContent>
            <Tooltip title={videoData.youtubeData.title} enterDelay={500}>
              <Typography gutterBottom variant="h6" component="h3" noWrap>{videoData.youtubeData.title}</Typography>
            </Tooltip>
            <LinearProgress variant="determinate" value={100 * downloadPercent} />
            <Typography component="p">{formattedDownloadPercent} %</Typography>
            <Typography component="p">Download state: {downloadState}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div >
  )
}
