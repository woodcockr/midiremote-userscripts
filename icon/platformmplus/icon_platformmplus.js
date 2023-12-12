// Icon Platform M+ midi Remote
// Robert Woodcock
//
// Portions of this implementation where inspired by other midi remote creates to whom I wish to say thank you!
// - Mackie C4 by Ron Garrison <ron.garrison@gmail.com> https://github.com/rwgarrison/midiremote-userscripts

var config = require('./config.js')
var iconElements = require('./icon_elements.js')
var makeChannelControl = iconElements.makeChannelControl
var makeMasterControl = iconElements.makeMasterControl
var makeTransport = iconElements.makeTransport
var clearAllLeds = iconElements.clearAllLeds
var updateDisplay = iconElements.updateDisplay
var Helper_updateDisplay = iconElements.Helper_updateDisplay

var helper = require('./helper.js')
var makeLabel = helper.display.makeLabel
var setTextOfColumn = helper.display.setTextOfColumn
var setTextOfLine = helper.display.setTextOfLine

var master_controls = require('./master_controls.js')
var control_room = require('./control_room.js')
//-----------------------------------------------------------------------------
// 1. DRIVER SETUP - create driver object, midi ports and detection information
//-----------------------------------------------------------------------------

// get the api's entry point
var midiremote_api = require('midiremote_api_v1')

// create the device driver main object
var deviceDriver = midiremote_api.makeDeviceDriver('Icon', 'Platform Mplus', 'Big Fat Wombat')

// create objects representing the hardware's MIDI ports
var midiInput = deviceDriver.mPorts.makeMidiInput('Platform M+')
var midiOutput = deviceDriver.mPorts.makeMidiOutput('Platform M+')
var midiPageInput = deviceDriver.mPorts.makeMidiInput('Icon CC')
var midiPageOutput = deviceDriver.mPorts.makeMidiOutput('Icon CC')

deviceDriver.mOnActivate = function (activeDevice) {
    console.log('Icon Platform M+ Activated');
    clearAllLeds(activeDevice, midiOutput)
    activeDevice.setState('lastTime', Date.now().toString())
}

deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
    .expectInputNameContains('Platform M+')
    .expectOutputNameContains('Platform M+')

deviceDriver.makeDetectionUnit().detectPortPair(midiPageInput, midiPageOutput)
    .expectOutputNameEquals('Icon CC')

var surface = deviceDriver.mSurface

//-----------------------------------------------------------------------------
// 2. SURFACE LAYOUT - create control elements and midi bindings
//-----------------------------------------------------------------------------
function makeSurfaceElements() {
    var surfaceElements = {}

    // Display - 2lines
    surfaceElements.d2Display = surface.makeBlindPanel(0, 0, 56, 6)

    surfaceElements.numStrips = 8

    surfaceElements.channelControls = {}

    var xKnobStrip = 0
    var yKnobStrip = 5

    for (var i = 0; i < surfaceElements.numStrips; ++i) {
        surfaceElements.channelControls[i] = makeChannelControl(surface, midiInput, midiOutput, xKnobStrip, yKnobStrip, i, surfaceElements)
    }

    surfaceElements.faderMaster = makeMasterControl(surface, midiInput, midiOutput, xKnobStrip + 1, yKnobStrip + 4, surfaceElements.numStrips, surfaceElements)
    surfaceElements.transport = makeTransport(surface, midiInput, midiOutput, xKnobStrip + 63, yKnobStrip + 4, surfaceElements)

    // Track the selected track name
    surfaceElements.selectedTrack = surface.makeCustomValueVariable('selectedTrack');
    surfaceElements.selectedTrack.mOnTitleChange = function (activeDevice, objectTitle, valueTitle) {
        // console.log('selectedTrack title change:' + objectTitle)
        activeDevice.setState('selectedTrackName', objectTitle)
    }
    return surfaceElements
}

var surfaceElements = makeSurfaceElements()


//-----------------------------------------------------------------------------
// 3. HOST MAPPING - create mapping mixerPages and host bindings
//-----------------------------------------------------------------------------

// Helper functions
function makeSubPage(subPageArea, name) {
    var subPage = subPageArea.makeSubPage(name)
    var msgText = 'sub page ' + name + ' activated'
    subPage.mOnActivate = (function (/** @type {MR_ActiveDevice} **/activeDevice) {
        // console.log(msgText)
        var activePage = activeDevice.getState("activePage")
        var activeSubPage = this.name
        switch(activePage) {
            case "SelectedTrack":
                switch (activeSubPage) {
                    case "SendsQC":
                        // An action binding cannot be set to a Toggle type button so manually adjust the rec button lights
                        // based on the subpage selection.
                        midiOutput.sendMidi(activeDevice, [0x90, 0, 127])
                        midiOutput.sendMidi(activeDevice, [0x90, 1, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 2, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 3, 0])
                        activeDevice.setState("activeSubPage", activeSubPage)
                        break;
                    case "EQ":
                        // An action binding cannot be set to a Toggle type button so manually adjust the rec button lights
                        // based on the subpage selection.
                        midiOutput.sendMidi(activeDevice, [0x90, 0, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 1, 127])
                        midiOutput.sendMidi(activeDevice, [0x90, 2, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 3, 0])
                        activeDevice.setState("activeSubPage", activeSubPage)
                        break;
                    case "PreFilter":
                        // An action binding cannot be set to a Toggle type button so manually adjust the rec button lights
                        // based on the subpage selection.
                        midiOutput.sendMidi(activeDevice, [0x90, 0, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 1, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 2, 127])
                        midiOutput.sendMidi(activeDevice, [0x90, 3, 0])
                        activeDevice.setState("activeSubPage", activeSubPage)
                        break;
                    case "CueSends":
                        // An action binding cannot be set to a Toggle type button so manually adjust the rec button lights
                        // based on the subpage selection.
                        midiOutput.sendMidi(activeDevice, [0x90, 0, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 1, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 2, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 3, 127])
                        activeDevice.setState("activeSubPage", activeSubPage)
                        break;
                }
                break;
            case "ChannelStrip":
                switch (activeSubPage) {
                    case "Gate":
                        // An action binding cannot be set to a Toggle type button so manually adjust the sel button lights
                        // based on the subpage selection.
                        midiOutput.sendMidi(activeDevice, [0x90, 24, 127])
                        midiOutput.sendMidi(activeDevice, [0x90, 25, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 26, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 27, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 28, 0])
                        activeDevice.setState("activeSubPage", activeSubPage)
                        break;
                    case "Compressor":
                        // An action binding cannot be set to a Toggle type button so manually adjust the sel button lights
                        // based on the subpage selection.
                        midiOutput.sendMidi(activeDevice, [0x90, 24, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 25, 127])
                        midiOutput.sendMidi(activeDevice, [0x90, 26, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 27, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 28, 0])
                        activeDevice.setState("activeSubPage", activeSubPage)
                        break;
                    case "Tools":
                        // An action binding cannot be set to a Toggle type button so manually adjust the sel button lights
                        // based on the subpage selection.
                        midiOutput.sendMidi(activeDevice, [0x90, 24, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 25, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 26, 127])
                        midiOutput.sendMidi(activeDevice, [0x90, 27, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 28, 0])
                        activeDevice.setState("activeSubPage", activeSubPage)
                        break;
                    case "Saturator":
                        // An action binding cannot be set to a Toggle type button so manually adjust the sel button lights
                        // based on the subpage selection.
                        midiOutput.sendMidi(activeDevice, [0x90, 24, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 25, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 26, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 27, 127])
                        midiOutput.sendMidi(activeDevice, [0x90, 28, 0])
                        activeDevice.setState("activeSubPage", activeSubPage)
                        break;
                    case "Limiter":
                        // An action binding cannot be set to a Toggle type button so manually adjust the sel button lights
                        // based on the subpage selection.
                        midiOutput.sendMidi(activeDevice, [0x90, 24, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 25, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 26, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 27, 0])
                        midiOutput.sendMidi(activeDevice, [0x90, 28, 127])
                        activeDevice.setState("activeSubPage", activeSubPage)
                        break;
                }
                break;
        }
        Helper_updateDisplay('Row1', 'Row2', 'AltRow1', 'AltRow2', activeDevice, midiOutput)
    }).bind({ name })
    return subPage
}

function makePageMixer() {
    var page = master_controls.makePageWithDefaults('Mixer', surfaceElements, deviceDriver, midiOutput)

    var FaderSubPageArea = page.makeSubPageArea('FadersKnobs')
    var subPageFaderVolume = makeSubPage(FaderSubPageArea, 'Volume')

    var ButtonSubPageArea = page.makeSubPageArea('Buttons')
    var subPageButtonDefaultSet = makeSubPage(ButtonSubPageArea, 'DefaultSet')

    var hostMixerBankZone = page.mHostAccess.mMixConsole.makeMixerBankZone("AudioInstrBanks")
        .setFollowVisibility(true)

    for (var channelIndex = 0; channelIndex < surfaceElements.numStrips; ++channelIndex) {
        var hostMixerBankChannel = hostMixerBankZone.makeMixerBankChannel()

        var knobSurfaceValue = surfaceElements.channelControls[channelIndex].pushEncoder.mEncoderValue;
        var knobPushValue = surfaceElements.channelControls[channelIndex].pushEncoder.mPushValue;
        var faderSurfaceValue = surfaceElements.channelControls[channelIndex].fader.mSurfaceValue;
        var faderTouchValue = surfaceElements.channelControls[channelIndex].fader_touch;
        var sel_buttonSurfaceValue = surfaceElements.channelControls[channelIndex].sel_button.mSurfaceValue;
        var mute_buttonSurfaceValue = surfaceElements.channelControls[channelIndex].mute_button.mSurfaceValue;
        var solo_buttonSurfaceValue = surfaceElements.channelControls[channelIndex].solo_button.mSurfaceValue;
        var rec_buttonSurfaceValue = surfaceElements.channelControls[channelIndex].rec_button.mSurfaceValue;

        // FaderKnobs - Volume, Pan, Editor Open
        page.makeValueBinding(knobSurfaceValue, hostMixerBankChannel.mValue.mPan).setSubPage(subPageFaderVolume)
        page.makeValueBinding(knobPushValue, hostMixerBankChannel.mValue.mEditorOpen).setTypeToggle().setSubPage(subPageFaderVolume)
        page.makeValueBinding(faderSurfaceValue, hostMixerBankChannel.mValue.mVolume).setValueTakeOverModeJump().setSubPage(subPageFaderVolume)
        page.makeValueBinding(faderSurfaceValue, hostMixerBankChannel.mValue.mVolume).setValueTakeOverModeJump().setSubPage(subPageFaderVolume) // ! Duplicate to overcome C12.0.60+ bug
        page.makeValueBinding(sel_buttonSurfaceValue, hostMixerBankChannel.mValue.mSelected).setTypeToggle().setSubPage(subPageButtonDefaultSet)
        page.makeValueBinding(mute_buttonSurfaceValue, hostMixerBankChannel.mValue.mMute).setTypeToggle().setSubPage(subPageButtonDefaultSet)
        page.makeValueBinding(solo_buttonSurfaceValue, hostMixerBankChannel.mValue.mSolo).setTypeToggle().setSubPage(subPageButtonDefaultSet)
        page.makeValueBinding(rec_buttonSurfaceValue, hostMixerBankChannel.mValue.mRecordEnable).setTypeToggle().setSubPage(subPageButtonDefaultSet)
    }

    page.mOnActivate = function (/** @type {MR_ActiveDevice} */activeDevice) {
        // console.log('from script: Platform M+ page "Mixer" activated')
        activeDevice.setState("activePage", "Mixer")
        activeDevice.setState("activeSubPage", "Default")
        clearAllLeds(activeDevice, midiOutput)
        clearChannelState(activeDevice)
    }

    return page
}

function makePageSelectedTrack() {
    var page = master_controls.makePageWithDefaults('Selected Channel', surfaceElements, deviceDriver, midiOutput)

    var faderSubPageArea = page.makeSubPageArea('Faders')
    var subPageSendsQC = makeSubPage(faderSubPageArea, 'SendsQC')
    var subPageEQ = makeSubPage(faderSubPageArea, 'EQ')
    var subPageCueSends = makeSubPage(faderSubPageArea, 'CueSends')
    var subPagePreFilter = makeSubPage(faderSubPageArea, 'PreFilter')

    var selectedTrackChannel = page.mHostAccess.mTrackSelection.mMixerChannel

    // Custom variable for track the selectedTrack so we can get to it's name
    page.makeValueBinding(surfaceElements.selectedTrack, selectedTrackChannel.mValue.mVolume)
    page.makeValueBinding(surfaceElements.selectedTrack, selectedTrackChannel.mValue.mVolume) // ! Duplicate to overcome C12.0.60+ bug
    /// SendsQC subPage
    // Sends on PushEncodes and mute button for pre/post
    // Focus QC on Faders
    // Fader
    for (var idx = 0; idx < surfaceElements.numStrips; ++idx) {
        var knobSurfaceValue = surfaceElements.channelControls[idx].pushEncoder.mEncoderValue;
        var knobPushValue = surfaceElements.channelControls[idx].pushEncoder.mPushValue;
        var faderSurfaceValue = surfaceElements.channelControls[idx].fader.mSurfaceValue;

        var quickControlValue = page.mHostAccess.mFocusedQuickControls.getByIndex(idx) // ! Weird: If this isn't a var in the line below but a direct call then Cubase will not bind values correctly
        var sends = selectedTrackChannel.mSends.getByIndex(idx)

        page.makeValueBinding(knobSurfaceValue, sends.mLevel).setSubPage(subPageSendsQC)
        page.makeValueBinding(knobPushValue, sends.mOn).setTypeToggle().setSubPage(subPageSendsQC)
        page.makeValueBinding(faderSurfaceValue, quickControlValue).setValueTakeOverModeJump().setSubPage(subPageSendsQC)
        page.makeValueBinding(faderSurfaceValue, quickControlValue).setValueTakeOverModeJump().setSubPage(subPageSendsQC) // ! Duplicate to overcome C12.0.60+ bug

        page.makeValueBinding(surfaceElements.channelControls[idx].sel_button.mSurfaceValue, selectedTrackChannel.mSends.getByIndex(idx).mOn).setTypeToggle().setSubPage(subPageSendsQC)
        page.makeValueBinding(surfaceElements.channelControls[idx].mute_button.mSurfaceValue, selectedTrackChannel.mSends.getByIndex(idx).mPrePost).setTypeToggle().setSubPage(subPageSendsQC)

        // The use of bind below assures the idx is the correct value for the onTitleChange function
        const qcOnTitleChange = {
            idx: idx,
            onTitleChange: function(activeDevice,activeMapping,objectTitle, valueTitle) {
                var activePage = activeDevice.getState("activePage")
                var activeSubPage = activeDevice.getState("activeSubPage")
                var faderValueTitles = activeDevice.getState(activePage + "- " + activeSubPage + ' - Fader - ValueTitles')
                // console.log("QC Title Changed:" +this.idx+":" + objectTitle + ":" + valueTitle)
                switch (activePage) {
                case "SelectedTrack":
                    switch (activeSubPage) {
                        case "SendsQC":
                            var title = valueTitle
                            if (title.length === 0) {
                                title = "None"
                            }
                            activeDevice.setState(activePage + "- " + activeSubPage + ' - Fader - ValueTitles', setTextOfColumn(this.idx, makeLabel(title, 6), faderValueTitles))
                            Helper_updateDisplay(activePage + "- " + activeSubPage + ' - Fader - ValueTitles', activePage + "- " + activeSubPage + ' - Fader - Values', activePage + "- " + activeSubPage + ' - Pan - ValueTitles', activePage + "- " + activeSubPage + ' - Pan - Values', activeDevice, midiOutput)
                            break;
                    }
                    break;
                }
            }
        }
        quickControlValue.mOnTitleChange = qcOnTitleChange.onTitleChange.bind(qcOnTitleChange)

    }

    // Handy controls for easy access
    page.makeCommandBinding(surfaceElements.channelControls[4].solo_button.mSurfaceValue, 'Automation', 'Show Used Automation (Selected Tracks)').setSubPage(subPageSendsQC)
    page.makeCommandBinding(surfaceElements.channelControls[5].solo_button.mSurfaceValue, 'Automation', 'Hide Automation').setSubPage(subPageSendsQC)
    page.makeValueBinding(surfaceElements.channelControls[6].solo_button.mSurfaceValue, selectedTrackChannel.mValue.mEditorOpen).setTypeToggle().setSubPage(subPageSendsQC)
    page.makeValueBinding(surfaceElements.channelControls[7].solo_button.mSurfaceValue, selectedTrackChannel.mValue.mInstrumentOpen).setTypeToggle().setSubPage(subPageSendsQC)

    page.makeValueBinding(surfaceElements.channelControls[4].rec_button.mSurfaceValue, selectedTrackChannel.mValue.mMonitorEnable).setTypeToggle().setSubPage(subPageSendsQC)
    page.makeValueBinding(surfaceElements.channelControls[5].rec_button.mSurfaceValue, selectedTrackChannel.mValue.mMute).setTypeToggle().setSubPage(subPageSendsQC)
    page.makeValueBinding(surfaceElements.channelControls[6].rec_button.mSurfaceValue, selectedTrackChannel.mValue.mSolo).setTypeToggle().setSubPage(subPageSendsQC)
    page.makeValueBinding(surfaceElements.channelControls[7].rec_button.mSurfaceValue, selectedTrackChannel.mValue.mRecordEnable).setTypeToggle().setSubPage(subPageSendsQC)

    // EQ Related but on Sends page so you know EQ activated...not sure the best option but hey, more buttons and lights is cool!
    page.makeValueBinding(surfaceElements.channelControls[0].solo_button.mSurfaceValue, selectedTrackChannel.mChannelEQ.mBand1.mOn).setTypeToggle().setSubPage(subPageSendsQC)
    page.makeValueBinding(surfaceElements.channelControls[1].solo_button.mSurfaceValue, selectedTrackChannel.mChannelEQ.mBand2.mOn).setTypeToggle().setSubPage(subPageSendsQC)
    page.makeValueBinding(surfaceElements.channelControls[2].solo_button.mSurfaceValue, selectedTrackChannel.mChannelEQ.mBand3.mOn).setTypeToggle().setSubPage(subPageSendsQC)
    page.makeValueBinding(surfaceElements.channelControls[3].solo_button.mSurfaceValue, selectedTrackChannel.mChannelEQ.mBand4.mOn).setTypeToggle().setSubPage(subPageSendsQC)

    page.makeActionBinding(surfaceElements.channelControls[0].rec_button.mSurfaceValue, subPageSendsQC.mAction.mActivate).setSubPage(subPageSendsQC)
    page.makeActionBinding(surfaceElements.channelControls[1].rec_button.mSurfaceValue, subPageEQ.mAction.mActivate).setSubPage(subPageSendsQC)
    page.makeActionBinding(surfaceElements.channelControls[2].rec_button.mSurfaceValue, subPagePreFilter.mAction.mActivate).setSubPage(subPageSendsQC)
    page.makeActionBinding(surfaceElements.channelControls[3].rec_button.mSurfaceValue, subPageCueSends.mAction.mActivate).setSubPage(subPageSendsQC)

    // EQ Subpage
    const eqBand = []
    eqBand[0] = selectedTrackChannel.mChannelEQ.mBand1
    eqBand[1] = selectedTrackChannel.mChannelEQ.mBand2
    eqBand[2] = selectedTrackChannel.mChannelEQ.mBand3
    eqBand[3] = selectedTrackChannel.mChannelEQ.mBand4
    for (var idx = 0; idx < 4; ++idx) {
        var knobSurfaceValue = surfaceElements.channelControls[idx].pushEncoder.mEncoderValue;
        var knob2SurfaceValue = surfaceElements.channelControls[idx + 4].pushEncoder.mEncoderValue;
        var knobPushValue = surfaceElements.channelControls[idx].pushEncoder.mPushValue;
        var knob2PushValue = surfaceElements.channelControls[idx + 4].pushEncoder.mPushValue;
        var faderSurfaceValue = surfaceElements.channelControls[idx].fader.mSurfaceValue;
        var fader2SurfaceValue = surfaceElements.channelControls[idx + 4].fader.mSurfaceValue;

        page.makeValueBinding(knobSurfaceValue, eqBand[idx].mFilterType).setSubPage(subPageEQ)
        page.makeValueBinding(knob2SurfaceValue, eqBand[idx].mQ).setSubPage(subPageEQ)
        page.makeValueBinding(knobPushValue, eqBand[idx].mOn).setTypeToggle().setSubPage(subPageEQ)
        page.makeValueBinding(knob2PushValue, eqBand[idx].mOn).setTypeToggle().setSubPage(subPageEQ)
        page.makeValueBinding(faderSurfaceValue, eqBand[idx].mGain).setSubPage(subPageEQ)
        page.makeValueBinding(fader2SurfaceValue, eqBand[idx].mFreq).setSubPage(subPageEQ)
    }

    /// CueSends subPage
    for (var idx = 0; idx < selectedTrackChannel.mCueSends.getSize(); ++idx) {
        var knobSurfaceValue = surfaceElements.channelControls[idx].pushEncoder.mEncoderValue;
        var knobPushValue = surfaceElements.channelControls[idx].pushEncoder.mPushValue;
        var faderSurfaceValue = surfaceElements.channelControls[idx].fader.mSurfaceValue;

        page.makeValueBinding(knobSurfaceValue, selectedTrackChannel.mCueSends.getByIndex(idx).mPan).setSubPage(subPageCueSends)
        page.makeValueBinding(knobPushValue, selectedTrackChannel.mCueSends.getByIndex(idx).mOn).setTypeToggle().setSubPage(subPageCueSends)
        page.makeValueBinding(faderSurfaceValue, selectedTrackChannel.mCueSends.getByIndex(idx).mLevel).setSubPage(subPageCueSends)

        page.makeValueBinding(surfaceElements.channelControls[idx].sel_button.mSurfaceValue, selectedTrackChannel.mCueSends.getByIndex(idx).mOn).setTypeToggle().setSubPage(subPageCueSends)
        page.makeValueBinding(surfaceElements.channelControls[idx].mute_button.mSurfaceValue, selectedTrackChannel.mCueSends.getByIndex(idx).mPrePost).setTypeToggle().setSubPage(subPageCueSends)
    }

    // PreFilter subPage
    var knobSurfaceValue = surfaceElements.channelControls[0].pushEncoder.mEncoderValue;
    var knob2SurfaceValue = surfaceElements.channelControls[1].pushEncoder.mEncoderValue;
    var knob3SurfaceValue = surfaceElements.channelControls[2].pushEncoder.mEncoderValue;

    var knobPushValue = surfaceElements.channelControls[0].pushEncoder.mPushValue;
    var knob2PushValue = surfaceElements.channelControls[1].pushEncoder.mPushValue;
    var knob3PushValue = surfaceElements.channelControls[2].pushEncoder.mPushValue;

    var faderSurfaceValue = surfaceElements.channelControls[0].fader.mSurfaceValue;
    var fader2SurfaceValue = surfaceElements.channelControls[1].fader.mSurfaceValue;
    var fader3SurfaceValue = surfaceElements.channelControls[2].fader.mSurfaceValue;

    var preFilter = selectedTrackChannel.mPreFilter

    page.makeValueBinding(surfaceElements.channelControls[0].sel_button.mSurfaceValue, preFilter.mBypass).setTypeToggle().setSubPage(subPagePreFilter)
    page.makeValueBinding(surfaceElements.channelControls[0].mute_button.mSurfaceValue, preFilter.mPhaseSwitch).setTypeToggle().setSubPage(subPagePreFilter)

    page.makeValueBinding(surfaceElements.channelControls[1].sel_button.mSurfaceValue, preFilter.mHighCutOn).setTypeToggle().setSubPage(subPagePreFilter)
    page.makeValueBinding(surfaceElements.channelControls[2].sel_button.mSurfaceValue, preFilter.mLowCutOn).setTypeToggle().setSubPage(subPagePreFilter)

    page.makeValueBinding(knob2SurfaceValue, preFilter.mHighCutSlope).setSubPage(subPagePreFilter)
    page.makeValueBinding(knob3SurfaceValue, preFilter.mLowCutSlope).setSubPage(subPagePreFilter)
    page.makeValueBinding(knobPushValue, preFilter.mBypass).setTypeToggle().setSubPage(subPagePreFilter)
    page.makeValueBinding(knob2PushValue, preFilter.mHighCutOn).setTypeToggle().setSubPage(subPagePreFilter)
    page.makeValueBinding(knob3PushValue, preFilter.mLowCutOn).setTypeToggle().setSubPage(subPagePreFilter)
    page.makeValueBinding(faderSurfaceValue, preFilter.mGain).setSubPage(subPagePreFilter)
    page.makeValueBinding(fader2SurfaceValue, preFilter.mHighCutFreq).setSubPage(subPagePreFilter)
    page.makeValueBinding(fader3SurfaceValue, preFilter.mLowCutFreq).setSubPage(subPagePreFilter)

    page.mOnActivate = function (/** @type {MR_ActiveDevice} */activeDevice) {
        // console.log('from script: Platform M+ page "Selected Track" activated')
        activeDevice.setState("activePage", "SelectedTrack")
        activeDevice.setState("activeSubPage", "SendsQC")
        clearAllLeds(activeDevice, midiOutput)
        clearChannelState(activeDevice)
        // Set the Rec leds which correspond to the different subages to their starting state
        midiOutput.sendMidi(activeDevice, [0x90, 0, 127])
        midiOutput.sendMidi(activeDevice, [0x90, 1, 0])
        midiOutput.sendMidi(activeDevice, [0x90, 2, 0])
        midiOutput.sendMidi(activeDevice, [0x90, 3, 0])
    }

    return page
}

function makePageChannelStrip() {
    var page = master_controls.makePageWithDefaults('ChannelStrip', surfaceElements, deviceDriver, midiOutput)

    var strip = page.makeSubPageArea('Strip')
    var gatePage = makeSubPage(strip, 'Gate')
    var compressorPage = makeSubPage(strip, 'Compressor')
    var toolsPage = makeSubPage(strip, 'Tools')
    var saturatorPage = makeSubPage(strip, 'Saturator')
    var limiterPage = makeSubPage(strip, 'Limiter')


    var selectedTrackChannel = page.mHostAccess.mTrackSelection.mMixerChannel
    var stripEffects = selectedTrackChannel.mInsertAndStripEffects.mStripEffects

    for (var idx = 0; idx < surfaceElements.numStrips; ++idx) {
        var faderSurfaceValue = surfaceElements.channelControls[idx].fader.mSurfaceValue;

        var gate = stripEffects.mGate.mParameterBankZone.makeParameterValue()
        var compressor = stripEffects.mCompressor.mParameterBankZone.makeParameterValue()
        var tools = stripEffects.mTools.mParameterBankZone.makeParameterValue()
        var saturator = stripEffects.mSaturator.mParameterBankZone.makeParameterValue()
        var limiter = stripEffects.mLimiter.mParameterBankZone.makeParameterValue()

        for (var i = 0; i < 2; i++) { // ! Workaround for Cubase 12.0.60+ bug
            page.makeValueBinding(faderSurfaceValue, gate).setSubPage(gatePage)
            page.makeValueBinding(faderSurfaceValue, compressor).setSubPage(compressorPage)
            page.makeValueBinding(faderSurfaceValue, tools).setSubPage(toolsPage)
            page.makeValueBinding(faderSurfaceValue, saturator).setSubPage(saturatorPage)
            page.makeValueBinding(faderSurfaceValue, limiter).setSubPage(limiterPage)
        }
    }

    for (var idx = 0; idx < 5; ++idx) {
        var faderStrip = surfaceElements.channelControls[idx]
        var type = ['mGate', 'mCompressor', 'mTools', 'mSaturator', 'mLimiter'][idx]
        for (var i = 0; i < 2; i++) { // ! Workaround for Cubase 12.0.60+ bug
            page.makeValueBinding(faderStrip.rec_button.mSurfaceValue, stripEffects[type].mOn).setTypeToggle()
            page.makeValueBinding(faderStrip.mute_button.mSurfaceValue, stripEffects[type].mBypass).setTypeToggle()
        }
    }

    page.makeActionBinding(surfaceElements.channelControls[0].sel_button.mSurfaceValue, gatePage.mAction.mActivate)
    page.makeActionBinding(surfaceElements.channelControls[1].sel_button.mSurfaceValue, compressorPage.mAction.mActivate)
    page.makeActionBinding(surfaceElements.channelControls[2].sel_button.mSurfaceValue, toolsPage.mAction.mActivate)
    page.makeActionBinding(surfaceElements.channelControls[3].sel_button.mSurfaceValue, saturatorPage.mAction.mActivate)
    page.makeActionBinding(surfaceElements.channelControls[4].sel_button.mSurfaceValue, limiterPage.mAction.mActivate)

    page.mOnActivate = function (/** @type {MR_ActiveDevice} */activeDevice) {
        // console.log('from script: Platform M+ page "Channel Strip" activated')
        activeDevice.setState("activePage", "ChannelStrip")
        activeDevice.setState("activeSubPage", "Gate")
        clearAllLeds(activeDevice, midiOutput)
        clearChannelState(activeDevice)
        midiOutput.sendMidi(activeDevice, [0x90, 24, 127])
        midiOutput.sendMidi(activeDevice, [0x90, 25, 0])
        midiOutput.sendMidi(activeDevice, [0x90, 26, 0])
        midiOutput.sendMidi(activeDevice, [0x90, 27, 0])
        midiOutput.sendMidi(activeDevice, [0x90, 28, 0])
    }

//     page.mOnIdle = function(activeDevice, activeMapping) {
//         var now = Date.now()
//         var lastTime = Number(activeDevice.getState('lastTime'))
//         if ((now-lastTime) >= 5000) {
//             activeDevice.setState('lastTime', now.toString())
//             console.log('PAGE Default ON IDLE A')
//         } else {
// // WIP Okay so need to decide what to do here.
// // WIP And what about making MIXER a SHIFT key?
//         }
//         // Your custom idle-time tasks here
//     }

    return page
}

function makePageMidi() {
    var page = master_controls.makePageWithDefaults('Midi', surfaceElements, deviceDriver, midiOutput)

    function makeMidiCCBinding( /** @type {MR_FactoryMappingPage} */page, /** @type {string} */displayName, /** @type {number} */cc, /** @type {number} */fader) {
        // ? I have no idea what page.mCustom.makeHostValueVariable actually does- all I know is I can make a value binding this way. I can't seem to be able to look it up
        // ? or access it all once made.
        page.makeValueBinding(surfaceElements.channelControls[fader].fader.mSurfaceValue, page.mCustom.makeHostValueVariable(displayName)).setValueTakeOverModeJump()
            .mOnValueChange = (function (activeDevice, mapping, value, value2) {
                // console.log(displayName + ":" + mapping + "::" + value + "::" + value2)
                var activePage = activeDevice.getState("activePage")
                var activeSubPage = activeDevice.getState("activeSubPage")

                var faderValueTitles = activeDevice.getState(activePage + "- " + activeSubPage + ' - Fader - ValueTitles')
                var faderValues = activeDevice.getState(activePage + "- " + activeSubPage + ' - Fader - Values')

                var ccValue = Math.ceil(value * 127)
                var pitchBendValue = Math.ceil(value * 16383)
                var value1 = pitchBendValue % 128
                var value2 = Math.floor(pitchBendValue / 128)

                // this is the value going back to the icon Fader
                midiOutput.sendMidi(activeDevice, [0xE0 + this.fader, value1, value2])
                // this is the value going back to Cubendo
                midiPageOutput.sendMidi(activeDevice, [0xB0, this.cc, ccValue])
                // and this updates the D2 Display
                activeDevice.setState(activePage + "- " + activeSubPage + ' - Fader - ValueTitles', setTextOfColumn(this.fader, makeLabel(this.displayName, 6), faderValueTitles))
                activeDevice.setState(activePage + "- " + activeSubPage + ' - Fader - Values', setTextOfColumn(this.fader, makeLabel(ccValue.toString(), 6), faderValues))
                Helper_updateDisplay(activePage + "- " + activeSubPage + ' - Fader - ValueTitles', activePage + "- " + activeSubPage + ' - Fader - Values', activePage + "- " + activeSubPage + ' - Pan - ValueTitles', activePage + "- " + activeSubPage + ' - Pan - Values', activeDevice, midiOutput)
            }).bind({displayName, cc, fader})
    }

    var cc = config.midi.cc
    for (var i = 0; i < surfaceElements.numStrips; ++i) {
        makeMidiCCBinding(page, cc[i].title, cc[i].cc, i)
    }

    page.mOnActivate = function (/** @type {MR_ActiveDevice} */activeDevice) {
        // console.log('from script: Platform M+ page "Midi" activated')
        var activePage = "Midi"
        var activeSubPage = "Default"
        activeDevice.setState("activePage", activePage)
        activeDevice.setState("activeSubPage", activeSubPage)
        clearAllLeds(activeDevice, midiOutput)
        clearChannelState(activeDevice)

        var faderValueTitles = activeDevice.getState(activePage + "- " + activeSubPage + ' - Fader - ValueTitles')
        var faderValues = activeDevice.getState(activePage + "- " + activeSubPage + ' - Fader - Values')
        var cc = config.midi.cc
        for (var i = 0; i < surfaceElements.numStrips; ++i) {
            faderValueTitles = setTextOfColumn(i, makeLabel(cc[i].title, 6), faderValueTitles)
            faderValues = setTextOfColumn(i, makeLabel("?", 6), faderValues)
        }
        activeDevice.setState(activePage + "- " + activeSubPage + ' - Fader - ValueTitles', setTextOfLine(faderValueTitles))
        activeDevice.setState(activePage + "- " + activeSubPage + ' - Fader - Values', setTextOfLine(faderValues))
        Helper_updateDisplay(activePage + "- " + activeSubPage + ' - Fader - ValueTitles', activePage + "- " + activeSubPage + ' - Fader - Values', activePage + "- " + activeSubPage + ' - Pan - ValueTitles', activePage + "- " + activeSubPage + ' - Pan - Values', activeDevice, midiOutput)
    }

    return page
}


var mixerPage = makePageMixer()
var selectedTrackPage = makePageSelectedTrack()
var channelStripPage = makePageChannelStrip()
var controlRoomPage = control_room.makePage(surfaceElements, deviceDriver, midiOutput)
var midiPage = makePageMidi()

// Function to clear out the Channel State for the display titles/values
// the OnDisplayChange callback is not called if the Channel doesn't have an updated
// Title. So swtiching to QC would leave the old Mixer Page "Volume" title kicking around
// in the state. By clearing state on the page activation it will update all that are changing.
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








