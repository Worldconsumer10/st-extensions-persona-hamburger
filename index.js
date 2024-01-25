import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "st-extension-transformations";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {};
var transformWord = []

async function loadSettings() {
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }
  $("#example_setting").prop("checked", extension_settings[extensionName].example_setting).trigger("input");
}

function onExampleInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].example_setting = value;
  saveSettingsDebounced();
  if (value){
    toastr.info(
      `The new settings will completely override your characters description`,
      "Advanced Character Enabled"
    );
  }
}

resetHtml();
function resetHtml(){
  jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/menuentry.html`);
  
  
    const tranTrigBasic = await $.get(`${extensionFolderPath}/htmlelements/transformTriggerBasic.html`);
    const tranBasic = await $.get(`${extensionFolderPath}/htmlelements/transformationadd.html`);
    var v = $("#extensions_settings").find(settingsHtml);
    if (v!=null || v!=undefined)
    {
      v.remove()
    }
  
    $("#extensions_settings").append(settingsHtml);
  
    $("#adv_character_setting").on("input", onExampleInput);
  
    $("#table_container").append(tranTrigBasic);
  
    $("#table_container").append(tranBasic);
    
    loadSettings();
  });
}
