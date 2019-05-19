import './ProjectScreen.css'

import React, { useState, useEffect, useRef } from 'react'

import { Snackbar, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

import SearchWorkspace from './SearchWorkspace'
import LabelWorkspace from './LabelWorkspace'

import youtubeSearch from 'youtube-search'
import JsonDB from 'node-json-db'

const { app, dialog } = require('electron').remote
const path = require('path')
const fs = require('fs')

const ytdl = require('ytdl-core')

let projectDataDb = undefined

function useProjectDataFieldDb(field, defaultState) {

  const [fieldData, setFieldData] = useState(projectDataDb.getData('/' + field) || defaultState)

  useEffect(() => {
    projectDataDb.push('/' + field, fieldData)
  }, [field, fieldData])

  return [fieldData, setFieldData]
}

export default function ProjectScreen({ youtubeApiKey, workspace, projectConfig }) {

  if (!projectDataDb)
    projectDataDb = new JsonDB(path.join(app.getPath('userData'), 'projectData.json'), true, false)

  const [candidateVideos, setCandidateVideos] = useState([])
  /*
    candidateVideo = {
      youtubeData: {},
      downloadState: 'none' / 'requested' / 'downloading' / 'downloaded'
      downloadPercent: 0,
      isSelected: false
    }
  */

  const [downloadedVideosDb, setDownloadedVideosDb] = useProjectDataFieldDb('downloadedVideos', [])
  /*
  [
    {
      youtubeData: {},
      downloadState: downloaded,
      downloadPercent: 100,
      isSelected: false
    }
  ]
  
  */

  // Search videos with youtube data api
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  function displayMessageSnackbar(message) {
    setIsSnackbarOpen(true)
    setSnackbarMessage(message)
  }
  function closeSnackbar() {
    setIsSnackbarOpen(false)
  }
  function searchVideos(query) {
    if (!youtubeApiKey) {
      displayMessageSnackbar('You need a Youtube Api Key to search. Set it in the App Settings menu.')
      return
    }

    var opts = {
      key: youtubeApiKey,
      maxResults: 10,
      type: 'video',
      videoDuration: 'short',
      ...query.options
    }

    youtubeSearch(query.text, opts, function (err, youtubeResults) {
      if (!err) {
        let searchCandidateVideos = youtubeResults.map(result => (
          {
            youtubeData: result,
            downloadState: 'none',
            downloadPercent: 0,
            isSelected: false
          }
        ))

        setCandidateVideos(searchCandidateVideos)
      }
    })
  }

  function toggleVideoSelection(videoId) {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.youtubeData.id === videoId) ?
        { ...video, isSelected: !video.isSelected, } :
        video
      )
    )
  }

  function selectAllVideos() {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => ({ ...video, isSelected: true, }))
    )
  }

  function invertSelectionAllVideos() {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => ({ ...video, isSelected: !video.isSelected, }))
    )
  }

  let ytReadableStream = useRef(null)
  let ytWriteableStream = useRef(null)
  function downloadVideo(downloadVideoId) {

    const options = {
      quality: 'lowestvideo',
      filter: (format) => format.container === 'mp4'
    }

    const videoUrl = `http://www.youtube.com/watch?v=${downloadVideoId}`

    const videoPath = path.join(
      app.getPath('userData'),
      'videos_full', downloadVideoId + '.mp4'
    )

    ytReadableStream.current = ytdl(videoUrl, options)

    ytWriteableStream.current = fs.createWriteStream(videoPath)

    ytReadableStream.current.pipe(ytWriteableStream.current)

    ytReadableStream.current.on('progress', (chunkLength, downloaded, total) => {
      const percent = downloaded / total
      onVideoDownloadProgress(downloadVideoId, percent)
    })

    ytReadableStream.current.on('end', () => {
      onVideoDownloaded(downloadVideoId)
    })
  }

  function onVideoDownloadProgress(videoId, percentage) {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.youtubeData.id === videoId) ?
        { ...video, downloadPercent: percentage, downloadState: 'downloading' } :
        video
      )
    )
  }

  function onVideoDownloaded(videoId) {
    let videoData = candidateVideos.find(video => video.youtubeData.id === videoId)

    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.youtubeData.id === videoId) ?
        { ...video, downloadState: 'downloaded', downloadPercent: 1, isSelected: false } :
        video
      ))

    setDownloadedVideosDb(previous =>
      [
        ...previous,
        { ...videoData, downloadState: 'downloaded', downloadPercent: 1, isSelected: false }
      ]
    )

    // Add an empty assignedLabels object
    setAssignedVideoLabelsDb(previous => [...previous, { videoId, labels: [], isDone: false }])
  }

  let requestedVideoIds = candidateVideos
    .filter(video => video.downloadState === 'requested')
    .map(videoToDownload => videoToDownload.youtubeData.id)

  let downloadingVideos = candidateVideos
    .filter(video => video.downloadState === 'downloading')

  let notDownloading = downloadingVideos.length === 0
  let hasRequestedVideos = requestedVideoIds.length > 0

  if (notDownloading && hasRequestedVideos) {
    downloadVideo(requestedVideoIds[0])
  }

  // Set all selected videos to requested download state
  function downloadSelectedVideos() {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.isSelected) ?
        { ...video, downloadState: 'requested' } :
        video
      )
    )
  }

  function cancelDownloads() {
    const downloadingVideo = candidateVideos.find(video => video.downloadState === 'downloading')
    if (downloadingVideo) {
      setCandidateVideos(previousVideos =>
        previousVideos.map(video => ({ ...video, downloadState: 'none', downloadPercent: 0 }))
      )

      fs.unlinkSync(getVideoUrl(downloadingVideo.youtubeData.id))

      ytWriteableStream.current.destroy()
      ytReadableStream.current.destroy()
    }
  }

  const [assignedVideoLabelsDb, setAssignedVideoLabelsDb] = useProjectDataFieldDb('assignedLabels', [])
  /*
  [
    {
      videoId: '',
      labels: [],
      isDone: false
    }
  ]
  */

  // Creates a labels object if it does not exist or appends the new label
  function assignLabel(videoId, label) {
    setAssignedVideoLabelsDb(previous =>
      previous.map(videoLabel => (videoLabel.videoId === videoId) ?
        ({ ...videoLabel, labels: [label, ...videoLabel.labels], isDone: false }) :
        videoLabel
      )
    )
  }

  function deleteAssignedLabel(videoId, labelId) {

    setAssignedVideoLabelsDb(previous =>
      previous.map(videoLabel => (videoLabel.videoId === videoId) ?
        (
          {
            videoId: videoLabel.videoId,
            labels: videoLabel.labels.filter(label => label.id !== labelId),
            isDone: false
          }
        )
        :
        videoLabel
      )
    )
  }

  function onVideoLabelsDone(videoId) {
    setAssignedVideoLabelsDb(previous =>
      previous.map(videoLabel => (videoLabel.videoId === videoId) ?
        ({ ...videoLabel, isDone: true }) :
        videoLabel
      )
    )
  }

  function exportAssignedLabels() {
    const opts = {
      title: 'Export labels',
      defaultPath: app.getPath('userData'),
      filters: [{
        name: 'JSON',
        extensions: ['json']
      }]
    }
    dialog.showSaveDialog(null, opts, (filename) => {
      if (filename) {
        // Export only done video labels removing the isDone key
        const finishedLabels = assignedVideoLabelsDb
          .filter(videoLabels => videoLabels.isDone)
          .map(videoLabels => ({ videoId: videoLabels.videoId, labels: videoLabels.labels }))

        fs.writeFileSync(filename, JSON.stringify(finishedLabels, null, 2))
      }
    })
  }

  function getVideoUrl(videoId) {
    const videoPath = path.join(app.getPath('userData'), 'videos_full', videoId + '.mp4')
    return videoPath
  }

  const downloadedVideoUrls = downloadedVideosDb.reduce((urlsObj, videoData) => (
    { ...urlsObj, [videoData.youtubeData.id]: getVideoUrl(videoData.youtubeData.id) }
  ), {})

  // Scene setup
  const getWorkspace = (workspace) => {
    switch (workspace) {
      case 0:
        return (
          <SearchWorkspace
            videos={candidateVideos}
            onCardClick={toggleVideoSelection}
            onSelectAll={selectAllVideos}
            onInvertSelection={invertSelectionAllVideos}
            onSubmitSearch={searchVideos}
            onClickDownloadSelectedVideos={downloadSelectedVideos}
            onClickCancelDownloads={cancelDownloads}
          />
        )
      case 1:
        return (
          <LabelWorkspace
            downloadedVideosData={downloadedVideosDb}
            videoUrls={downloadedVideoUrls}
            assignedVideoLabels={assignedVideoLabelsDb}
            projectLabels={projectConfig.labels}
            onAssignLabel={assignLabel}
            onDeleteAssignedLabel={deleteAssignedLabel}
            onVideoLabelsDone={onVideoLabelsDone}
            onClickExportLabels={exportAssignedLabels}
          />
        )
    }
  }

  return (
    <div className="ProjectScreen">
      {
        getWorkspace(workspace)
      }
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={isSnackbarOpen}
        onClose={closeSnackbar}
        message={snackbarMessage}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={closeSnackbar}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </div>
  )
}
