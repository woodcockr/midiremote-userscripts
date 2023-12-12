var iconElements = require('./icon_elements.js')

module.exports = {
  makePageWithDefaults: makePageWithDefaults

}

/**
 * @param {string} name
*/
// Mappings for the default areas - transport, zoom, knob
function makePageWithDefaults(name, surfaceElements, deviceDriver, midiOutput) {
  var page = deviceDriver.mMapping.makePage(name)


  var jogSubPageArea = page.makeSubPageArea('Jog')
  var zoomSubPageArea = page.makeSubPageArea('Zoom')

  var subPageJogNudge = jogSubPageArea.makeSubPage('Nudge')
  subPageJogNudge.mOnActivate = function (/** @type {MR_ActiveDevice} **/activeDevice) {
    console.log('Nudge activated')
    iconElements.updateDisplay('', '', '', 'N', activeDevice, midiOutput)
  }

  var subPageJogScrub = jogSubPageArea.makeSubPage('Scrub')
  subPageJogScrub.mOnActivate = function (/** @type {MR_ActiveDevice} **/activeDevice) {
    console.log('Scrub activated')
    iconElements.updateDisplay('', '', '', 'S', activeDevice, midiOutput)
  }

  var subPageJogZoom = zoomSubPageArea.makeSubPage('Zoom')
  subPageJogZoom.mOnActivate = function (/** @type {MR_ActiveDevice} **/activeDevice) {
    console.log('Zoom activated')
    iconElements.updateDisplay('', '', 'Z', '', activeDevice, midiOutput)
  }

  var subPageJobNav = zoomSubPageArea.makeSubPage('Nav')
  subPageJobNav.mOnActivate = function (/** @type {MR_ActiveDevice} **/activeDevice) {
    iconElements.updateDisplay('', '', 'N', '', activeDevice, midiOutput)
  }

  // Transport controls
  page.makeActionBinding(surfaceElements.transport.prevChn.mSurfaceValue, deviceDriver.mAction.mPrevPage)
  page.makeActionBinding(surfaceElements.transport.nextChn.mSurfaceValue, deviceDriver.mAction.mNextPage)
  page.makeCommandBinding(surfaceElements.transport.prevBnk.mSurfaceValue, 'Transport', 'Locate Previous Marker')
  page.makeCommandBinding(surfaceElements.transport.nextBnk.mSurfaceValue, 'Transport', 'Locate Next Marker')
  page.makeValueBinding(surfaceElements.transport.btnForward.mSurfaceValue, page.mHostAccess.mTransport.mValue.mForward)
  page.makeValueBinding(surfaceElements.transport.btnRewind.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRewind)
  page.makeValueBinding(surfaceElements.transport.btnStart.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStart).setTypeToggle()
  page.makeValueBinding(surfaceElements.transport.btnStop.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStop).setTypeToggle()
  page.makeValueBinding(surfaceElements.transport.btnRecord.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRecord).setTypeToggle()
  page.makeValueBinding(surfaceElements.transport.btnCycle.mSurfaceValue, page.mHostAccess.mTransport.mValue.mCycleActive).setTypeToggle()

  // Zoom Pages - when either Zoom light is on
  page.makeCommandBinding(surfaceElements.transport.zoomVertIn.mSurfaceValue, 'Zoom', 'Zoom In Vertically').setSubPage(subPageJogZoom)
  page.makeCommandBinding(surfaceElements.transport.zoomVertOut.mSurfaceValue, 'Zoom', 'Zoom Out Vertically').setSubPage(subPageJogZoom)
  page.makeCommandBinding(surfaceElements.transport.zoomHorizIn.mSurfaceValue, 'Zoom', 'Zoom In').setSubPage(subPageJogZoom)
  page.makeCommandBinding(surfaceElements.transport.zoomHorizOut.mSurfaceValue, 'Zoom', 'Zoom Out').setSubPage(subPageJogZoom)
  // Nav Pages
  page.makeActionBinding(surfaceElements.transport.zoomVertIn.mSurfaceValue, page.mHostAccess.mTrackSelection.mAction.mNextTrack).setSubPage(subPageJobNav)
  page.makeActionBinding(surfaceElements.transport.zoomVertOut.mSurfaceValue, page.mHostAccess.mTrackSelection.mAction.mPrevTrack).setSubPage(subPageJobNav)
  page.makeCommandBinding(surfaceElements.transport.zoomHorizIn.mSurfaceValue, 'Transport', 'Locate Next Event').setSubPage(subPageJobNav)
  page.makeCommandBinding(surfaceElements.transport.zoomHorizOut.mSurfaceValue, 'Transport', 'Locate Previous Event').setSubPage(subPageJobNav)
  // Switch Zoom and Nav via simultaneous press of Zoom buttons
  page.makeActionBinding(surfaceElements.transport.btnZoomOnOff.mSurfaceValue, zoomSubPageArea.mAction.mNext)
  // page.makeActionBinding(surfaceElements.transport.zoomState.mSurfaceValue, zoomSubPageArea.mAction.mNext)

  // Jog Pages - when Zoom lights are off
  // Nudge
  page.makeCommandBinding(surfaceElements.transport.jogLeftVariable, 'Transport', 'Nudge Cursor Left').setSubPage(subPageJogNudge)
  page.makeCommandBinding(surfaceElements.transport.jogRightVariable, 'Transport', 'Nudge Cursor Right').setSubPage(subPageJogNudge)
  // Scrub (Jog in Cubase)
  page.makeCommandBinding(surfaceElements.transport.jogLeftVariable, 'Transport', 'Jog Left').setSubPage(subPageJogScrub)
  page.makeCommandBinding(surfaceElements.transport.jogRightVariable, 'Transport', 'Jog Right').setSubPage(subPageJogScrub)
  // Switch between Nudge and Scrub by tapping knob
  page.makeActionBinding(surfaceElements.transport.jog_wheel.mPushValue, jogSubPageArea.mAction.mNext)

  var MasterFaderSubPageArea = page.makeSubPageArea('MasterFader')
  var subPageMasterFaderValue = MasterFaderSubPageArea.makeSubPage('MF_ValueUnderCursor')

  page.makeValueBinding(surfaceElements.faderMaster.fader.mSurfaceValue, page.mHostAccess.mMouseCursor.mValueUnderMouse).setValueTakeOverModeJump().setSubPage(subPageMasterFaderValue)

  // Automation for selected tracks
  var selectedTrackChannel = page.mHostAccess.mTrackSelection.mMixerChannel

  // Automation for selected tracks
  page.makeValueBinding(surfaceElements.faderMaster.read_button.mSurfaceValue, selectedTrackChannel.mValue.mAutomationRead).setTypeToggle()
  page.makeValueBinding(surfaceElements.faderMaster.write_button.mSurfaceValue, selectedTrackChannel.mValue.mAutomationWrite).setTypeToggle()

  // Mixer Button
  // WIP Make this a per page thing not a default - pages can better track the specific use of this button
  // var display_type = page.mCustom.makeHostValueVariable("Mixer - display type")
  // page.makeValueBinding(surfaceElements.faderMaster.mixer_button.mSurfaceValue, display_type).setTypeToggle().mOnValueChange = function (/** @type {MR_ActiveDevice} **/activeDevice, mapping, value, value2) {
  //     // console.log("display_type OnValueChange:"+value+":"+value2)
  //     if(value===0)
  //     {
  //         activeDevice.setState("displayType", "Fader")
  //     } else {
  //         activeDevice.setState("displayType", "Pan")
  //     }
  //     // Update controller
  //     Helper_updateDisplay(activeDevice.getState('Display - idRow1'), activeDevice.getState('Display - idRow2'), activeDevice.getState('Display - idAltRow1'), activeDevice.getState('Display - idAltRow2'), activeDevice, midiOutput)
  // }

  return page
}