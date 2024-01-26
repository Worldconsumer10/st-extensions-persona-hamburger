
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
          var newDescription = extensionSettings[currentChat].newDescription

          var inputObject = parseUserAndChar(context.name1,context.name2,JSON.parse(body).input)

          console.log("Description")
          console.log(description)
          console.log("Input Object")
          console.log(inputObject)

        }catch(ex){
          console.error(ex)
          toastr.error(ex)
        }


        resolve();
      });
    }

    return originalFetch.apply(this, arguments);
  };

}

function parseUserAndChar(userName,charName,string){
  const patternUser = "{{user}}"
  const patternChar = "{{char}}"

  const userNameRegex = new RegExp(userName,"g")
  const charNameRegex = new RegExp(charName,"g")

  var replacedString = string.replace(userNameRegex,patternUser)
  return replacedString.replace(charNameRegex, patternChar)
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