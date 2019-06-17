{
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
      hasValue: false,
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
    appendInputTitleRequiredSuffix()
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
              if ((selectId.endsWith("LookupField")) || (selectId.endsWith("SelectResult"))) {
                // 110 input.id = selects[i].getAttribute("id")
                input.id = selectId
                // +120
                break
              }
        }

      }
      // +120 end

      if ( input.id == "" ) {
        var inputs = document.getElementsByTagName("input")

        for (var i = 0; i < inputs.length; i++) {
          // +110
          var inputId = inputs[i].getAttribute("id")
          // 110 if ((inputs[i].getAttribute("id") != null) && (inputs[i].getAttribute("id").startsWith(id)))
          if ((inputId != null) && (inputId.startsWith(id)))
            // +110 handle cases with/out space: `system` != `systemx0020component`
            if ((inputId.indexOf("_x0020_")) == (id.indexOf("_x0020_"))) {
              // 110 input.id = inputs[i].getAttribute("id")
              input.id = inputId
              break
            } else
              break
        }

      }
      /* -110 if ( input.id == "" ) {
        var selects = document.getElementsByTagName("select")

        for (var i = 0; i < selects.length; i++) {
          // +110
          var selectId = selects[i].getAttribute("id")
          // 110 if ((selects[i].getAttribute("id") != null) && (selects[i].getAttribute("id").startsWith(id)))
          if ((selectId != null) && (selectId.startsWith(id)))
            // +110 handle cases with/out space: `system` != `systemx0020component`
            if ((selectId.indexOf("_x0020_")) == (id.indexOf("_x0020_"))) {
              // +110 begin
              if ((selectId.endsWith("LookupField")) || (selectId.endsWith("SelectResult"))) {
                // 110 input.id = selects[i].getAttribute("id")
                input.id = selectId
                break
              }
          }
        }

      } */
    }

    function setInputTitle () {
      input.title = document.getElementById(input.id).getAttribute("title")
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

    function setInputValidationOnBlurEvent () { 

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
          //inputElement.parentElement.appendChild(linebreak)
          inputElement.parentElement.appendChild(inputElementRequiredErrorSpan)
        }
      }

      function removeInputError (id) {
        var inputElement = document.getElementById(id)
        var inputErrorSpan = getInputErrorSpan(inputElement)
        if ( inputErrorSpan != null ) 
          inputElement.parentElement.removeChild(inputErrorSpan)
      }

      function validateInput(id) {
        var inputElement = document.getElementById(id)
        // +110
        var isEmpty = false
        // +120 begin
        if ( typeof inputElement.value != "undefined" ) {
          if ( (inputElement.value == "") || (inputElement.value == "0") )
            isEmpty = true
        } else
          if (inputElement.innerText.length <=2)
            isEmpty = true
        // +120 end
        if (isEmpty) {
          insertInputError(id)
          // 120 input.existValue = false
          input.hasValue = false
        }
        else {
          removeInputError(id)
          // 120 input.existValue = true
          input.hasValue = true
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
      hasInputValue: function () { return input.hasValue },
      // +120
      isInputActive: function () { return input.isActive }
      //insertLabelRequiredSpan: function () { insertElementSpan(label.id) },
      //appendInputRequiredTitleSuffix: function () { appendElementRequiredTitleSuffix(input.id) },
      //insertInputError: function () { insertInputError(input.id) },
      //setValidationOnBlurEvent: function () { document.getElementById(input.id).onblur = function() { validateInput(input.id) } },
      //setValidationOnBlurEvent: function () { document.getElementById(input.id).setAttribute("onclick", alert(input.id)) },
      //setValidationOnBlurEvent: function () { document.getElementById(input.id).onblur = insertInputError(input.id) },
      //validateInput: function () { validateInput(input.id) }
    }
  }

}