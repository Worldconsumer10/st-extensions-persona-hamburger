function loadFramework() {
    $(async()=>{
        var hambDiv = document.createElement("div")
        var personaElement = $("#persona-management-block")
        personaElement.firstChild.firstChild.appendChild(hambDiv)
    });
}
export {
    loadFramework
}