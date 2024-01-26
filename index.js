
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced,eventSource,event_types, extension_prompt_types, getCurrentChatId, getRequestHeaders, is_send_press, setExtensionPrompt, substituteParams  } from "../../../../script.js";

const defaultSettings = {
  newDescription: "",
  is_strong: false
};

// Keep track of where your extension is located, name should match repo name
const extensionName = "st-extension-transformations";
const extension_prompt_tag = "transform_tag"
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
var extensionSettings = extension_settings[extensionName]

var currentChat = getContext().getCurrentChatId();

eventSource.on(event_types.CHAT_CHANGED, onChatChanged);

function onChatChanged(){
  currentChat = getContext().getCurrentChatId()
  reset()
}

async function generateInterceptor(chat){
  //Called when a generation is being proccessed
  var weakContext = ["[","]"]
  var strongContext = ["{","}"]
  var appear = getContext().name2

  var characters = getContext().characters
  var charIndex = characters.findIndex(u=>u.name == appear)
  var character = characters[charIndex]
  console.log(character)
  var charDescription = characters.data.description

  var contextBorder = extensionSettings[currentChat].is_strong ? strongContext : weakContext
  setExtensionPrompt(extension_prompt_tag,`${contextBorder[0]} ${appear}'s Appearance: ${charDescription} ${contextBorder[1]}`,0,-1,false)
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
  $("#character_prompt_override_setting").val(extensionSettings[currentChat].newDescription)

}

function onPromptInput(){
  if (typeof currentChat == "undefined"){return;}
  var promptVal = $("#character_prompt_override_setting").val();
  extensionSettings[currentChat].newDescription = promptVal;
  saveSettingsDebounced();
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
  
    loadSettings();
  });
}