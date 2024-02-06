function loadFramework() {
    $(async()=>{
        var hambDiv = document.createElement("div")

        hambDiv.className = "tag showTagList actionable margin-right-10px"
        hambDiv.style = "background-color: rgba(150, 100, 100, 0.5);"

        var personaElement = $("#persona-management-block")[0]
        if (typeof personaElement == "undefined"){
            toastr.warn("FAILED","Hamburger could not be added as framework was loaded too early")
            console.warn("[Hamburger Framework] Loaded too early! Failed to add!")
            return
        }
        var personaTab = personaElement.children[0].children[0]
        var lastNode = personaTab.children[personaTab.children.length-1].cloneNode(true)
        personaTab.children[personaTab.children.length-1].remove()
        personaTab.appendChild(hambDiv)
        personaTab.appendChild(lastNode)
    });
}
export {
    loadFramework
}