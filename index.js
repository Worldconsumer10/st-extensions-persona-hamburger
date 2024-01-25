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
