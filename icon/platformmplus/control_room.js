var iconElements = require('./icon_elements.js')
var clearAllLeds = iconElements.clearAllLeds
var master_controls = require('./master_controls.js')

module.exports = {
  makePage: makePage
}

function clearChannelState(/** @type {MR_ActiveDevice} */activeDevice) {
  var activePage = activeDevice.getState("activePage")
  var activeSubPage = activeDevice.getState("activeSubPage")
  // console.log('from script: clearChannelState'+activePage)

  activeDevice.setState(activePage + "- " + activeSubPage + ' - Fader - Title', "")
  activeDevice.setState(activePage + "- " + activeSubPage + ' - Fader - ValueTitles', "")
  activeDevice.setState(activePage + "- " + activeSubPage + ' - Fader - Values', "")
  activeDevice.setState(activePage + "- " + activeSubPage + ' - Pan - Title', "")
  activeDevice.setState(activePage + "- " + activeSubPage + ' - Pan - ValueTitles', "")
  activeDevice.setState(activePage + "- " + activeSubPage + ' - Pan - Values', "")

  activeDevice.setState("displayType", "Fader")
}
function makePage(surfaceElements, deviceDriver, midiOutput) {
  var page = master_controls.makePageWithDefaults('ControlRoom', surfaceElements, deviceDriver, midiOutput)

  var controlRoom = page.mHostAccess.mControlRoom

  // Main
  page.makeValueBinding(surfaceElements.channelControls[0].fader.mSurfaceValue, controlRoom.mMainChannel.mLevelValue).setValueTakeOverModeJump()
  page.makeValueBinding(surfaceElements.channelControls[0].mute_button.mSurfaceValue, controlRoom.mMainChannel.mMuteValue).setTypeToggle()
  page.makeValueBinding(surfaceElements.channelControls[0].sel_button.mSurfaceValue, controlRoom.mMainChannel.mMetronomeClickActiveValue).setTypeToggle()
  // Phones[0]
  page.makeValueBinding(surfaceElements.channelControls[1].fader.mSurfaceValue, controlRoom.getPhonesChannelByIndex(0).mLevelValue).setValueTakeOverModeJump()
  page.makeValueBinding(surfaceElements.channelControls[1].mute_button.mSurfaceValue, controlRoom.getPhonesChannelByIndex(0).mMuteValue).setTypeToggle()
  page.makeValueBinding(surfaceElements.channelControls[1].sel_button.mSurfaceValue, controlRoom.getPhonesChannelByIndex(0).mMetronomeClickActiveValue).setTypeToggle()

  var maxCueSends = controlRoom.getMaxCueChannels() < 8 ? controlRoom.getMaxCueChannels() : 8

  for (var i = 0; i < maxCueSends; ++i) {
      var cueSend = controlRoom.getCueChannelByIndex(i)

      var knobSurfaceValue = surfaceElements.channelControls[i].pushEncoder.mEncoderValue;
      var knobPushValue = surfaceElements.channelControls[i].pushEncoder.mPushValue;

      page.makeValueBinding(knobSurfaceValue, cueSend.mLevelValue)
      page.makeValueBinding(knobPushValue, cueSend.mMuteValue).setTypeToggle()

  }

  page.mOnActivate = function (/** @type {MR_ActiveDevice} */activeDevice) {
      // console.log('from script: Platform M+ page "ControlRoom" activated')
      activeDevice.setState("activePage", "ControlRoom")
      activeDevice.setState("activeSubPage", "Default")
      clearAllLeds(activeDevice, midiOutput)
      clearChannelState(activeDevice)
  }

  return page
}