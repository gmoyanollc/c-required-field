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
  20190618-1.6.0-remove error display when inactive-g
  20190613-1.5.0-initial multi-input checkbox and radio required field
  20190611-1.4.1-default input value validation, textarea support, and error title emulation fix-g
  20190606-1.4.0-initial SELECT `DropDownChoice`-g
  20190605-1.3.0-initial input error display after invalid post-g
  20190604-1.2.1-downgrade `let` to `var` to ecma-5-g
  20190604-1.2.0-initial text box validation-g
  20190530-1.1.0-initial lookup validation-g
  20190529-1.0.0-initial implementation-g

*/

function cRequiredField(tabId, labelId) {
  var input = {
    ids: [],
    title: "",
    titleRequiredSuffix: " is a required field.",
    requiredErrorSpanClass: "ms-formvalidation ms-csrformvalidation",
    requiredErrorInnerSpanText: "You can't leave this blank.",
    requiredErrorInnerSiblingSpanRole: "alert",
    requiredErrorInnerSiblingSpanMultiInputStyle: "margin-left: 1em",
    hasValue: function () { return hasValue() },
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
  setInputValidationOnBlurEvent()

  function setInputId(id) {
    var divs = document.getElementsByTagName("div")

    for (var i = 0; i < divs.length; i++) {
      var divId = divs[i].getAttribute("id")
      var divRole = divs[i].getAttribute("role")
      if ((divId != null) && (divId.startsWith(id)))
        if ((divId.indexOf("_x0020_")) == (id.indexOf("_x0020_")))
          if ((divRole != null) && (divRole == "textbox")) {
            input.ids[0] = divId
            break
          }
    }

    if (input.ids.length == 0) {
      var selects = document.getElementsByTagName("select")

      for (var i = 0; i < selects.length; i++) {
        var selectId = selects[i].getAttribute("id")
        if ((selectId != null) && (selectId.startsWith(id)))
          // +110 handle cases with/out space: `system` != `systemx0020component`
          if ((selectId.indexOf("_x0020_")) == (id.indexOf("_x0020_")))
            if ((selectId.endsWith("LookupField")) || (selectId.endsWith("SelectResult")) || (selectId.endsWith("DropDownChoice"))) {
              input.ids[0] = selectId
              break
            }
      }

    }
    if (input.ids.length == 0) {
      var textareas = document.getElementsByTagName("textarea")

      for (var i = 0; i < textareas.length; i++) {
        var textareaId = textareas[i].getAttribute("id")
        if ((textareaId != null) && (textareaId.startsWith(id)))
          if ((textareaId.indexOf("_x0020_")) == (id.indexOf("_x0020_"))) {
            input.ids[0] = textareaId
            break
          }
      }

    }
    if (input.ids.length == 0) {
      var inputs = document.getElementsByTagName("input")

      for (var i = 0; i < inputs.length; i++) {
        var inputId = inputs[i].getAttribute("id")
        if ((inputId != null) && (inputId.startsWith(id)))
          // +110 handle cases with/out space: `system` != `systemx0020component`
          if ((inputId.indexOf("_x0020_")) == (id.indexOf("_x0020_")))
            if ((inputs[i].type == "checkbox") || (inputs[i].type == "radio"))
              input.ids.push(inputId)
            else {
              input.ids[0] = inputId
              break
            }
      }

    }
    if (input.ids.length == 0) console.log("[error]: input id not found for element: " + id)
  }

  function setInputTitle() {
    var inputElement = document.getElementById(input.ids[0])
    if (typeof inputElement.title != "undefined")
      input.title = inputElement.title
    else console.log("[warning] undefined input title: " + input.ids[0])
  }

  // alternative is to use element.appendChild()
  function insertLabelRequiredSpan() {
    var element = document.getElementById(label.id)
    var elementInnerHtml = element.innerHTML
    var elementInnerHtmlClosingTagIndex = elementInnerHtml.search("</")
    var elementInnerHtmlSliceToClosingTag = elementInnerHtml.slice(0, elementInnerHtmlClosingTagIndex)
    var elementInnerHtmlClosingTagSlice = elementInnerHtml.slice(elementInnerHtmlClosingTagIndex)
    element.innerHTML = elementInnerHtmlSliceToClosingTag + label.requiredSpan + elementInnerHtmlClosingTagSlice
  }

  var getInputErrorSpan = function (inputElement) {
    var inputErrorSpan = null
    var inputElementParent = inputElement.parentElement
    var inputElementSibling = inputElementParent.firstChild

    while (inputElementSibling) {
      if (inputElementSibling.nodeName == "SPAN")
        if (inputElementSibling.id.startsWith("Error_")) {
          inputErrorSpan = inputElementSibling
          break
        }
      inputElementSibling = inputElementSibling.nextSibling
    }

    return inputErrorSpan
  }

  var insertInputError = function () {
    var inputElement = document.getElementById(input.ids[input.ids.length - 1])
    var inputErrorSpan = getInputErrorSpan(inputElement)
    if (inputErrorSpan == null) {
      var inputElementRequiredErrorSpan = document.createElement("SPAN")
      inputElementRequiredErrorSpan.setAttribute("id", "Error_" + inputElement)
      inputElementRequiredErrorSpan.setAttribute("class", input.requiredErrorSpanClass)
      var inputElementRequiredErrorInnerSiblingSpan = document.createElement("SPAN")
      inputElementRequiredErrorInnerSiblingSpan.setAttribute("role", input.requiredErrorInnerSiblingSpanRole)
      var inputElementRequiredErrorInnerSpanText = document.createTextNode(input.requiredErrorInnerSpanText)
      // prepend spacer for multi-input checkbox and radio required fields
      if (input.ids.length > 1) {
        inputElementRequiredErrorInnerSiblingSpan.setAttribute("style", input.requiredErrorInnerSiblingSpanMultiInputStyle)
      }
      inputElementRequiredErrorInnerSiblingSpan.appendChild(inputElementRequiredErrorInnerSpanText)
      inputElementRequiredErrorInnerSiblingSpan.appendChild(document.createElement("BR"))
      inputElementRequiredErrorSpan.appendChild(inputElementRequiredErrorInnerSiblingSpan)
      inputElement.parentElement.appendChild(inputElementRequiredErrorSpan)
    }
  }

  function hasValue() {
    var hasValue = false
    var inputElement

    for (var item in input.ids) {
      inputElement = document.getElementById(input.ids[item])
      if (typeof inputElement.type != "undefined") {
        switch (inputElement.type) {
          case "checkbox":
          case "radio":
            if (inputElement.checked) {
              hasValue = true
              break
            } else
              break
          default:
            if ((inputElement.value != "") && (inputElement.value != "0")) {
              hasValue = true
              break
            }
        }
      } else
        if (inputElement.innerText.length > 2)
          hasValue = true
      if (hasValue)
        break
    }

    return hasValue
  }

  function setInputValidationOnBlurEvent() {

    function removeInputError() {
      var inputElement = document.getElementById(input.ids[input.ids.length - 1])
      var inputErrorSpan = getInputErrorSpan(inputElement)
      if (inputErrorSpan != null)
        inputElement.parentElement.removeChild(inputErrorSpan)
    }

    function validateInput() {
      if ((hasValue()) || (!input.isActive)) {
        removeInputError()
      }
      else {
        insertInputError()
      }
    }

    input.ids.forEach(function (inputIdItem) {
      var inputElement = document.getElementById(inputIdItem)
      if ((inputElement.childElementCount > 0) && (inputElement.firstElementChild.tagName == "P"))
        inputElement.onfocusout = function () { validateInput() }
      else
        inputElement.onblur = function () { validateInput() }
    })

  }

  return {
    tabId: tabId,
    setInputIsActive: function (InputIsActive) { input.isActive = InputIsActive },
    getInput: function () { return input },
    getInputIds: function () { return input.ids },
    getLabel: function () { return label },
    hasInputValue: function () { return input.hasValue() },
    isInputActive: function () { return input.isActive },
    displayInputRequiredError: function () { insertInputError() }
  }
}
