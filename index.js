import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced,eventSource,event_types } from "../../../../script.js";

eventSource.on(event_types.MESSAGE_RECEIVED,handleIncomingMessage)

var startTermsStr = ""
var endTermsStr = ""
var basicTermsStr = ""

function handleIncomingMessage(){
  try{
    const context = getContext();
    const chat = context.chat;
    const newMessage = getLastElement(chat).mes
    if (newMessage != "..."){
      toastr.info("New Message Recieved!","Message Recieved")
      if (!extension_settings[extensionName].adv_inputs){
        var regexPattern = `/([^a-zA-Z0-9]|^)(?:${getBasicTransforms()})([^a-zA-Z0-9]|$)/`;
        toastr.info("Regex Result",`${new RegExp(regexPattern).test(newMessage)}`)
        if (new RegExp(regexPattern).test(newMessage)) {
          toggleTransformed()
        }
      } else {
        var startregexPattern = `/([^a-zA-Z0-9]|^)(?:${getTransforms(true)})([^a-zA-Z0-9]|$)/`;
        var endregexPattern = `/([^a-zA-Z0-9]|^)(?:${getTransforms(false)})([^a-zA-Z0-9]|$)/`;
        toastr.info("Regex Result",`${new RegExp(startregexPattern).test(newMessage)}`)
        toastr.info("Regex Result",`${new RegExp(endregexPattern).test(newMessage)}`)
        if (new RegExp(startregexPattern).test(newMessage)) {
          setCharTransformed(true)
        } else if (new RegExp(endregexPattern).test(newMessage)){
          setCharTransformed(false)
        }
      }
    }
  }catch(ex){

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
    endTermsStr.split(",").forEach(element => {
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

const extensionName = "st-extension-transformations";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {};
async function loadSettings() {
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }
  $("#adv_character_setting").prop("checked", extension_settings[extensionName].adv_character);
  $("#adv_triggers_setting").prop("checked", extension_settings[extensionName].adv_inputs);
}

function onAdvPlayerInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].adv_character = value;
  saveSettingsDebounced();
  if (value){
    toastr.info(
      `The new settings will completely override your characters description`,
      "Advanced Character Enabled"
    );
    reset()
  } else {
    reset()
  }
}
function onAdvInputsInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].adv_inputs = value;
  saveSettingsDebounced();
  if (value){
    reset()
  } else {
    reset()
  }
}

function setCharTransformed(state){
  extension_settings[extensionName].char_trans = state;
}
function toggleTransformed(){
  setCharTransformed(!extension_settings[extensionName].char_trans)
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

    if (extension_settings[extensionName].char_trans){
      $("#table_container").append(charTransformed);
    } else {
      $("#table_container").append(charNotTransformed);
    }

    if (extension_settings[extensionName].adv_inputs){
      $("#table_container").append(tranTrigAdvancedStart);
      $("#table_container").append(tranTrigAdvancedEnd);
    } else {
      $("#table_container").append(tranTrigBasic);
    }

    if (extension_settings[extensionName].adv_character)
    {
      $("#table_container").append(tranAdv);
    } else {
      $("#table_container").append(tranBasic);
    }
    
    loadSettings();
  });
}
