/*
  `cRequiredField` may be used to add required-field behavior  
  to a Sharepoint form field not specified as `required` in Designer.

  ## Usage
    Instantiate a `cRequiredField` object to add required-field behavior:
    ~~~
      var cRequired[field-label-id] = new cRequiredField([field-label-id])
    ~~~
    For example:
    ~~~
      var cRequiredLocation = new cRequiredField("Location")
    ~~~
    Check whether a cRequiredField object contains a value:
    ~~~
      if ( cRequiredLocation.hasInputValue() ) {...}
    ~~~

  ## Change Log
  20190611-1.4.1-default input value validation, textarea support, and error title emulation fix-g
  20190606-1.4.0-initial SELECT `DropDownChoice`-g
  20190605-1.3.0-initial input error display after invalid post-g
  20190604-1.2.1-downgrade `let` to `var` to ecma-5-g
  20190604-1.2.0-initial text box validation-g
  20190530-1.1.0-initial lookup validation-g
  20190529-1.0.0-initial implementation-g

*/

function cRequiredField(tabId, labelId) {
  //const fieldTabId = tabId
  var input = { 
    id: "",
    title: "",
    titleRequiredSuffix: " is a required field.",      
    requiredErrorSpanClass: "ms-formvalidation ms-csrformvalidation",
    requiredErrorInnerSpanText: "You can't leave this blank.",
    requiredErrorInnerSiblingSpanRole: "alert",
    //requiredErrorSpan: "<SPAN class='ms-formvalidation ms-csrformvalidation'></SPAN>",
    //requiredErrorSpanChild: "<SPAN role='alert'>You can't leave this blank.<br></SPAN>",
    // 120 existValue: false
    // -141 hasValue: false,
    hasValue: function () { return hasValue(input.id) },
    // +120
    isActive: true
  }

  var label = { 
    id: labelId,
    title: "",
    requiredSpan: "<SPAN class='ms-accentText' title='This is a required field.'> *</SPAN>"
  }
  setInputId(labelId)
  setInputTitle()
  insertLabelRequiredSpan()
  // -141 sp title change emulation negatively impacts jquery searches by title
  // appendInputTitleRequiredSuffix()
  setInputValidationOnBlurEvent()

  function setInputId (id) {
    // +120 begin
    var divs = document.getElementsByTagName("div")

    for (var i = 0; i < divs.length; i++) {
      var divId = divs[i].getAttribute("id")
      var divRole = divs[i].getAttribute("role")
      if ((divId != null) && (divId.startsWith(id)))
        if ((divId.indexOf("_x0020_")) == (id.indexOf("_x0020_"))) 
          if ((divRole != null) && (divRole == "textbox")) {
            input.id = divId
            break
          }
    }

    if ( input.id == "" ) {
      var selects = document.getElementsByTagName("select")

      for (var i = 0; i < selects.length; i++) {
        // +110
        var selectId = selects[i].getAttribute("id")
        // 110 if ((selects[i].getAttribute("id") != null) && (selects[i].getAttribute("id").startsWith(id)))
        if ((selectId != null) && (selectId.startsWith(id)))
          // +110 handle cases with/out space: `system` != `systemx0020component`
          if ((selectId.indexOf("_x0020_")) == (id.indexOf("_x0020_")))
            // +120
            // 140 if ((selectId.endsWith("LookupField")) || (selectId.endsWith("SelectResult"))) {
            if ((selectId.endsWith("LookupField")) || (selectId.endsWith("SelectResult")) || (selectId.endsWith("DropDownChoice"))) {
              // 110 input.id = selects[i].getAttribute("id")
              input.id = selectId
              // +120
              break
            }
      }

    }
    // +141 begin
    if ( input.id == "" ) {
      var textareas = document.getElementsByTagName("textarea")

      for (var i = 0; i < textareas.length; i++) {
        var textareaId = textareas[i].getAttribute("id")
        if ((textareaId != null) && (textareaId.startsWith(id)))
          if ((textareaId.indexOf("_x0020_")) == (id.indexOf("_x0020_"))) {
            input.id = textareaId
            break
          }
      }

    }  // +141 end
    // +120 end
    if ( input.id == "" ) {
      var inputs = document.getElementsByTagName("input")

      for (var i = 0; i < inputs.length; i++) {
        var inputId = inputs[i].getAttribute("id")
        if ((inputId != null) && (inputId.startsWith(id)))
          // +110 handle cases with/out space: `system` != `systemx0020component`
          if ((inputId.indexOf("_x0020_")) == (id.indexOf("_x0020_"))) {
            input.id = inputId
            break
          } 
      }

    }
    // +140 
    if ( input.id == "" ) console.log("ERROR: input id not found for element: " + id)
  }

  function setInputTitle () {
    // -140 input.title = document.getElementById(input.id).getAttribute("title")
    // +140 begin
    var inputElement = document.getElementById(input.id)
    if (typeof inputElement.title != "undefined")
      input.title = inputElement.title
    //var inputTitle = document.getElementById(input.id).getAttribute("title")
    //if (inputTitle != null)
      //input.title = inputTitle
    // +140 end
  }

  // alternative is to use element.appendChild()
  function insertLabelRequiredSpan () {
    var element = document.getElementById(label.id)
    var elementInnerHtml = element.innerHTML
    var elementInnerHtmlClosingTagIndex = elementInnerHtml.search("</")
    var elementInnerHtmlSliceToClosingTag = elementInnerHtml.slice(0, elementInnerHtmlClosingTagIndex)
    var elementInnerHtmlClosingTagSlice = elementInnerHtml.slice(elementInnerHtmlClosingTagIndex)
    element.innerHTML = elementInnerHtmlSliceToClosingTag + label.requiredSpan + elementInnerHtmlClosingTagSlice
  }

  function appendInputTitleRequiredSuffix () {
    var element = document.getElementById(input.id)
    element.setAttribute("title", input.title + input.titleRequiredSuffix)
  }

  // +130
  var getInputErrorSpan = function (inputElement) {
    var inputErrorSpan = null
    var inputElementParent = inputElement.parentElement
    var inputElementSibling = inputElementParent.firstChild

    while (inputElementSibling) {
      if ( inputElementSibling.nodeName == "SPAN" )
        if ( inputElementSibling.id.startsWith("Error_") ) {
          inputErrorSpan = inputElementSibling
          break
        }
      inputElementSibling = inputElementSibling.nextSibling
    }

    return inputErrorSpan
  } 

  // +130
  var insertInputError = function (id) {
    var inputElement = document.getElementById(id)
    var inputErrorSpan = getInputErrorSpan(inputElement)
    if ( inputErrorSpan == null ) {
      var inputElementRequiredErrorSpan = document.createElement("SPAN")
      inputElementRequiredErrorSpan.setAttribute("id", "Error_" + id)
      inputElementRequiredErrorSpan.setAttribute("class", input.requiredErrorSpanClass)
      var inputElementRequiredErrorInnerSpan = document.createElement("SPAN")
      var inputElementRequiredErrorInnerSiblingSpan = document.createElement("SPAN")
      inputElementRequiredErrorInnerSiblingSpan.setAttribute("role", input.requiredErrorInnerSiblingSpanRole)
      var inputElementRequiredErrorInnerSpanText = document.createTextNode(input.requiredErrorInnerSpanText)
      inputElementRequiredErrorInnerSiblingSpan.appendChild(inputElementRequiredErrorInnerSpanText)
      linebreak = document.createElement("br");
      inputElementRequiredErrorInnerSiblingSpan.appendChild(linebreak)
      inputElementRequiredErrorSpan.appendChild(inputElementRequiredErrorInnerSiblingSpan)
      inputElement.parentElement.appendChild(inputElementRequiredErrorSpan)
    }
  }

  // +141 begin
  function hasValue(id) {
    var hasValue = false
    var inputElement = document.getElementById(id)
    var isEmpty = false
    if ( typeof inputElement.value != "undefined" ) {
      if ( (inputElement.value == "") || (inputElement.value == "0") )
        isEmpty = true
    } else
      if (inputElement.innerText.length <=2)
        isEmpty = true
    if (!isEmpty) {
      hasValue = true
    } 
    return hasValue
  }  // +141 end

  function setInputValidationOnBlurEvent () { 
/* -130
    function getInputErrorSpan(inputElement) {
      var inputErrorSpan = null
      var inputElementParent = inputElement.parentElement
      var inputElementSibling = inputElementParent.firstChild

      while (inputElementSibling) {
        if ( inputElementSibling.nodeName == "SPAN" )
          if ( inputElementSibling.id.startsWith("Error_") ) {
            inputErrorSpan = inputElementSibling
            break
          }
        inputElementSibling = inputElementSibling.nextSibling
      }

      return inputErrorSpan
    } 

    function insertInputError (id) {
      var inputElement = document.getElementById(id)
      var inputErrorSpan = getInputErrorSpan(inputElement)
      if ( inputErrorSpan == null ) {
        var inputElementRequiredErrorSpan = document.createElement("SPAN")
        inputElementRequiredErrorSpan.setAttribute("id", "Error_" + id)
        inputElementRequiredErrorSpan.setAttribute("class", input.requiredErrorSpanClass)
        var inputElementRequiredErrorInnerSpan = document.createElement("SPAN")
        var inputElementRequiredErrorInnerSiblingSpan = document.createElement("SPAN")
        inputElementRequiredErrorInnerSiblingSpan.setAttribute("role", input.requiredErrorInnerSiblingSpanRole)
        var inputElementRequiredErrorInnerSpanText = document.createTextNode(input.requiredErrorInnerSpanText)
        inputElementRequiredErrorInnerSiblingSpan.appendChild(inputElementRequiredErrorInnerSpanText)
        linebreak = document.createElement("br");
        inputElementRequiredErrorInnerSiblingSpan.appendChild(linebreak)
        inputElementRequiredErrorSpan.appendChild(inputElementRequiredErrorInnerSiblingSpan)
        inputElement.parentElement.appendChild(inputElementRequiredErrorSpan)
      }
    }
-130 */
    function removeInputError (id) {
      var inputElement = document.getElementById(id)
      var inputErrorSpan = getInputErrorSpan(inputElement)
      if ( inputErrorSpan != null ) 
        inputElement.parentElement.removeChild(inputErrorSpan)
    }

    function validateInput(id) {
      /* -141 var inputElement = document.getElementById(id)
      // +110
      var isEmpty = false
      // +120 begin
      if ( typeof inputElement.value != "undefined" ) {
        if ( (inputElement.value == "") || (inputElement.value == "0") )
          isEmpty = true
      } else
        if (inputElement.innerText.length <=2)
          isEmpty = true
      // +120 end -141 */
      // 141 if (isEmpty) {
      if (hasValue(id)) {
        // -141 insertInputError(id)
        // +141
        removeInputError(id)
        // 120 input.existValue = false
        // -141 input.hasValue = false
      }
      else {
        // -141 removeInputError(id)
        // +141
        insertInputError(id)
        // 120 input.existValue = true
        // -141 input.hasValue = true
      } 
    }

    // +110
    var inputElement = document.getElementById(input.id)
    // +120 begin
    if ((inputElement.childElementCount > 0) && (inputElement.firstElementChild.tagName == "P"))
      //inputElement.firstElementChild.onblur = function() { validateInput(inputElement.firstElementChild) } 
      inputElement.onfocusout = function() { validateInput(input.id) } 
    else
    // +120 end
      // 110
      //document.getElementById(input.id).onblur = function() { validateInput(input.id) } 
      inputElement.onblur = function() { validateInput(input.id) } 
  }

  return {
    // +120
    tabId: tabId,
    setInputIsActive: function (InputIsActive) { input.isActive = InputIsActive },
    //getFieldTabId: function () { return fieldTabId },
    getInput: function () { return input },
    getInputId: function () { return input.id },
    getLabel: function () { return label },
    // 120 hasInputValue: function () { return input.existValue },
    hasInputValue: function () { return input.hasValue() },
    // +120
    isInputActive: function () { return input.isActive },
    displayInputRequiredError: function () { insertInputError(input.id) }
  }
}
