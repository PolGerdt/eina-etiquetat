import './ProjectScreen.css'

import React, { useState, useEffect, useRef, useCallback } from 'react'

import { Snackbar, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

import SearchWorkspace from './SearchWorkspace'
import LabelWorkspace from './LabelWorkspace'
import ProjectStatsDialog from '../components/ProjectStatsDialog'

import youtubeSearch from 'youtube-search'
import JsonDB from 'node-json-db'

const { dialog } = require('electron').remote
const path = require('path')
const fs = require('fs')

const ytdl = require('ytdl-core')

const { spawn } = require('child_process')

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

export default function ProjectScreen({ youtubeApiKey, workspace, projectConfig, projectPath, isShowingStatsDialog, onCloseStatsDialog }) {

  const [candidateVideos, setCandidateVideos] = useState([])
  const [requestedVideos, setRequestedVideos] = useState([])
  const [downloadedVideosDb, setDownloadedVideosDb] = useProjectDataFieldDb(projectPath, 'downloadedVideos', [])
  /*
  [
    {
      youtubeData: {},
      downloadState: downloaded, // none / downloading / downloaded
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
      previousVideos.map(video => ({ ...video, isSelected: true }))
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
    const isVideoDownloaded = downloadedVideosDb.find(vid => vid.youtubeData.id === downloadVideoId) !== undefined

    // If its already downloaded update info for candidate and requested videos and return
    if (isVideoDownloaded) {
      setRequestedVideos(previous => previous.filter(video => video.youtubeData.id !== downloadVideoId))
      setCandidateVideos(previous => previous.map(video => video.youtubeData.id === downloadVideoId ?
        { ...video, downloadState: 'downloaded', downloadPercent: 1 } : video
      ))
      return
    }

    // Set state before starting the download to prevent multiple downloads
    setCandidateVideos(previousVideos => previousVideos.map(video => (video.youtubeData.id === downloadVideoId) ?
      { ...video, downloadState: 'downloading' } : video
    ))
    setRequestedVideos(previous => previous.map(video => (video.youtubeData.id === downloadVideoId) ?
      { ...video, downloadState: 'downloading' } : video
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

    // If there is an error reset video state
    ytReadableStream.current.on('error', () => {
      setCandidateVideos(previousVideos => previousVideos.map(video => (video.youtubeData.id === downloadVideoId) ?
        { ...video, downloadState: 'requested' } : video
      ))
      setRequestedVideos(previous => previous.map(video => (video.youtubeData.id === downloadVideoId) ?
        { ...video, downloadState: 'requested' } : video
      ))
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

    setRequestedVideos(previous => previous.filter(video => video.youtubeData.id !== videoId))

    setDownloadedVideosDb(previous =>
      [
        ...previous,
        { ...videoData, downloadState: 'downloaded', downloadPercent: 1, isSelected: false }
      ]
    )

    // Add an empty assignedLabels object
    setAllAssignedLabelsDb(previous => [...previous, { videoId, labels: [], isDone: false }])
  }

  const nextRequestedVideo = requestedVideos.find(video => video.downloadState === 'requested')

  const downloadingVideo = requestedVideos.find(video => video.downloadState === 'downloading')

  if (nextRequestedVideo && downloadingVideo === undefined) {
    downloadVideo(nextRequestedVideo.youtubeData.id)
  }

  // Set all selected videos to requested download state
  function downloadSelectedVideos() {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.isSelected && video.downloadState === 'none') ?
        { ...video, downloadState: 'requested', isSelected: false } :
        video
      )
    )

    const selectedVideos = candidateVideos
      .filter(video => video.isSelected)
      .map(video => ({ ...video, downloadState: 'requested', isSelected: false }))

    setRequestedVideos(previous => [...selectedVideos, ...previous])
  }

  // Destroy download streams, reset state from candidates and remove from requested videos
  function cancelDownloads() {
    const downloadingVideos = requestedVideos.filter(video => video.downloadState === 'downloading')

    if (downloadingVideos) {
      setCandidateVideos(previousVideos =>
        previousVideos.map(video => video.downloadState === 'downloading' || video.downloadState === 'requested' ?
          ({ ...video, downloadState: 'none', downloadPercent: 0 }) :
          video
        )
      )

      setRequestedVideos([])

      fs.unlinkSync(getVideoUrl(downloadingVideo.youtubeData.id))

      ytWriteableStream.current.destroy()
      ytReadableStream.current.destroy()
    }
  }

  const [allAssignedLabelsDb, setAllAssignedLabelsDb] = useProjectDataFieldDb(projectPath, 'assignedLabels', [])
  /*
  [
    {
      videoId: '',
      labels: [{id, labelName, inTime, outTime}],
      isDone: false
    }
  ]
  */

  // Creates a labels object if it does not exist or appends the new label
  function assignLabel(videoId, label) {
    setAllAssignedLabelsDb(previous =>
      previous.map(videoLabels => (videoLabels.videoId === videoId) ?
        (
          {
            ...videoLabels,
            labels: [label, ...videoLabels.labels],
            isDone: false
          }
        ) :
        videoLabels
      )
    )
  }

  function deleteAssignedLabel(videoId, labelId) {
    setAllAssignedLabelsDb(previous =>
      previous.map(videoLabels => (videoLabels.videoId === videoId) ?
        (
          {
            ...videoLabels,
            labels: videoLabels.labels.filter(label => label.id !== labelId),
            isDone: false
          }
        ) :
        videoLabels
      )
    )
  }

  function onVideoLabelsDone(videoId) {
    setAllAssignedLabelsDb(previous =>
      previous.map(videoLabels => (videoLabels.videoId === videoId) ?
        ({ ...videoLabels, isDone: true }) :
        videoLabels
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
        // Export only done video labels removing the isDone property
        const finishedLabels = allAssignedLabelsDb
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

  const downloadedVideoUrls = downloadedVideosDb.reduce((urlsObj, videoData) => (
    { ...urlsObj, [videoData.youtubeData.id]: getVideoUrl(videoData.youtubeData.id) }
  ), {})

  // Reduce 2D array of labels [video0 : { labels: []}, video1: { labels: []}...] to promises and resolve sequentially
  function trimSegmentsPromise(doneLabels) {

    return doneLabels.reduce((videoPromise, videoLabels) => {

      return videoPromise.then(() => {

        const inputVideoPath = getVideoUrl(videoLabels.videoId)

        const videoSegmentsPath = path.join(projectPath, 'video_segments', videoLabels.videoId)

        if (!fs.existsSync(videoSegmentsPath)) fs.mkdirSync(videoSegmentsPath)

        return videoLabels.labels.reduce((labelPromise, label) => {

          return labelPromise.then(() => {

            return new Promise((resolve, reject) => {
              const segmentName = `${videoLabels.videoId}_${label.labelName}_${Math.floor(1000 * label.inTime)}-${Math.floor(1000 * label.outTime)}.mp4`
              const segmentPath = path.join(videoSegmentsPath, segmentName)

              const process = spawn('ffmpeg',
                ["-ss", label.inTime, "-i", inputVideoPath, "-to", label.outTime - label.inTime, "-c", "copy", segmentPath, "-hide_banner"]
              )

              process.on('exit', (statusCode) => {
                if (statusCode === 0) {
                  console.log('segment saved')
                  resolve()
                }
              })

              process.stderr.on('data', (err) => {
                console.log(String(err))
                reject()
              })
            })
          }).catch(err => console.log(err))
        }, Promise.resolve())
      }).catch(err => console.log(err))
    }, Promise.resolve())
  }

  // Trim videos with done assigned labels
  function onClickTrimSegments() {
    const doneLabels = allAssignedLabelsDb.filter(videoLabels => videoLabels.isDone)
    if (doneLabels.length > 0) {
      displayMessageSnackbar('Trimming videos...')
      trimSegmentsPromise(doneLabels).then(() => {
        displayMessageSnackbar('Segments saved to your project folder...')
      })
    }
  }

  // Extract frames from each video and label at a framerate
  function extractFramesFpsPromise(doneLabels, fps = 1) {

    return doneLabels.reduce((videoPromise, videoLabels) => {

      return videoPromise.then(() => {

        const inputVideoPath = getVideoUrl(videoLabels.videoId)

        const videoSegmentsPath = path.join(projectPath, 'extracted_frames', videoLabels.videoId)
        if (!fs.existsSync(videoSegmentsPath)) fs.mkdirSync(videoSegmentsPath)

        return videoLabels.labels.reduce((labelPromise, label) => {

          return labelPromise.then(() => {

            const videoLabelPath = path.join(videoSegmentsPath, label.labelName + '_' + label.id)
            if (!fs.existsSync(videoLabelPath)) fs.mkdirSync(videoLabelPath)

            return new Promise((resolve, reject) => {
              const segmentName = `${videoLabels.videoId}_${label.labelName}_${Math.floor(1000 * label.inTime)}-${Math.floor(1000 * label.outTime)}_%03d.jpg`
              const segmentPath = path.join(videoLabelPath, segmentName)

              const process = spawn('ffmpeg',
                ["-ss", label.inTime, "-i", inputVideoPath, "-to", label.outTime - label.inTime, "-vf", `fps=${fps}`, segmentPath, "-hide_banner"]
              )

              process.on('exit', (statusCode) => {
                if (statusCode === 0) {
                  console.log('frames saved')
                  resolve()
                }
              })

              process.stderr.on('data', (err) => {
                console.log(String(err))
                reject()
              })
            })
          }).catch(err => console.log(err))
        }, Promise.resolve())
      })
    }, Promise.resolve())
  }

  function onClickExtractFramesFps(fps) {
    const doneLabels = allAssignedLabelsDb.filter(videoLabels => videoLabels.isDone)
    if (doneLabels.length > 0) {
      displayMessageSnackbar('Extracting frames...')
      extractFramesFpsPromise(doneLabels, fps).then(() => {
        displayMessageSnackbar('Frames extracted to your project folder.')
      })
    }
  }

  // Extract N frames for each label and video
  function extractNFramesPromise(doneLabels, numFrames) {

    return doneLabels.reduce((videoPromise, videoLabels) => {

      return videoPromise.then(() => {

        const inputVideoPath = getVideoUrl(videoLabels.videoId)

        const videoSegmentsPath = path.join(projectPath, 'extracted_frames', videoLabels.videoId)
        if (!fs.existsSync(videoSegmentsPath)) fs.mkdirSync(videoSegmentsPath)

        return videoLabels.labels.reduce((labelPromise, label) => {

          return labelPromise.then(() => {

            const videoLabelPath = path.join(videoSegmentsPath, label.labelName + '_' + label.id)
            if (!fs.existsSync(videoLabelPath)) fs.mkdirSync(videoLabelPath)

            return new Promise((resolve, reject) => {
              const segmentName = `${videoLabels.videoId}_${label.labelName}_${Math.floor(1000 * label.inTime)}-${Math.floor(1000 * label.outTime)}_%03d.jpg`
              const segmentPath = path.join(videoLabelPath, segmentName)

              const fps = numFrames / (label.outTime - label.inTime)

              const process = spawn('ffmpeg',
                ["-ss", label.inTime, "-i", inputVideoPath, "-to", label.outTime - label.inTime, "-vf", `fps=${fps}`, segmentPath, "-hide_banner"]
              )

              process.on('exit', (statusCode) => {
                if (statusCode === 0) {
                  console.log('frames saved')
                  resolve()
                }
              })

              process.stderr.on('data', (err) => {
                console.log(String(err))
                reject()
              })
            })
          }).catch(err => console.log(err))
        }, Promise.resolve())
      })
    }, Promise.resolve())
  }

  function onClickExtractNFrames(num) {
    const doneLabels = allAssignedLabelsDb.filter(videoLabels => videoLabels.isDone)
    if (doneLabels.length > 0) {
      displayMessageSnackbar('Extracting frames...')
      extractNFramesPromise(doneLabels, num).then(() => {
        displayMessageSnackbar('Frames extracted to your project folder.')
      })
    }
  }

  // Delete a downloaded video from disc and database and delete assigned labels
  function deleteDownloadedVideo(videoId) {
    const videoPath = getVideoUrl(videoId)
    const videoExists = fs.existsSync(videoPath)

    if (videoExists) {
      fs.unlinkSync(videoPath)
      setDownloadedVideosDb(previous => previous.filter(video => video.youtubeData.id !== videoId))
      setAllAssignedLabelsDb(previous => previous.filter(label => label.videoId !== videoId))
    }
  }

  const [isOneLabelMode, setIsOneLabelMode] = useState(false)
  function onClickOneLabelMode(value) {
    setIsOneLabelMode(value)
  }

  const [numCols, setNumCols] = useState(2)
  function onChangeNumCols(num) {
    setNumCols(num)
  }

  // Scene setup
  const getWorkspace = (workspace) => {
    switch (workspace) {
      case 0:
        return (
          <SearchWorkspace
            videos={candidateVideos}
            numCols={numCols}
            requestedVideos={requestedVideos}
            onCardClick={toggleVideoSelection}
            onSelectAll={selectAllVideos}
            onInvertSelection={invertSelectionAllVideos}
            onSubmitSearch={searchVideos}
            onChangeNumCols={onChangeNumCols}
            onClickDownloadSelectedVideos={downloadSelectedVideos}
            onClickCancelDownloads={cancelDownloads}
          />
        )
      case 1:
        return (
          <LabelWorkspace
            downloadedVideosData={downloadedVideosDb}
            videoUrls={downloadedVideoUrls}
            assignedVideoLabels={allAssignedLabelsDb}
            projectLabels={projectConfig.labels}
            isOneLabelMode={isOneLabelMode}
            onAssignLabel={assignLabel}
            onDeleteAssignedLabel={deleteAssignedLabel}
            onVideoLabelsDone={onVideoLabelsDone}
            onClickExportLabels={exportAssignedLabels}
            onClickTrimSegments={onClickTrimSegments}
            onClickOneLabelMode={onClickOneLabelMode}
            onClickExtractFramesFps={onClickExtractFramesFps}
            onClickExtractNFrames={onClickExtractNFrames}
            onDeleteVideo={deleteDownloadedVideo}
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
      <ProjectStatsDialog
        onClose={onCloseStatsDialog}
        isOpen={isShowingStatsDialog}
        downloadedVideos={downloadedVideosDb}
        assignedLabels={allAssignedLabelsDb}
      />
    </div>
  )
}
