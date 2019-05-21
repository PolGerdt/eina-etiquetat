import './ProjectScreen.css'

import React, { useState, useEffect, useRef, useCallback } from 'react'

import { Snackbar, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

import SearchWorkspace from './SearchWorkspace'
import LabelWorkspace from './LabelWorkspace'

import youtubeSearch from 'youtube-search'
import JsonDB from 'node-json-db'

const { dialog } = require('electron').remote
const path = require('path')
const fs = require('fs')

const ytdl = require('ytdl-core')

var ffmpeg = require('ffmpeg')

let projectDataDb = null

function useProjectDataFieldDb(projectPath, field, defaultState) {

  const [fieldData, setFieldData] = useState(projectDataDb ? projectDataDb.getData('/' + field) : defaultState)

  useEffect(() => {
    if (projectPath) {
      projectDataDb = new JsonDB(path.join(projectPath, 'projectData.json'), true, true)
      projectDataDb.reload()

      setFieldData(projectDataDb.getData('/' + field))
    }
  }, [projectPath, field])

  useEffect(() => {
    if (projectDataDb) {
      projectDataDb.push('/' + field, fieldData)
    }
  }, [field, fieldData])

  return [fieldData, setFieldData]
}

export default function ProjectScreen({ youtubeApiKey, workspace, projectConfig, projectPath }) {

  const [candidateVideos, setCandidateVideos] = useState([])
  const [requestedVideos, setRequestedVideos] = useState([])
  const [downloadedVideosDb, setDownloadedVideosDb] = useProjectDataFieldDb(projectPath, 'downloadedVideos', [])
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

  // If path is changed reset candidate and requested videos
  useEffect(() => {
    setCandidateVideos([])
    setRequestedVideos([])
  }, [projectPath])

  // Search videos with the youtube data api
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
      displayMessageSnackbar('You need a Youtube Api Key to search. Set it in the app menu.')
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

    // Set state before starting the download to prevent multiple downloads
    setCandidateVideos(previousVideos => previousVideos.map(video => (video.youtubeData.id === downloadVideoId) ?
      { ...video, downloadState: 'downloading' } :
      video
    ))
    setRequestedVideos(previous => previous.map(video => (video.youtubeData.id === downloadVideoId) ?
      { ...video, downloadState: 'downloading' } :
      video
    ))

    const options = {
      quality: 'lowestvideo',
      filter: (format) => format.container === 'mp4'
    }

    const videoUrl = `http://www.youtube.com/watch?v=${downloadVideoId}`

    const videoPath = path.join(
      projectPath,
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
    setCandidateVideos(previousVideos => previousVideos.map(video => (video.youtubeData.id === videoId) ?
      { ...video, downloadPercent: percentage, downloadState: 'downloading' } :
      video
    ))

    setRequestedVideos(previous => previous.map(video => (video.youtubeData.id === videoId) ?
      { ...video, downloadPercent: percentage, downloadState: 'downloading' } :
      video
    ))
  }

  function onVideoDownloaded(videoId) {
    const videoData = requestedVideos.find(video => video.youtubeData.id === videoId)

    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.youtubeData.id === videoId) ?
        { ...video, downloadState: 'downloaded', downloadPercent: 1, isSelected: false } :
        video
      )
    )

    setRequestedVideos(previous =>
      previous.map(video => (video.youtubeData.id === videoId) ?
        { ...video, downloadState: 'downloaded', downloadPercent: 1, isSelected: false } :
        video
      )
    )

    setDownloadedVideosDb(previous =>
      [
        ...previous,
        { ...videoData, downloadState: 'downloaded', downloadPercent: 1, isSelected: false }
      ]
    )

    // Add an empty assignedLabels object
    setAssignedVideoLabelsDb(previous => [...previous, { videoId, labels: [], isDone: false, isVideoSegmented: false }])
  }

  const nextRequestedVideo = requestedVideos.find(video => video.downloadState === 'requested')

  const downloadingVideo = requestedVideos.find(video => video.downloadState === 'downloading')

  if (downloadingVideo === undefined && nextRequestedVideo) {
    downloadVideo(nextRequestedVideo.youtubeData.id)
  }

  // Set all selected videos to requested download state
  function downloadSelectedVideos() {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.isSelected) ?
        { ...video, downloadState: 'requested', isSelected: false } :
        video
      )
    )

    const selectedVideos = candidateVideos
      .filter(video => video.isSelected)
      .map(video => ({ ...video, downloadState: 'requested', isSelected: false }))

    setRequestedVideos(previous => [...selectedVideos, ...previous])
  }

  function cancelDownloads() {
    const downloadingVideo = candidateVideos.find(video => video.downloadState === 'downloading')
    if (downloadingVideo) {
      setCandidateVideos(previousVideos =>
        previousVideos.map(video => ({ ...video, downloadState: 'none', downloadPercent: 0 }))
      )

      setRequestedVideos(previous =>
        previous.map(video => ({ ...video, downloadState: 'none', downloadPercent: 0 }))
      )

      fs.unlinkSync(getVideoUrl(downloadingVideo.youtubeData.id))

      ytWriteableStream.current.destroy()
      ytReadableStream.current.destroy()
    }
  }

  const [assignedVideoLabelsDb, setAssignedVideoLabelsDb] = useProjectDataFieldDb(projectPath, 'assignedLabels', [])
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
            ...videoLabel,
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
      defaultPath: projectPath,
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

  const getVideoUrl = useCallback(
    (videoId) => {
      const videoPath = path.join(projectPath, 'videos_full', videoId + '.mp4')
      return videoPath
    }
    , [projectPath]
  )

  /*function getVideoUrl(videoId) {
    const videoPath = path.join(projectPath, 'videos_full', videoId + '.mp4')
    return videoPath
  }*/

  const downloadedVideoUrls = downloadedVideosDb.reduce((urlsObj, videoData) => (
    { ...urlsObj, [videoData.youtubeData.id]: getVideoUrl(videoData.youtubeData.id) }
  ), {})

  const [isTrimming, setIsTrimming] = useState(false)
  useEffect(() => {
    function trimVideoSegment(assignedLabels) {

      const videoSegmentsPath = path.join(projectPath, 'videos_segments', assignedLabels.videoId)

      if (!fs.existsSync(videoSegmentsPath))
        fs.mkdirSync(videoSegmentsPath)

      const process = new ffmpeg(getVideoUrl(assignedLabels.videoId))

      // "-ss", "00:00:38", "-i", "vid0.mp4", "-to", "00:00:04", "-c", "copy", "vid0_3842.mp4"

      process.then(function (video) {

        let segmentsCreated = 0

        assignedLabels.labels.forEach((label) => {
          const segmentName = `${assignedLabels.videoId}_${label.labelName}_${Math.floor(1000 * label.inTime)}-${Math.floor(1000 * label.outTime)}.mp4`

          video
            .setVideoStartTime('00:00:' + label.inTime.toFixed(3))
            .setVideoDuration('00:00:' + (label.outTime - label.inTime).toFixed(3))
            .save(path.join(videoSegmentsPath, segmentName), function (error, file) {
              if (!error) {
                console.log('Video file: ' + file);

                segmentsCreated++

                if (segmentsCreated === assignedLabels.labels.length) {
                  setAssignedVideoLabelsDb(previous =>
                    previous.map(videoLabels => (videoLabels.videoId === assignedLabels.videoId) ?
                      { ...videoLabels, isVideoSegmented: true } :
                      videoLabels
                    )
                  )
                }
              } else {
                console.log(error)
              }
            })
        })

      }, function (err) {
        console.log('Error: ' + err)
      })
    }

    if (isTrimming) {
      const nextVideoLabels = assignedVideoLabelsDb.find(labels => labels.isDone && !labels.isVideoSegmented)
      if (nextVideoLabels) {
        displayMessageSnackbar('Creating segments...')
        trimVideoSegment(nextVideoLabels)
      } else {
        displayMessageSnackbar('Segments saved to your project folder.')
        setIsTrimming(false)
      }
    }
  }, [assignedVideoLabelsDb, setAssignedVideoLabelsDb, isTrimming, projectPath, getVideoUrl])

  // Trim videos with done assigned labels
  function onClickTrimSegments() {
    setIsTrimming(true)
  }


  // Scene setup
  const getWorkspace = (workspace) => {
    switch (workspace) {
      case 0:
        return (
          <SearchWorkspace
            videos={candidateVideos}
            requestedVideos={requestedVideos}
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
            onClickTrimSegments={onClickTrimSegments}
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
