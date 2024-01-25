import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced,eventSource,event_types } from "../../../../script.js";

var isCompatible = isBrowserCompatible();

const extensionName = "st-extension-transformations";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const defaultSettings = {
  adv_character: false,
  adv_inputs: false,
  start_keys: "",
  end_keys:"",
  basic_keys:"",
  char_trans:false
};
var saveFile = defaultSettings

function isBrowserCompatible(){
  if (typeof chrome != "undefined" && chrome.storage){
    return true;
  } else if (typeof localStorage !== 'undefined') {
    return true;
  } else {
    toastr.error('Storage not supported in this environment. Your browser does not support localStorage or is not a chromium browser',"Unable to Save Data!");
  }
  return false
}

function updateSettingsSave(){
  if (typeof chrome != "undefined" && chrome.storage){
    chrome.storage.local.set({ 'extensionCachePath': saveFile }, function() {
      console.log('Settings saved successfully using chrome.storage.');
    });
  } else if (typeof localStorage !== 'undefined') {
    // Other browsers supporting localStorage
    localStorage.setItem('extensionCachePath', JSON.stringify(saveFile));
    console.log('Settings saved successfully using localStorage.');
  } else {
    toastr.error('Storage not supported in this environment. Your browser does not support localStorage or is not a chromium browser',"Unable to Save!");
  }
}

function getSettingsSave(){
  if (typeof chrome !== 'undefined' && chrome.storage) {
    // Chrome extension environment
    chrome.storage.local.get('extensionCachePath', function(result) {
      saveFile = result.extensionCachePath || defaultSettings;
    });
  } else if (typeof localStorage !== 'undefined') {
    // Other browsers supporting localStorage
    const storedData = localStorage.getItem('extensionCachePath');
    saveFile = storedData ? JSON.parse(storedData) : defaultSettings;
  } else {
    toastr.error('Storage not supported in this environment. Your browser does not support localStorage or is not a chromium browser',"Unable to Get!");
  }
}

var advanced_character = false
var advanced_inputs = false
var list_start_keys = ""
var list_end_keys = ""
var list_basic_keys = ""
var character_trans = false


eventSource.on(event_types.MESSAGE_RECEIVED,handleIncomingMessage)

//Self Note: extension_settings[getSaveLocation()].adv_inputs is erroring somewhere

function handleIncomingMessage(){
  try{
    const context = getContext();
    const chat = context.chat;
    const newMessage = getLastElement(chat).mes
    if (newMessage != "..."){
      var adinp = advanced_inputs
      console.log("Incoming Message")
      toastr.info(`New Message Recieved!\nAdvanced Inputs?: ${adinp}`,"Message Recieved")
      if (adinp){
        var startregexPattern = `/([^a-zA-Z0-9]|^)(?:${getTransforms(true)})([^a-zA-Z0-9]|$)/`;
        var endregexPattern = `/([^a-zA-Z0-9]|^)(?:${getTransforms(false)})([^a-zA-Z0-9]|$)/`;
        console.log(`${new RegExp(startregexPattern).test(newMessage)}`)
        console.log(`${new RegExp(endregexPattern).test(newMessage)}`)
        if (new RegExp(startregexPattern).test(newMessage)) {
          setCharTransformed(true)
        } else if (new RegExp(endregexPattern).test(newMessage)){
          setCharTransformed(false)
        }
      } else {
        var regexPattern = `/([^a-zA-Z0-9]|^)(?:${getBasicTransforms()})([^a-zA-Z0-9]|$)/`;
        console.log(`${new RegExp(regexPattern).test(newMessage)}`)
        if (new RegExp(regexPattern).test(newMessage)) {
          toggleTransformed()
        }
      }
    }
  }catch(ex){
    toastr.error(ex)
  }
}

function getStartTerms(){
  if (saveFile.adv_inputs){
    var result = $("#start_trigger_settings").val()
    return result.split(",");
  } else {
    var result = $("#basic_trigger_settings").val()
    return result.split(",");
  }
}
async function getEndTerms(){
  
  if (saveFile.adv_inputs){
    var result = $("#end_trigger_settings").val()
    return result.split(",");
  } else {
    var result = $("#basic_trigger_settings").val()
    return result.split(",");
  }
}

function getBasicTransforms(){
  str = ""
  getStartTerms().forEach(element => {
    if (str == ""){
      str = element.trim()
    } else {
      str = str + "|" + element.trim()
    }
  });
  if (saveFile.adv_inputs){
    $("#end_trigger_settings").val().split(",").forEach(element => {
      if (str == ""){
        str = element.trim()
      } else {
        str = str + "|" + element.trim()
      }
    });
  }
  return str
}
function getTransforms(type){
  str = ""
  if (type){
    getStartTerms().forEach(element => {
      if (str == ""){
        str = element.trim()
      } else {
        str = str + "|" + element.trim()
      }
    });
    return str;
  } else {
    getEndTerms().forEach(element => {
      if (str == ""){
        str = element.trim()
      } else {
        str = str + "|" + element.trim()
      }
    });
    return str
  }
}

function getLastElement(t){
  var val = t[1]
  t.forEach(element => {
    val=element;
  });
  return val;
}

function validateSettings(){
  var saveData = saveFile;
  if (typeof saveData == "undefined")
  { saveData = defaultSettings }
  else{
    for (const key in defaultSettings) {
      if (Object.hasOwnProperty.call(defaultSettings, key)) {
        const element = defaultSettings[key];
        if (typeof saveData[key]=="undefined")
        {
          saveData[key]=element;
        }
      }
    }
  }
  saveFile=saveData
}

async function loadSettings() {
  if (Object.keys(saveFile).length === 0) {
    Object.assign(saveFile, defaultSettings);
    updateSettingsSave();
    validateSettings();
  } else {
    getSettingsSave();
    validateSettings();
  }

  advanced_character = saveFile.adv_character
  advanced_inputs = saveFile.adv_inputs
  list_basic_keys = saveFile.basic_keys
  list_start_keys = saveFile.start_keys
  list_end_keys = saveFile.adv_character
  character_trans = saveFile.char_trans

  console.log(
    `Loaded Settings:\nAdvanced Character Enabled: ${advanced_character}\n`+
    `Advanced Input Enabled: ${advanced_inputs}\n`+
    `Basic Keys: ${advanced_character}\n`+
    `Start Keys: ${advanced_character}\n`+
    `End Keys: ${advanced_character}\n`+
    `Character Transformed: ${character_trans}`
  )

  $("#adv_character_setting").prop("checked", advanced_character);
  $("#adv_triggers_setting").prop("checked", advanced_inputs);
  $("#basic_triggers_setting").prop("value", list_basic_keys);
  $("#start_triggers_setting").prop("value", list_start_keys);
  $("#end_triggers_setting").prop("value", list_end_keys);
}

function onAdvPlayerInput(event) {
  var saveLocation = getSaveLocation()
  const value = Boolean($(event.target).prop("checked"));
  saveFile.adv_character = value;
  advanced_character = value
  saveSettingsDebounced();
  if (value){
    toastr.warning(
      `The new settings will completely override your characters description`,
      "Advanced Character Enabled"
    );
    reset()
  } else {
    reset()
  }
}
function onAdvInputsInput(event) {
  var saveLocation = getSaveLocation()
  const value = Boolean($(event.target).prop("checked"));
  saveFile.adv_inputs = value;
  advanced_inputs = value;
  saveSettingsDebounced();
  if (value){
    reset()
  } else {
    reset()
  }
}

function setCharTransformed(state){
  saveFile.char_trans = state;
}
function onTextChanged(){
  if (saveFile.adv_inputs){
    var a = $("start_trigger_settings")
    var b = $("end_trigger_settings")

    if (typeof a != "undefined"){
      list_start_keys = a
    }
    if (typeof b != "undefined"){
      list_end_keys = b
    }

    saveFile.start_keys = list_start_keys
    saveFile.end_keys = list_end_keys
    updateSettingsSave()
  } else {
    var a = $("basic_trigger_settings").val()
    if (typeof a != "undefined"){
      list_basic_keys = a
    }

    saveFile.basic_keys = list_basic_keys
    updateSettingsSave()
  }
}
function toggleTransformed(){
  setCharTransformed(!saveFile.char_trans)
}
var lastCheck = {}
function runUpdateCheck(){
  if (lastCheck != saveFile){
    lastCheck=saveFile
    updateSettingsSave()
  }
}

function onForceReset(){
  saveFile = defaultSettings
  updateSettingsSave()
  reset()
  toastr.warning(
    "You will have to input your transformation description and settings again!",
    "All data Cleared"
  )
}

function onForceRevert(){
  saveFile.char_trans=false
  reset()
  toastr.warning(
    `This did not force revert your character in context, this only made the script believe the character is not transformed`,
    "Force Reverted!"
  )
}

setInterval(() => {
  runUpdateCheck()
}, 100);

getSettingsSave();
validateSettings();
console.log(saveFile)

reset(true)

function reset(wasInit){
  jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/menuentry.html`);
  
    $("#transformation_extension_tab").remove();
    if (!isCompatible){
      const notcompatible = await $.get(`${extensionFolderPath}/htmlelements/add/notCompat.html`);
      $("#extensions_settings").append(notcompatible);
      return;
    }
    $("#extensions_settings").append(settingsHtml);
  
    $("#adv_character_setting").on("input", onAdvPlayerInput);
    $("#adv_triggers_setting").on("input", onAdvInputsInput);
    $("#force_revert_setting").on("click", onForceRevert);
    $("#force_reset_data_setting").on("click", onForceReset);

    const tranTrigBasic = await $.get(`${extensionFolderPath}/htmlelements/basic/transformTriggerBasic.html`);
    const tranBasic = await $.get(`${extensionFolderPath}/htmlelements/basic/transformationadd.html`);
    const tranAdv = await $.get(`${extensionFolderPath}/htmlelements/advanced/transformationAdv.html`);
    const tranTrigAdvancedStart = await $.get(`${extensionFolderPath}/htmlelements/advanced/transformationTriggersstart.html`);
    const tranTrigAdvancedEnd = await $.get(`${extensionFolderPath}/htmlelements/advanced/transformationTriggersend.html`);

    const charTransformed = await $.get(`${extensionFolderPath}/htmlelements/add/chartrans.html`);
    const charNotTransformed = await $.get(`${extensionFolderPath}/htmlelements/add/charnorm.html`);

    if (saveFile.char_trans){
      $("#table_container").append(charTransformed);
    } else {
      $("#table_container").append(charNotTransformed);
    }

    if (saveFile.char_trans){
      $("#force_revert_setting").removeAttr("disabled");
    } else {
      $("#force_revert_setting").attr("disabled", "");
    }
    if (saveFile.adv_inputs){
      $("#table_container").append(tranTrigAdvancedStart);
      $("#table_container").append(tranTrigAdvancedEnd);
      $("#start_trigger_settings").on("input",onTextChanged)
      $("#end_trigger_settings").on("input",onTextChanged)
      $("#start_trigger_settings").prop("value",saveFile.start_keys)
      $("#end_trigger_settings").prop("value",saveFile.end_keys)
    } else {
      $("#table_container").append(tranTrigBasic);
      $("#basic_trigger_settings").on("input",onTextChanged)
      $("#basic_trigger_settings").prop("value",saveFile.basic_keys)
    }

    if (saveFile.adv_character)
    {
      $("#table_container").append(tranAdv);
    } else {
      $("#table_container").append(tranBasic);
    }
    loadSettings();
  });
}
