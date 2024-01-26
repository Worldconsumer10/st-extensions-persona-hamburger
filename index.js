
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
  $("#enabled_setting").prop("checked",extensionSettings[currentChat].enabled)
  $("#enabled_setting_label").text("Enabled For "+getContext().name2)
  $("#character_prompt_override_setting").val(extensionSettings[currentChat].untransformedAppearance)
  $("#character_transformed_prompt_override_setting").val(extensionSettings[currentChat].transformedAppearance)
  $("#transformed_display").text(extensionSettings[currentChat].is_transformed ? "Character Transformed" : "Character Not Transformed")
  $("#transformed_display").attr("style", extensionSettings[currentChat].is_transformed ? "color:green" : "color:red");

  $("#character_transformkeyword").prop("value",extensionSettings[currentChat].transformedAppearance)
  $("#character_untransformkeyword").prop("value",extensionSettings[currentChat].untransformedAppearance)


  if (!isEnabled()){
    $("#chat_id").remove()
    $("#character_transform_field").remove()
    $("#character_untransform_field").remove()
    $("#force_revert_transform").remove()
    $("#transformed_display").text("Character Transformation Impossible")
    $("#transformed_display").attr("style", "color:orange");
    $("#character_transformation_keywords").remove()
  }

}

function onPromptInput(){
  if (!isEnabled()){return;}
  extensionSettings[currentChat].transformedAppearance = $("#character_transformed_prompt_override_setting").val();
  extensionSettings[currentChat].untransformedAppearance = $("#character_prompt_override_setting").val();
  saveSettingsDebounced();
}

function onEnableToggle(event){
  if (typeof currentChat == "undefined"){return;}
  const isEnabledValue = Boolean($(event.target).prop("checked"));
  const shouldReset = extensionSettings[currentChat].enabled != isEnabledValue
  extensionSettings[currentChat].enabled=isEnabledValue;
  if (shouldReset){reset()}
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
  
    $("#force_revert_transform").on("click", ()=>{
      extensionSettings[currentChat].is_transformed=false
      toastr.info(
        `The AI will now use the untransformed appearance`,
        "Transformation Reverted"
      )
    });

    $("#character_transformkeyword").on("input",()=>{
      extensionSettings[currentChat].transformedAppearance = $("#character_transformkeyword").val()
    })
    $("#character_untransformkeyword").on("input",()=>{
      extensionSettings[currentChat].untransformedAppearance = $("#character_untransformkeyword").val()
    })

    loadSettings();
  });
}