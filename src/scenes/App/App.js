import './App.css'

import React, { useState, useEffect } from 'react'
import youtubeSearch from 'youtube-search'

import TopBar from '../../components/TopBar/TopBar'
import SearchScene from '../SearchScene/SearchScene'
import LabelScene from '../LabelScene/LabelScene'

const { app } = require('electron').remote
const fs = require('fs')
const path = require('path')
const ytdl = require('ytdl-core')
const Store = require('electron-store')

const store = new Store()

export default function App() {

  const [candidateVideos, setCandidateVideos] = useState([])

  /*
    candidateVideo = {
      youtubeData: {},
      downloadState: 'none' / 'requested' / 'downloading' / 'downloaded'
      downloadPercent: 0,
      isSelected: false
    }
  */

  const [youtubeApiKey, setYoutubeApiKey] = useState('')
  useEffect(() => {
    setYoutubeApiKey(store.get('youtube-api-key', ''))
    setProjectLabels(store.get('project-labels', []))
  }, [])

  // Search videos with youtube data api
  function searchVideos(query) {
    if (!youtubeApiKey) {
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

  function handleDownloadVideoRequest(videoId) {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.youtubeData.id === videoId) ?
        { ...video, downloadState: 'requested' } :
        video
      )
    )
  }

  function downloadVideo(downloadVideoId) {

    onDownloadStart(downloadVideoId)

    const options = {
      quality: 'lowestvideo',
      filter: (format) => format.container === 'mp4'
    }

    const videoUrl = `http://www.youtube.com/watch?v=${downloadVideoId}`

    const videoPath = path.join(
      app.getPath('userData'),
      'downloaded_videos', 'videos_full', downloadVideoId + '.mp4'
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

  function onDownloadStart(videoId) {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.youtubeData.id === videoId) ?
        { ...video, downloadState: 'downloading' } :
        video
      )
    )
  }

  function onVideoDownloadProgress(videoId, percentage) {
    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.youtubeData.id === videoId) ?
        { ...video, downloadPercent: percentage } :
        video
      )
    )
  }

  function onVideoDownloaded(videoId) {
    let videoData = candidateVideos.find(video => video.youtubeData.id === videoId)

    setCandidateVideos(previousVideos =>
      previousVideos.map(video => (video.youtubeData.id === videoId) ?
        { ...video, downloadState: 'downloaded', isSelected: false, } :
        video
      ))

    // Save data for the downloaded videos
    let updatedDownloadedVideosData = store.get('downloaded-videos')

    updatedDownloadedVideosData.push({
      ...videoData,
      downloadState: 'downloaded',
      isSelected: false
    })

    store.set('downloaded-videos', updatedDownloadedVideosData)
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

  function handleCancelDownload(videoId) {
    // Set candidate videos download state
    // Cancel download stream
    // Delete video file if created
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

  function getVideoUrl(videoId) {
    let videoPath = path.join(
      app.getPath('userData'),
      'downloaded_videos',
      'videos_full',
      videoId + '.mp4'
    )
    return videoPath
  }

  // Read downloaded videos data from project
  const downloadedVideos = store.get('downloaded-videos', [])
  const downloadedVideoUrls = downloadedVideos.reduce((urlsObj, videoData) => (
    { ...urlsObj, [videoData.youtubeData.id]: getVideoUrl(videoData.youtubeData.id) }
  ), {})

  const [projectLabels, setProjectLabels] = useState(store.get('project-labels', []))
  function addProjectLabel(name) {
    const newProjectLabels = [...projectLabels, name]
    setProjectLabels(newProjectLabels)
    store.set('project-labels', newProjectLabels)
  }
  function deleteProjectLabel(name) {
    let newProjectLabels = projectLabels.filter(previousName => previousName !== name)
    setProjectLabels(newProjectLabels)
    store.set('project-labels', newProjectLabels)

    setAssignedVideoLabels(previous =>
      previous.map(videoLabel =>
        (
          {
            videoId: videoLabel.id,
            labels: videoLabel.labels.filter(label => label.name !== name)
          }
        )
      )
    )
  }

  const [assignedVideoLabels, setAssignedVideoLabels] = useState(
    downloadedVideos.map(videoData => ({ videoId: videoData.youtubeData.id, labels: [] }))
  )
  /*
  [
    {
      videoId: '',
      labels: []
    }
  ]
  */
  function assignLabel(videoId, label) {

    setAssignedVideoLabels(previous =>
      previous.map(videoLabel => (videoLabel.videoId === videoId) ?
        (
          {
            videoId: videoLabel.videoId,
            labels: [label, ...videoLabel.labels]
          }
        )
        :
        videoLabel
      )
    )
  }

  function deleteAssignedLabel(videoId, labelId) {

    setAssignedVideoLabels(previous =>
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

  function saveAssignedLabels() {
    const labelsPath = path.join(
      app.getPath('userData'),
      'project_data',
      'labels.json'
    )
    fs.writeFileSync(labelsPath, JSON.stringify(assignedVideoLabels))
  }

  // Scene setup
  const [currentScene, setCurrentScene] = useState(0)
  const getScene = (scene) => {
    switch (scene) {
      case 0:
        return (
          <SearchScene
            videos={candidateVideos}
            onCardClick={toggleVideoSelection}
            onSelectAll={selectAllVideos}
            onInvertSelection={invertSelectionAllVideos}
            onSubmitSearch={searchVideos}
            onDownloadVideoRequest={handleDownloadVideoRequest}
            onCancelDownload={handleCancelDownload}
            onClickDownloadSelectedVideos={downloadSelectedVideos}
          />
        )
      case 1:
        return (
          <LabelScene
            downloadedVideosData={downloadedVideos}
            videoUrls={downloadedVideoUrls}
            assignedVideoLabels={assignedVideoLabels}
            projectLabels={projectLabels}
            onAddProjectLabel={addProjectLabel}
            onDeleteProjectLabel={deleteProjectLabel}
            onAssignLabel={assignLabel}
            onDeleteAssignedLabel={deleteAssignedLabel}
            onClickSaveLabels={saveAssignedLabels}
          />
        )
    }
  }

  return (
    <div className="App">
      <TopBar onChangeScene={setCurrentScene} />

      {getScene(currentScene)}
    </div>
  )
}
