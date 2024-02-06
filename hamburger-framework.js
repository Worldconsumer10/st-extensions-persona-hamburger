function loadFramework() {
    $(async()=>{
        var hambDiv = document.createElement("div")
        var personaElement = $("#persona-management-block")[0]
        if (typeof personaElement == "undefined"){
            toastr.warn("FAILED","Hamburger could not be added as framework was loaded too early")
            console.warn("[Hamburger Framework] Loaded too early! Failed to add!")
            return
        }
        console.log(personaElement)
        personaElement.firstChild.firstChild.appendChild(hambDiv)
    });
}
export {
    loadFramework
}