import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced,eventSource,event_types } from "../../../../script.js";

const extensionName = "st-extension-transformations";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const defaultSettings = {
  adv_character: false,
  adv_inputs: false,
  start_keys: "",
  end_keys:"",
  basic_keys:"",
  char_trans:true
};

var advanced_character = false
var advanced_inputs = false
var list_start_keys = ""
var list_end_keys = ""
var list_basic_keys = ""
var character_trans = false


eventSource.on(event_types.MESSAGE_RECEIVED,handleIncomingMessage)

function getSaveLocation(){
  var context = getContext()
  if (context == null || context == undefined){
    return extensionName;
  } else if (context.chatId == null || context.chatId == undefined){
    return extensionName;
  }
  return extensionName + context.chatId;
}
function getValue(value, defaultValue) {
  var saveLocation = getSaveLocation()
  if (extension_settings[saveLocation] == null || extension_settings[saveLocation] == undefined) {
      return defaultValue;
  } else if (extension_settings[saveLocation][value] == null || extension_settings[saveLocation][value] == undefined) {
      return defaultValue;
  }
  return extension_settings[saveLocation][value];
}

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
  if (extension_settings[extensionName].adv_inputs){
    var result = $("#start_trigger_settings").val()
    return result.split(",");
  } else {
    var result = $("#basic_trigger_settings").val()
    return result.split(",");
  }
}
async function getEndTerms(){
  
  if (extension_settings[extensionName].adv_inputs){
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
  if (extension_settings[extensionName].adv_inputs){
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
async function loadSettings() {
  var saveLocation = getSaveLocation();
  extension_settings[saveLocation] = extension_settings[saveLocation] || {};
  if (Object.keys(extension_settings[saveLocation]).length === 0) {
    Object.assign(extension_settings[saveLocation], defaultSettings);
  } else {
    await loadSettings(extension_settings,false)
  }

  advanced_character = extension_settings[saveLocation].adv_character
  advanced_inputs = extension_settings[saveLocation].adv_inputs
  list_basic_keys = extension_settings[saveLocation].basic_keys
  list_start_keys = extension_settings[saveLocation].start_keys
  list_end_keys = extension_settings[saveLocation].adv_character
  character_trans = extension_settings[saveLocation].char_trans

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
  extension_settings[saveLocation].adv_character = value;
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
  extension_settings[saveLocation].adv_inputs = value;
  advanced_inputs = value;
  saveSettingsDebounced();
  if (value){
    reset()
  } else {
    reset()
  }
}

function setCharTransformed(state){
  extension_settings[getSaveLocation()].char_trans = state;
}
function onTextChanged(){
  var saveLocation = getSaveLocation();
  if (advanced_inputs){
    list_start_keys = $("start_trigger_settings").val()
    list_end_keys = $("end_trigger_settings").val()
    extension_settings[saveLocation].start_keys = list_start_keys
    extension_settings[saveLocation].end_keys = list_end_keys
  } else {
    list_basic_keys = $("basic_trigger_settings").val()
    extension_settings[saveLocation].basic_keys = list_basic_keys
  }
}
function toggleTransformed(){
  setCharTransformed(!extension_settings[getSaveLocation()].char_trans)
}

reset(true)
function reset(wasInit){
  jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/menuentry.html`);
  
    $("#transformation_extension_tab").remove();

    $("#extensions_settings").append(settingsHtml);
  
    $("#adv_character_setting").on("input", onAdvPlayerInput);
    $("#adv_triggers_setting").on("input", onAdvInputsInput);

    const tranTrigBasic = await $.get(`${extensionFolderPath}/htmlelements/basic/transformTriggerBasic.html`);
    const tranBasic = await $.get(`${extensionFolderPath}/htmlelements/basic/transformationadd.html`);
    const tranAdv = await $.get(`${extensionFolderPath}/htmlelements/advanced/transformationAdv.html`);
    const tranTrigAdvancedStart = await $.get(`${extensionFolderPath}/htmlelements/advanced/transformationTriggersstart.html`);
    const tranTrigAdvancedEnd = await $.get(`${extensionFolderPath}/htmlelements/advanced/transformationTriggersend.html`);

    const charTransformed = await $.get(`${extensionFolderPath}/htmlelements/add/chartrans.html`);
    const charNotTransformed = await $.get(`${extensionFolderPath}/htmlelements/add/charnorm.html`);

    if (extension_settings[getSaveLocation()].char_trans){
      $("#table_container").append(charTransformed);
    } else {
      $("#table_container").append(charNotTransformed);
    }

    if (extension_settings[getSaveLocation()].adv_inputs){
      $("#table_container").append(tranTrigAdvancedStart);
      $("#table_container").append(tranTrigAdvancedEnd);
      $("#start_trigger_settings").on("input",onTextChanged)
      $("#end_trigger_settings").on("input",onTextChanged)
      $("#start_trigger_settings").prop("value",extension_settings[saveLocation].start_keys)
      $("#start_trigger_settings").prop("value",extension_settings[saveLocation].end_keys)
    } else {
      $("#table_container").append(tranTrigBasic);
      $("#basic_trigger_settings").on("input",onTextChanged)
      $("#basic_trigger_settings").prop("value",extension_settings[saveLocation].basic_keys)
    }

    if (extension_settings[getSaveLocation()].adv_character)
    {
      $("#table_container").append(tranAdv);
    } else {
      $("#table_container").append(tranBasic);
    }
    loadSettings();
  });
}
