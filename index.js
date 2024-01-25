import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced,eventSource,event_types } from "../../../../script.js";

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

//Self Note: extension_settings[getSaveLocation()].adv_inputs is erroring somewhere

function handleIncomingMessage(){
  try{
    const context = getContext();
    const chat = context.chat;
    const newMessage = getLastElement(chat).mes
    if (newMessage != "..."){
      toastr.info(`New Message Recieved!\nAdvanced Inputs?: ${extension_settings[getSaveLocation()].adv_inputs}`,"Message Recieved")
      if (extension_settings[getSaveLocation()].adv_inputs){
        var startregexPattern = `/([^a-zA-Z0-9]|^)(?:${getTransforms(true)})([^a-zA-Z0-9]|$)/`;
        var endregexPattern = `/([^a-zA-Z0-9]|^)(?:${getTransforms(false)})([^a-zA-Z0-9]|$)/`;
        toastr.info("Regex Result",`${new RegExp(startregexPattern).test(newMessage)}`)
        toastr.info("Regex Result",`${new RegExp(endregexPattern).test(newMessage)}`)
        if (new RegExp(startregexPattern).test(newMessage)) {
          setCharTransformed(true)
        } else if (new RegExp(endregexPattern).test(newMessage)){
          setCharTransformed(false)
        }
      } else {
        var regexPattern = `/([^a-zA-Z0-9]|^)(?:${getBasicTransforms()})([^a-zA-Z0-9]|$)/`;
        toastr.info("Regex Result",`${new RegExp(regexPattern).test(newMessage)}`)
        if (new RegExp(regexPattern).test(newMessage)) {
          toggleTransformed()
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

async function loadSettings() {
  extension_settings[getSaveLocation()] = extension_settings[getSaveLocation()] || {};
  if (Object.keys(extension_settings[getSaveLocation()]).length === 0) {
    Object.assign(extension_settings[getSaveLocation()], defaultSettings);
  }
  try{advanced_inputs_enabled = extension_settings[getSaveLocation()].adv_inputs;}catch(e){}
  $("#adv_character_setting").prop("checked", extension_settings[getSaveLocation()].adv_character);
  $("#adv_triggers_setting").prop("checked", extension_settings[getSaveLocation()].adv_inputs);
  $("#basic_triggers_setting").prop("value", extension_settings[getSaveLocation()].basic_keys);
  $("#start_triggers_setting").prop("value", extension_settings[getSaveLocation()].start_keys);
  $("#end_triggers_setting").prop("value", extension_settings[getSaveLocation()].end_keys);
}

function onAdvPlayerInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[getSaveLocation()].adv_character = value;
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
  extension_settings[getSaveLocation()].adv_inputs = value;
  try{advanced_inputs_enabled = extension_settings[extensionName].adv_inputs;}catch(e){}
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
    } else {
      $("#table_container").append(tranTrigBasic);
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
