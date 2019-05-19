import './SearchWorkspace.css'

import React, { useState, useEffect } from 'react'

import { Typography, TextField, MenuItem, Button, Divider, Grid, GridList, GridListTile } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'

import SidePanel from '../components/SidePanel'
import VideoCard from '../components/VideoCard'
import Main from '../components/Main'

const Mousetrap = require('mousetrap')

// Search videos to get candidates and filter them
export default function SearchWorkspace({
  videos, requestedVideos,
  onSelectAll, onInvertSelection, onCardClick,
  onSubmitSearch,
  onClickDownloadSelectedVideos, onClickCancelDownloads
}) {

  const [textInput, setTextInput] = useState('')
  const [maxResults, setMaxResults] = useState(10)
  const [order, setOrder] = useState('relevance')
  const [videoDuration, setVideoDuration] = useState('short')
  const [videoLicense, setVideoLicense] = useState('any')

  /*
  {
    text,
    options: {
      maxResults,
      order,
      videoDuration,
      videoLicense,
      ...
    }
  }
  */

  function handleSubmit(e) {
    e.preventDefault()

    let query = {
      text: textInput,
      options: {
        maxResults,
        order,
        videoDuration,
        videoLicense
      }
    }

    onSubmitSearch(query)
  }

  const [numCols, setNumCols] = useState(2)

  // Shortcuts
  useEffect(() => {
    Mousetrap.bind(['command+e', 'ctrl+e'], onSelectAll)
    Mousetrap.bind(['command+i', 'ctrl+i'], onInvertSelection)

    return () => {
      Mousetrap.unbind(['command+e', 'ctrl+e'])
      Mousetrap.bind(['command+i', 'ctrl+i'])
    }
  }, [onSelectAll, onInvertSelection])

  return (
    <div className="SearchWorkspace">
      <SidePanel>
        <Typography variant="h5" component="h2"> Search </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            autoFocus
            label="Search query"
            value={textInput}
            type="search"
            onChange={e => setTextInput(e.target.value)}
            margin="normal"
            variant="outlined"
            fullWidth
          />

          <Grid container spacing={16}>
            <Grid item>

              <TextField
                label="Max results"
                type="number"
                min="0"
                defaultValue="10"
                onChange={e => setMaxResults(e.target.value)}
                margin="normal"
                variant="outlined"
              />
            </Grid>

            <Grid item>
              <TextField
                select
                label="Order by"
                value={order}
                onChange={e => setOrder(e.target.value)}
                margin="normal"
                variant="outlined"
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="viewCount">View Count</MenuItem>
              </TextField>
            </Grid>

          </Grid>

          <Grid container spacing={16}>
            <Grid item>
              <TextField
                select
                label="Video duration"
                value={videoDuration}
                onChange={e => setVideoDuration(e.target.value)}
                margin="normal"
                variant="outlined"
              >
                <MenuItem value="short">Short {'(< 4 min)'}</MenuItem>
                <MenuItem value="medium">Medium {'(4 - 20 min)'}</MenuItem>
                <MenuItem value="long">Long {'(> 20 min)'}</MenuItem>
                <MenuItem value="any">Any duration</MenuItem>
              </TextField>
            </Grid>

            <Grid item>
              <TextField
                select
                label="Video license"
                value={videoLicense}
                onChange={(e) => setVideoLicense(e.target.value)}
                margin="normal"
                variant="outlined"
              >
                <MenuItem value="creativeCommon">Creative Commons license</MenuItem>
                <MenuItem value="youtube">Youtube license</MenuItem>
                <MenuItem value="any">Any license</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Button variant="contained" color="primary" type="submit" fullWidth> Search </Button>
        </form>

        <div className="side-panel-divider">
          <Divider variant="fullWidth" />
        </div>

        <Typography variant="h5" component="h2" gutterBottom> Selection </Typography>
        <Grid container spacing={16}>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={onSelectAll}> Select All </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={onInvertSelection}> Invert Selection </Button>
          </Grid>
        </Grid>

      </SidePanel>

      <Main>
        <div className="slider-container">
          <Slider
            value={numCols}
            min={1} max={6} step={1}
            onChange={(e, v) => setNumCols(v)}
          />
        </div>
        <div className="search-results">
          <GridList cellHeight={'auto'} cols={numCols}>
            {videos.map(candidateVideo =>
              <GridListTile key={candidateVideo.youtubeData.id}>
                <VideoCard
                  borderColor={candidateVideo.isSelected ? '#3f3' : '#333'}
                  videoData={candidateVideo}
                  onClick={() => onCardClick(candidateVideo.youtubeData.id)}
                />
              </GridListTile>
            )}
          </GridList>
        </div>
      </Main>


      <SidePanel>
        <Typography variant="h5" component="h2" gutterBottom> Download </Typography>
        <Grid container spacing={16}>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={onClickDownloadSelectedVideos} > Download Selected Videos </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={onClickCancelDownloads} > Cancel All Downloads </Button>
          </Grid>
        </Grid>

        <div className="side-panel-divider">
          <Divider variant="fullWidth" />
        </div>

        <Typography variant="h5" component="h2" gutterBottom> Requested videos </Typography>
        {
          requestedVideos.map(video =>
            <div
              style={{ marginTop: '1em' }}
              key={video.youtubeData.id}>
              <VideoCard
                borderColor={video.isSelected ? '#3f3' : '#333'}
                videoData={video}
                onClick={() => { }}
              />
            </div>
          )
        }

      </SidePanel>
    </div>
  )
}