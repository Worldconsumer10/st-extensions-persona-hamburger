
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced,eventSource,event_types, extension_prompt_types, getCurrentChatId, getRequestHeaders, is_send_press, setExtensionPrompt, substituteParams  } from "../../../../script.js";

const defaultSettings = {
  transformedAppearance: "",
  untransformedAppearance: "",
  transformedKeywords: "",
  untransformedKeywords: "",
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
eventSource.on(event_types.MESSAGE_SENT, checkKeywordGeneration);

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

async function generateInterceptor(){
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
  setExtensionPrompt(extension_prompt_tag,`${contextBorder[0]} ${appear}'s Appearance: ${selDescription} ${contextBorder[1]}`,0,-1,true)
}

function checkKeywordGeneration(){
  if (!isEnabled()){return;}
  const context = getContext();
  const messageHistory = context.chat
  const recentMessage = messageHistory.reverse()[1] //Gets the message BEFORE the user message
  const messageContent = recentMessage.mes

  if (extensionSettings[currentChat].is_transformed){
    extensionSettings[currentChat].untransformedKeywords.split(",").forEach(transformedKeyword => {
      const trKeyword = transformedKeyword.trim().toLowerCase()
      if (messageContent.toLowerCase().includes(trKeyword)){
        extensionSettings[currentChat.is_transformed] = false
        reset()
        return;
      }
    });
  } else {
    extensionSettings[currentChat].transformedKeywords.split(",").forEach(transformedKeyword => {
      const trKeyword = transformedKeyword.trim().toLowerCase()
      if (messageContent.toLowerCase().includes(trKeyword)){
        extensionSettings[currentChat.is_transformed] = true
        reset()
        return;
      }
    });
  }

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

  $("#character_transformkeyword").val(extensionSettings[currentChat].transformedKeywords)
  $("#character_untransformkeyword").val(extensionSettings[currentChat].untransformedKeywords)

  $("#is_instruct").prop("checked",extensionSettings[currentChat].is_strong)


  if (!isEnabled()){
    $("#chat_id").remove()
    $("#character_transform_field").remove()
    $("#character_untransform_field").remove()
    $("#force_revert_transform").remove()
    $("#transformed_display").text("Character Transformation Impossible")
    $("#transformed_display").attr("style", "color:orange");
    $("#character_transformation_keywords").remove()
    $("#isInstruct").remove()
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
    $("#character_transformed_prompt_override_setting").on("input",onPromptInput)
    $("#enabled_setting").on("input",onEnableToggle)
  
    if (extensionSettings[currentChat].is_transformed){
      $("#force_revert_transform").removeAttr("disabled")
    } else {
      $("#force_revert_transform").attr("disabled","")
    }

    $("#force_revert_transform").on("click", ()=>{
      extensionSettings[currentChat].is_transformed=false
      $("#force_revert_transform").attr("disabled","")
      toastr.info(
        `The AI will now use the untransformed appearance`,
        "Transformation Reverted"
      )
      saveSettingsDebounced();
    });
    $("#character_transformkeyword").on("input",()=>{
      var ending = $("#character_transformkeyword").val().endsWith(";;")
      if (ending){
        extensionSettings[currentChat].untransformedKeywords = $("#character_transformkeyword").val()
        saveSettingsDebounced();
        $("#character_transformkeyword").text("").val("")
        var element = new Option()
        element.value = $("#character_transformkeyword").val().split(";;")[0]
        $("#character_transform_dropdown").append(element)
      }
    })
    $("#character_untransformkeyword").on("input",()=>{
      var ending = $("#character_untransformkeyword").val().endsWith(";;")
      if (ending){
        extensionSettings[currentChat].untransformedKeywords = $("#character_untransformkeyword").val()
        saveSettingsDebounced();
        $("#character_untransformkeyword").text("").val("")
        var element = new Option()
        element.value = $("#character_untransformkeyword").val().split(";;")[0]
        $("#character_untransform_dropdown").append(element)
      }
    })

    $("#is_instruct").on("input",(event)=>{
      const isEnabledValue = Boolean($(event.target).prop("checked"));
      extensionSettings[currentChat].is_strong=isEnabledValue;
      saveSettingsDebounced();
    });

    loadSettings();
  });
}