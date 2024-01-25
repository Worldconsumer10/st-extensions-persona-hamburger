
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced } from "../../../../script.js";

const defaultSettings = {
  newDescription: ""
};

// Keep track of where your extension is located, name should match repo name
const extensionName = "st-extension-transformations";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
var extensionSettings = extension_settings[extensionName];

if (typeof(extensionSettings) == "undefined"){
  Object.assign(extensionSettings,{})
}

var chatExtensionSettings = extensionSettings[getContext().getCurrentChatId()] = defaultSettings

console.log(chatExtensionSettings)

function saveSettings(){
  extensionSettings[getContext().getCurrentChatId()] = chatExtensionSettings
  extension_settings = extensionSettings;
  saveSettingsDebounced()
  console.log(chatExtensionSettings)
}

if (typeof chatExtensionSettings == "undefined"){
  chatExtensionSettings = defaultSettings;
}

async function loadSettings() {
  //Load the settings

  $("#character_prompt_override_setting").val(chatExtensionSettings.newDescription)

}

function onPromptInput(){
  var promptVal = $("#character_prompt_override_setting").val();
  chatExtensionSettings.newDescription = promptVal;
  saveSettings();
}

jQuery(async () => {
  const settingsHtml = await $.get(`${extensionFolderPath}/main.html`);
  $("#extensions_settings").append(settingsHtml);

  $("#character_prompt_override_setting").on("input",onPromptInput)

  loadSettings();
});