function loadFramework() {
    $(async()=>{
        var hambDiv = document.createElement("div")
        hambDiv.style = "width:100%;height:auto;max-width:20px;cursor:pointer"
        var buns = document.createElement("div")
        buns.style = "width:100%; height:2px; background-color:white;border-radius:3px;margin-top:3px"
        var meat = document.createElement("div")
        meat.style = "width:100%; height:2px; background-color:white;margin-top:3px;margin-bottom:3px; border-radius:3px"

        var personaElement = $("#persona-management-block")[0]
        if (typeof personaElement == "undefined"){
            toastr.warn("FAILED","Hamburger could not be added as framework was loaded too early")
            console.warn("[Hamburger Framework] Loaded too early! Failed to add!")
            return
        }
        var personaTab = personaElement.children[0].children[0]
        var lastNode = personaTab.children[personaTab.children.length-1].cloneNode(true)
        personaTab.children[personaTab.children.length-1].remove()

        hambDiv.appendChild(buns.cloneNode(true))
        hambDiv.appendChild(meat)
        hambDiv.appendChild(buns.cloneNode(true))

        personaTab.appendChild(hambDiv)
        personaTab.appendChild(lastNode)
    });
}

export {
    loadFramework
}