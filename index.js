
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced,eventSource,event_types, extension_prompt_types, getCurrentChatId, getRequestHeaders, is_send_press, setExtensionPrompt, substituteParams  } from "../../../../script.js";

const defaultSettings = {
  transformedAppearance: "",
  untransformedAppearance: "",
  is_strong: false,
  is_transformed: false,
  enabled: true
};

// Keep track of where your extension is located, name should match repo name
const extensionName = "st-extension-transformations";
const extension_prompt_tag = "transform_tag"
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
var extensionSettings = extension_settings[extensionName]

var currentChat = getContext().getCurrentChatId();

eventSource.on(event_types.CHAT_CHANGED, onChatChanged);

function isEnabled(){
  if (typeof currentChat == "undefined")
  { return false; }
  return extensionSettings[currentChat].enabled || false
}

function onChatChanged(){
  var context = getContext()
  if (typeof context.characterId == "undefined")
  {
    currentChat=null;
    return;
  }
  currentChat = context.name2
  reset()
}

async function generateInterceptor(chat){
  if (!isEnabled()){return;}
  //Called when a generation is being proccessed
  var context = getContext()
  var weakContext = ["[","]"]
  var strongContext = ["{","}"]
  var appear = context.name2

  var characters = context.characters
  var charIndex = characters.findIndex(u=>u.name == appear)
  var character = characters[charIndex]
  var charDescription = character.description
  var selDescription = extensionSettings[currentChat].is_transformed ? extensionSettings[currentChat].newDescription : charDescription
  var contextBorder = extensionSettings[currentChat].is_strong ? strongContext : weakContext
  setExtensionPrompt(extension_prompt_tag,`${contextBorder[0]} ${appear}'s Appearance: ${selDescription} ${contextBorder[1]}`,0,-1,false)
  console.log("Added Extension Prompt")
}

window['transformation_generateInterception'] = generateInterceptor

async function loadSettings() {
  if (typeof currentChat == "undefined"){return;}
  if (typeof extensionSettings[currentChat] == "undefined"){
    extensionSettings[currentChat]={}
  }
  if (Object.keys(extensionSettings[currentChat]).length == 0){
    extensionSettings[currentChat] = defaultSettings;
  }
  $("#enabled_setting").val(extensionSettings[currentChat].enabled)
  $("#character_prompt_override_setting").val(extensionSettings[currentChat].untransformedAppearance)
  $("#character_transformed_prompt_override_setting").val(extensionSettings[currentChat].transformedAppearance)

  if (!extensionSettings[currentChat].enabled){
    $("#character_prompt_override_setting").remove()
    $("#character_transformed_prompt_override_setting").remove()
  }

}

function onPromptInput(){
  if (!isEnabled()){return;}
  extensionSettings[currentChat].transformedAppearance = $("#character_transformed_prompt_override_setting").val();
  extensionSettings[currentChat].untransformedAppearance = $("#character_prompt_override_setting").val();
  saveSettingsDebounced();
}

function onEnableToggle(){
  if (!isEnabled()){return;}
  const isEnabled = $("#enabled_setting").val()
  extensionSettings[currentChat].enabled=isEnabled;
  reset()
}

reset()

function reset(){
  jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/main.html`);
    const noChatSettingsHtml = await $.get(`${extensionFolderPath}/noChat.html`);
    const groupChatSettingsHtml = await $.get(`${extensionFolderPath}/groupChat.html`);
  
    $("#transformation_extension_tab").remove()

    var context = getContext()

    if (typeof currentChat == "undefined"){
      $("#extensions_settings").append(noChatSettingsHtml);
    } else if (context.name2 == "" || context.name2 == " "){
      $("#extensions_settings").append(groupChatSettingsHtml);
    } else {
      $("#extensions_settings").append(settingsHtml);
      $("#chat_id").text("Current Chat: "+currentChat)
    }
  
    $("#character_prompt_override_setting").on("input",onPromptInput)
    $("#character_transformed_prompt_override_setting").on("input",onPromptInput)
    $("#enabled_setting").on("input",onEnableToggle)
  
    loadSettings();
  });
}