
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced,eventSource,event_types,characters } from "../../../../script.js";

const defaultSettings = {
  newDescription: "",
  originalDescription: ""
};

// Keep track of where your extension is located, name should match repo name
const extensionName = "st-extension-transformations";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
var extensionSettings = extension_settings[extensionName]

var currentChat = getContext().getCurrentChatId();

eventSource.on(event_types.CHAT_CHANGED, onChatChanged);
eventSource.on(event_types.MESSAGE_SENT, onMessageSent);
eventSource.on(event_types.MESSAGE_RECEIVED, onMessageRecieved);

function onChatChanged(){
  currentChat = getContext().getCurrentChatId()
  reset()
}

function onMessageRecieved(){
  // $("#description_textarea").trigger("input").trigger("onchange")
}

function onMessageSent(msgID){
  $('#send_textarea').val('').trigger('input');
  var msg = getContext().chat[msgID]
  const chId = characters.findIndex((e) => e.name === getContext().name2);
  if (!characters[chId] || chId === -1) {
    return;
  }
  if (extensionSettings[currentChat].newDescription.length > 1 && extensionSettings[currentChat].originalDescription.length > 1){
    var newDesc = extensionSettings[currentChat].newDescription
    var origDesc = extensionSettings[currentChat].originalDescription
    $("#description_textarea").val(newDesc).text(newDesc).trigger("input").trigger("onchange")
    // $("#description_textarea").val(origDesc).text(origDesc)
  }
}


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