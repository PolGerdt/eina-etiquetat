import './SearchWorkspace.css'

import React, { useState, useEffect } from 'react'

import { Typography, TextField, MenuItem, Button, Divider, Grid, GridList, GridListTile, CircularProgress } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'

import SelectAllIcon from '@material-ui/icons/SelectAll'
import SwapHorizIcon from '@material-ui/icons/SwapHoriz'
import SaveAltIcon from '@material-ui/icons/SaveAlt'
import CancelIcon from '@material-ui/icons/Cancel'
import SearchIcon from '@material-ui/icons/Search'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore'

import SidePanel from '../components/SidePanel'
import VideoCard from '../components/VideoCard'
import MainPanel from '../components/MainPanel'

const Mousetrap = require('mousetrap')

// Search videos to get candidates and filter them
export default function SearchWorkspace({
  searchParams,
  isSearching,
  onSetTextInput, onSetMaxResults, onSetOrder, onSetVideoDuration, onSetVideoLicense,
  prevPageToken, nextPageToken,
  onClickPrevPage, onClickNextPage,
  videos, requestedVideos,
  numCols,
  onSelectAll, onInvertSelection, onCardClick,
  onSubmitSearch,
  onChangeNumCols,
  onClickDownloadSelectedVideos, onClickCancelDownloads
}) {

  /*
  searchParams: {
    textInput,
    maxResults,
    order,
    videoDuration,
    videoLicense,
    }
  }
  */

  function onSubmitForm(e) {
    e.preventDefault()
    onSubmitSearch()
  }

  const [numVideosSelected, setNumVideosSelected] = useState(0)
  useEffect(() => {
    setNumVideosSelected(videos.filter(video => video.isSelected).length)
  }, [videos])

  // Shortcuts
  useEffect(() => {
    Mousetrap.bind(['command+e', 'ctrl+e'], onSelectAll)
    Mousetrap.bind(['command+d', 'ctrl+d'], onInvertSelection)
    Mousetrap.bind(['command+left', 'ctrl+left'], onClickPrevPage)
    Mousetrap.bind(['command+right', 'ctrl+right'], onClickNextPage)

    return () => {
      Mousetrap.unbind(['command+e', 'ctrl+e'])
      Mousetrap.unbind(['command+d', 'ctrl+d'])
      Mousetrap.unbind(['command+left', 'ctrl+left'])
      Mousetrap.unbind(['command+right', 'ctrl+right'])
    }
  }, [onSelectAll, onInvertSelection, onClickPrevPage, onClickNextPage])

  return (
    <div className="SearchWorkspace">
      <SidePanel>
        <Typography variant="h5" component="h2"> Search </Typography>

        <form onSubmit={onSubmitForm}>
          <TextField
            autoFocus
            label="Search query"
            value={searchParams.textInput}
            type="search"
            onChange={e => onSetTextInput(e.target.value)}
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
                max="50"
                error={searchParams.maxResults > 50}
                helperText={searchParams.maxResults > 50 ? 'Acceptable values are 0 to 50, inclusive.' : null}
                value={searchParams.maxResults}
                onChange={e => onSetMaxResults(e.target.value)}
                margin="normal"
                variant="outlined"
              />
            </Grid>

            <Grid item>
              <TextField
                select
                label="Order by"
                value={searchParams.order}
                onChange={e => onSetOrder(e.target.value)}
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
                value={searchParams.videoDuration}
                onChange={e => onSetVideoDuration(e.target.value)}
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
                value={searchParams.videoLicense}
                onChange={(e) => onSetVideoLicense(e.target.value)}
                margin="normal"
                variant="outlined"
              >
                <MenuItem value="creativeCommon">Creative Commons license</MenuItem>
                <MenuItem value="youtube">Youtube license</MenuItem>
                <MenuItem value="any">Any license</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <div className="button-top-margin">
            <Button variant="contained" color="secondary" type="submit" fullWidth>
              <SearchIcon className="margin-right" />
              Search
            </Button>
          </div>
        </form>

        <div className="side-panel-divider">
          <Divider variant="fullWidth" />
        </div>

        <Typography variant="h5" component="h2" gutterBottom> Selection </Typography>
        <Typography variant="body1" gutterBottom> {numVideosSelected} videos selected </Typography>
        <div className="button-top-margin">
          <Grid container spacing={16}>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={onSelectAll}>
                <SelectAllIcon className="right-margin" />
                Select All
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={onInvertSelection}>
                <SwapHorizIcon className="right-margin" />
                Invert Selection
              </Button>
            </Grid>
          </Grid>
        </div>

      </SidePanel>

      <MainPanel>
        <div className="slider-container">
          <Slider
            value={numCols}
            min={1} max={6} step={1}
            onChange={(e, v) => onChangeNumCols(v)}
          />
        </div>

        <div className="search-results">

          {/* Anchor element to scroll to top */}
          <div id="search-results-top"></div>

          {
            isSearching ? (
              <div className="searching-state">
                <CircularProgress color="secondary" />
              </div>
            ) : null
          }

          <GridList cellHeight={'auto'} cols={numCols} spacing={10}>
            {
              videos.map(candidateVideo => {
                const isDisabled = candidateVideo.downloadState !== 'none'

                let icon = 'none'

                if (candidateVideo.downloadState === 'downloaded') {
                  icon = 'downloaded'
                } else if (candidateVideo.isSelected) {
                  icon = 'selected'
                }

                return (
                  <GridListTile key={candidateVideo.youtubeData.id} className="grid-tile">
                    <VideoCard
                      videoData={candidateVideo}
                      onClick={() => onCardClick(candidateVideo.youtubeData.id)}
                      isDisabled={isDisabled}
                      iconType={icon}
                      showDarkOverlay={isDisabled || candidateVideo.isSelected}
                    />
                  </GridListTile>
                )
              })
            }
          </GridList>
        </div>

        <div className="page-controls">
          <Button
            variant="contained"
            color="secondary"
            onClick={onClickPrevPage}
            disabled={!prevPageToken}
          >
            <NavigateBeforeIcon className="right-margin" />
            Previous page
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={onClickNextPage}
            disabled={!nextPageToken}
          >
            <NavigateNextIcon className="right-margin" />
            Next page
          </Button>
        </div>

      </MainPanel>


      <SidePanel>
        <div className="divided-scroll">
          <div>
            <Typography variant="h5" gutterBottom className="section-title"> Download </Typography>

            <Grid container spacing={16}>
              <Grid item>
                <Button variant="contained" color="secondary" onClick={onClickDownloadSelectedVideos} >
                  <SaveAltIcon className="margin-right" />
                  Download Selected Videos
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="secondary" onClick={onClickCancelDownloads} >
                  <CancelIcon className="margin-right" />
                  Cancel All Downloads
                </Button>
              </Grid>
            </Grid>

            <div className="side-panel-divider">
              <Divider variant="fullWidth" />
            </div>

            <Typography variant="h5" gutterBottom> Requested videos </Typography>
          </div>

          <div className="scroll-requested">
            {
              requestedVideos.map(video =>
                <div
                  className="margin-bottom"
                  key={video.youtubeData.id}>
                  <VideoCard
                    videoData={video}
                    onClick={() => { }}
                    isDisabled={true}
                    showDarkOverlay={true}
                  />
                </div>
              )
            }
          </div>
        </div>
      </SidePanel>
    </div>
  )
}
