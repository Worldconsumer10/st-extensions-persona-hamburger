
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced,eventSource,event_types,characters } from "../../../../script.js";

const defaultSettings = {
  newDescription: ""
};

// Keep track of where your extension is located, name should match repo name
const extensionName = "st-extension-transformations";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
var extensionSettings = extension_settings[extensionName]

var currentChat = getContext().getCurrentChatId();

eventSource.on(event_types.CHAT_CHANGED, onChatChanged);
eventSource.on(event_types.MESSAGE_SENT, onMessageSent);

function onChatChanged(){
  currentChat = getContext().getCurrentChatId()
  reset()
}

function onMessageSent(msgID){
  var originalFetch = window.fetch;
  window.fetch = function(input, init) {
    var url = (typeof input === 'string') ? input : input.url;

    var regexString = /\/api\/[^\/]*\/generate/
    if (regexString.test(url)) {
      console.log('Generate Request Blocked');
      return new Promise(function(resolve, reject) {
        var body = init.body;
        if (typeof body == "undefined"){
          resolve()
          return;
        }

        try{
          var context = getContext();
          var AIName = context.name2;
          var character = context.characters.find(s => s.name == AIName);
          var description = character.data.description;
          
          console.log(description);
          
          // Custom function for global string replace with multiline support
          function replaceAllOccurrences(input, search, replacement) {
              // Escape special characters in the search string for safe use in a regex
              const escapedSearchString = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              
              // Create a regex pattern with the escaped search string and 'g' flag for global search
              const regexPattern = new RegExp(escapedSearchString, 'gm');
              
              return input.replace(regexPattern, replacement);
          }
          
          var replacedBody = replaceAllOccurrences(body, description, extensionSettings[currentChat].newDescription);
          
          console.log(replacedBody);
        }catch(ex){
          toastr.error(ex)
        }


        resolve();
      });
    }

    return originalFetch.apply(this, arguments);
  };

}
function escapeRegExp(pattern) {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceText(input, searchString, replacement) {
  // Escape special characters in the search string for safe use in a regex
  const escapedSearchString = searchString.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  
  // Create a regex pattern with the escaped search string and 'g' flag for global search
  const regexPattern = new RegExp(escapedSearchString, 'g');
  
  // Replace occurrences of the search string with the replacement value
  const result = input.replace(regexPattern, replacement);
  
  return result;
}


function ConvertToRegexPattern(input)
{
  var escapedInput = Regex.Escape(input);
  return escapedInput;
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