import {loadFramework} from "./hamburger-framework.js"; //This is also required. It is needed to import the functions
import { extension_settings } from "../../../extensions.js";

import { saveSettingsDebounced } from "../../../../script.js";

const defaultSettings = {
};

// Keep track of where your extension is located, name should match repo name
const extensionName = "st-extension-persona-hamburger";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

function loadSettings(){
  if (typeof(extension_settings[extensionName]) == "undefined" || Object.keys(extension_settings[extensionName]).length == 0){
    extension_settings[extensionName] = defaultSettings
    saveSettingsDebounced();
  }
}

jQuery(async () => {
  loadFramework(); //This is required to be called. Don't worry about duplicates, double ups wont occur!
  loadSettings();
});