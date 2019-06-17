{
  /*
    `cRequiredField` may be used to add required-field behavior  
    to a Sharepoint form field not specified as `required` in Designer.

    Usage: 

      Instantiate a `cRequiredField` object to add required-field behavior:
      ~~~
        var cRequired[field-label-id] = new cRequiredField([field-label-id])
      ~~~

      For example:
      ~~~
        var cRequiredLocation = new cRequiredField("Location")
      ~~~

      Check whether a cRequiredField field contains a value:
      ~~~
        if ( cRequiredLocation.hasInputValue() ) {...}
      ~~~

    Change Log:

      20190529-1.0.0-initial implementation-g
      20190530-1.1.0-initial lookup validation-g
  */

  function cRequiredField(labelId) {
    let input = { 
      id: "",
      title: "",
      titleRequiredSuffix: " is a required field.",      
      requiredErrorSpanClass: "ms-formvalidation ms-csrformvalidation",
      requiredErrorInnerSpanText: "You can't leave this blank.",
      requiredErrorInnerSiblingSpanRole: "alert",
      //requiredErrorSpan: "<SPAN class='ms-formvalidation ms-csrformvalidation'></SPAN>",
      //requiredErrorSpanChild: "<SPAN role='alert'>You can't leave this blank.<br></SPAN>",
      existValue: false
    }
    let label = { 
      id: labelId,
      title: "",
      requiredSpan: "<SPAN class='ms-accentText' title='This is a required field.'> *</SPAN>",
    }
    setInputId(labelId)
    setInputTitle()
    insertLabelRequiredSpan()
    appendInputTitleRequiredSuffix()
    setInputValidationOnBlurEvent()

    function setInputId (id) {
      var inputs = document.getElementsByTagName("input")

      for (var i = 0; i < inputs.length; i++) {
        // +110
        let inputId = inputs[i].getAttribute("id")
        // 110 if ((inputs[i].getAttribute("id") != null) && (inputs[i].getAttribute("id").startsWith(id)))
        if ((inputId != null) && (inputId.startsWith(id)))
          // +110 handle cases with/out space: `system` != `systemx0020component`
          if ((inputId.indexOf("_x0020_")) == (id.indexOf("_x0020_"))) {
          //if ( (id.contains("x0020")) && (inputId.contains("x0020")) )
            // 110 input.id = inputs[i].getAttribute("id")
            input.id = inputId
            break
          }
      }

      if ( input.id == "" ) {
        var selects = document.getElementsByTagName("select")

        for (var i = 0; i < selects.length; i++) {
          // +110
          let selectId = selects[i].getAttribute("id")
          // 110 if ((selects[i].getAttribute("id") != null) && (selects[i].getAttribute("id").startsWith(id)))
          if ((selectId != null) && (selectId.startsWith(id)))
            // +110 handle cases with/out space: `system` != `systemx0020component`
            if ((selectId.indexOf("_x0020_")) == (id.indexOf("_x0020_"))) {
              // 110 input.id = selects[i].getAttribute("id")
              input.id = selectId
              break
          }
        }

      }
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
        let inputErrorSpan = null
        let inputElementParent = inputElement.parentElement
        let inputElementSibling = inputElementParent.firstChild

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
        let inputElement = document.getElementById(id)
        let inputErrorSpan = getInputErrorSpan(inputElement)
        if ( inputErrorSpan == null ) {
          let inputElementRequiredErrorSpan = document.createElement("SPAN")
          inputElementRequiredErrorSpan.setAttribute("id", "Error_" + id)
          inputElementRequiredErrorSpan.setAttribute("class", input.requiredErrorSpanClass)
          let inputElementRequiredErrorInnerSpan = document.createElement("SPAN")
          let inputElementRequiredErrorInnerSiblingSpan = document.createElement("SPAN")
          inputElementRequiredErrorInnerSiblingSpan.setAttribute("role", input.requiredErrorInnerSiblingSpanRole)
          let inputElementRequiredErrorInnerSpanText = document.createTextNode(input.requiredErrorInnerSpanText)
          inputElementRequiredErrorInnerSiblingSpan.appendChild(inputElementRequiredErrorInnerSpanText)
          linebreak = document.createElement("br");
          inputElementRequiredErrorInnerSiblingSpan.appendChild(linebreak)
          inputElementRequiredErrorSpan.appendChild(inputElementRequiredErrorInnerSiblingSpan)
          //inputElement.parentElement.appendChild(linebreak)
          inputElement.parentElement.appendChild(inputElementRequiredErrorSpan)
        }
      }

      function removeInputError (id) {
        let inputElement = document.getElementById(id)
        let inputErrorSpan = getInputErrorSpan(inputElement)
        if ( inputErrorSpan != null ) 
          inputElement.parentElement.removeChild(inputErrorSpan)
      }

      function validateInput(id) {
        let inputElement = document.getElementById(id)
        // +110
        let isEmpty = false
        // +110 begin
        /*if (inputElement.firstChild.nodeName == "P") {
          if (!inputElement.firstChild.innerText.length <= 2)
            isEmpty = true
        } else */
        // +110 end
          if ( (inputElement.value == "") || (inputElement.value == "0") )
            isEmpty = true
        // +110
        if (isEmpty) {
          insertInputError(id)
          input.existValue = false
        }
        else {
          removeInputError(id)
          input.existValue = true
        } 
      }

      // +110 begin
      let inputElement = document.getElementById(input.id)
      //if ((inputElement.nextElementSibling != null) && (inputElement.nextElementSibling.tagName == "P"))
      // does not work if ((inputElement.value == "<p></p>"))
      /*if (inputElement.hasAttribute("value"))
          inputElement.nextElementSibling.onblur = function() { validateInput(inputElement) } 
      else */
      // +110 end
        // 110
        //document.getElementById(input.id).onblur = function() { validateInput(input.id) } 
        inputElement.onblur = function() { validateInput(input.id) } 
      //document.getElementById(input.id).onfocusout = function() { validateInput(input.id) } 
    }

    return {
      getInput: function () { return input },
      getLabel: function () { return label },
      hasInputValue: function () { return input.existValue },
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