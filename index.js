import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "st-extension-transformations";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {};

async function loadSettings() {
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }
  $("#adv_character_setting").prop("checked", extension_settings[extensionName].adv_character).trigger("input");
}

function onExampleInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].adv_character = value;
  saveSettingsDebounced();
  if (value){
    toastr.info(
      `The new settings will completely override your characters description`,
      "Advanced Character Enabled"
    );
    reset(true)
  }
}

reset(false)
function reset(advanced_character){
  jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/menuentry.html`);
  
    $("#transformation_extension_tab").remove();

    $("#extensions_settings").append(settingsHtml);
  
    $("#adv_character_setting").on("input", onExampleInput);
    const tranTrigBasic = await $.get(`${extensionFolderPath}/htmlelements/basic/transformTriggerBasic.html`);
    const tranBasic = await $.get(`${extensionFolderPath}/htmlelements/basic/transformationadd.html`);
    const tranTrigAdvanced = await $.get(`${extensionFolderPath}/htmlelements/advanced/transformationTriggers.html`);

    if (advanced_character)
    {
      $("#table_container").append(tranTrigAdvanced);
      toastr.info(
        `Setting up the UI`,
        "Loading Advanced Character"
        );
    } else {
      $("#table_container").append(tranTrigBasic);
    
      $("#table_container").append(tranBasic);
    }
    
    loadSettings();
  });
}
