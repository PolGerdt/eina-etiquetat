import './ProjectScreen.css'

import React, { useState, useEffect } from 'react'

import TopBar from '../components/TopBar'
import SearchWorkspace from './SearchWorkspace'
import LabelWorkspace from './LabelWorkspace'

import youtubeSearch from 'youtube-search'
import JsonDB from 'node-json-db'

const { app, dialog } = require('electron').remote
const path = require('path')
const fs = require('fs')

const ytdl = require('ytdl-core')

const projectDataDb = new JsonDB(path.join(app.getPath('userData'), 'projectData.json'), true, false)

function useProjectDataFieldDb(field, defaultState) {

  const [fieldData, setFieldData] = useState(projectDataDb.getData('/' + field) || defaultState)

  useEffect(() => {
    projectDataDb.push('/' + field, fieldData)
  }, [field, fieldData])

  return [fieldData, setFieldData]
}

export default function ProjectScreen({ youtubeApiKey }) {

  const [candidateVideos, setCandidateVideos] = useState([])
  /*
    candidateVideo = {
      youtubeData: {},
      downloadState: 'none' / 'requested' / 'downloading' / 'downloaded'
      downloadPercent: 0,
      isSelected: false
    }
  */

  // Get all stored data from the app (api key) and from the project (name, labels, folder)
  const [projectConfigDb, setProjectConfigDb] = useProjectDataFieldDb('config', {})
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
  const [assignedVideoLabelsDb, setAssignedVideoLabelsDb] = useProjectDataFieldDb('assignedLabels', [])
  /*
  [
    {
      videoId: '',
      labels: []
    }
  ]
  */

  // Search videos with youtube data api
  function searchVideos(query) {
    if (!youtubeApiKey) return

    var opts = {
      key: youtubeApiKey,
      maxResults: 10,
      type: 'video',
      videoDuration: 'short',
      ...query.options
    }

    youtubeSearch(query.text, opts, function (err, youtubeResults) {
      if (err) throw err

      let searchCandidateVideos = youtubeResults.map(result => (
        {
          youtubeData: result,
          downloadState: 'none',
          downloadPercent: 0,
          isSelected: false
        }
      ))

      setCandidateVideos(searchCandidateVideos)
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

    const ytStream = ytdl(videoUrl, options)

    ytStream.pipe(fs.createWriteStream(videoPath))

    ytStream.on('progress', (chunkLength, downloaded, total) => {
      const percent = downloaded / total
      onVideoDownloadProgress(downloadVideoId, percent)
    })

    ytStream.on('end', () => {
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
        { ...video, downloadState: 'downloaded', isSelected: false } :
        video
      ))

    setDownloadedVideosDb(previous =>
      [
        ...previous,
        {
          ...videoData,
          downloadState: 'downloaded',
          isSelected: false
        }
      ]
    )
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

  // Creates a labels object if it does not exist or appends the new label to existing 
  function assignLabel(videoId, label) {
    setAssignedVideoLabelsDb(previous => {
      const videoAssignedLabels = previous.find(videoLabel => videoLabel.videoId === videoId)

      if (videoAssignedLabels === undefined) {
        return [...previous, { videoId, labels: [label] }]
      } else {
        return previous.map(videoLabel => (videoLabel.videoId === videoId) ?
          ({ videoId: videoLabel.videoId, labels: [label, ...videoLabel.labels] }) :
          videoLabel
        )
      }
    }
    )
  }

  function deleteAssignedLabel(videoId, labelId) {

    setAssignedVideoLabelsDb(previous =>
      previous.map(videoLabel => (videoLabel.videoId === videoId) ?
        (
          {
            videoId: videoLabel.videoId,
            labels: videoLabel.labels.filter(label => label.id !== labelId)
          }
        )
        :
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
      fs.writeFileSync(filename, JSON.stringify(assignedVideoLabelsDb))
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
  const [currentScene, setCurrentScene] = useState(0)
  const getScene = (scene) => {
    switch (scene) {
      case 0:
        return (
          <SearchWorkspace
            videos={candidateVideos}
            onCardClick={toggleVideoSelection}
            onSelectAll={selectAllVideos}
            onInvertSelection={invertSelectionAllVideos}
            onSubmitSearch={searchVideos}
            onClickDownloadSelectedVideos={downloadSelectedVideos}
          />
        )
      case 1:
        return (
          <LabelWorkspace
            downloadedVideosData={downloadedVideosDb}
            videoUrls={downloadedVideoUrls}
            assignedVideoLabels={assignedVideoLabelsDb}
            projectLabels={projectConfigDb.labels}
            onAssignLabel={assignLabel}
            onDeleteAssignedLabel={deleteAssignedLabel}
            onClickExportLabels={exportAssignedLabels}
          />
        )
    }
  }

  return (
    <div className="ProjectScreen">
      <TopBar title={projectConfigDb.name} onChangeScene={setCurrentScene} />
      {
        getScene(currentScene)
      }
    </div>
  )
}
