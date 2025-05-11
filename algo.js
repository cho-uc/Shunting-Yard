function validateInput(input) {
    const regex = new RegExp("([0-9]+[\\+\\-\\*\\/]{1}[0-9]+)+([\\+\\-\\*\\/]{1}[0-9]+)*");
    return regex.test(input)
}

// Unit test
function testValidateInput(){
    const str1 = '1234+5/(8/9)'; // true
    const str2 = '1234+5(89)-/*'; // true (but should be false)
    const str3 = '34*(76.14+63saa2)' // true (but should be false)
    const str4 = '1234absj'; // false
    const str5 = '123*/4+()'; //false
    
    console.log(validateInput(str1));
    console.log(validateInput(str2));
    console.log(validateInput(str3));
    console.log(validateInput(str4));
    console.log(validateInput(str5));
}

function getInputValue() {
    let inputVal = document.getElementById("inputId1").value;
    if (!inputVal) {
        alert("Input should not be empty!");
        return;
    }
    if (!validateInput(inputVal)){
        alert("Math expresssion is not recognized!");
        return;
    }

    // Delete previous div elements if already exist so that the page can be used multiple times without refreshing
    if (document.getElementById('divInput1')) {
      document.body.removeChild(document.getElementById('divInput1'));
    }
    if (document.getElementById('divInput2')) {
      document.body.removeChild(document.getElementById('divInput2'));
    }

    // Create new div elements to output the input to UI
    let divInput1 = document.createElement('div');
    divInput1.innerHTML = '<p></p><h3>Input: </h3>';
    divInput1.setAttribute("id", "divInput1");
    document.body.appendChild(divInput1);
    let divInput2 = document.createElement('div');
    divInput2.innerHTML = '<p></p><p>' + inputVal +'</p>';
    divInput2.setAttribute("id", "divInput2");
    document.body.appendChild(divInput2);

    return inputVal
  }

  function setOutputValue(expression) {
      // Delete previous div elements if already exist so that the page can be used multiple times without refreshing
      if (document.getElementById('divResult1')) {
        document.body.removeChild(document.getElementById('divResult1'));
      }
      if (document.getElementById('divResult2')) {
        document.body.removeChild(document.getElementById('divResult2'));
      }

      let divResult1 = document.createElement('div');
      divResult1.innerHTML = '<p></p><h3>Result: </h3>';
      divResult1.setAttribute("id", "divResult1");
      document.body.appendChild(divResult1);

      let divResult2 = document.createElement('div');
      resultVal = evaluate(expression)
      divResult2.innerHTML = '<p></p><p>' + resultVal +'</p>';
      divResult2.setAttribute("id", "divResult2");
      document.body.appendChild(divResult2);
  }

// Parse input into a list of chars
function tokenize(expr) {
  let tokens = [];
  expr = expr.trim(); // Remove spaces

  // Split input into array of characters
  let idx = 0;
  while (idx < expr.length) {
    if (expr[idx].match(/[\d\.\/\*\^\(\)\+\-]/)) {
      tokens.push(expr[idx])
    }
    idx++;
  } 

  // If there are more than 2 neighboring digits in the elements, combine the digits
  // [3][.][4]  ->  [3.4]
  var isNeighbor = false
  var numberChars = ''

  var repeat = 15 // the maximum number of repeated digit char (i.e precision not yet optimized)
  while (repeat > 0){
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]
      // First neighboring digit
      if ((isDigit(tokens[i])) && (isNeighbor == false)) {
        isNeighbor = true
        numberChars = tokens[i]
        continue
      }
      // Second neighboring digit
      if ((isDigit(tokens[i])) && (isNeighbor == true)) {
        tokens[i-1] = numberChars + tokens[i] // store to previous slot
        tokens.splice(i, 1); // delete this element
        isNeighbor = false
        continue
      }
      if (!isDigit(tokens[i])) { // revert to original state
        isNeighbor = false
        numberChars = '' // clean for next iteration
      }
    }
    // Clean for next repeat
    isNeighbor = false
    numberChars = '' 
  repeat--
}
  return tokens;
}

// Helper functions
function isDigit(ch) { 
    return /\d/.test(ch) || (ch == '.'); // digit and decimal dot (.)
}
function isLetter(ch) { return /[a-z]/i.test(ch);}
function isOperator(ch) { return /\+|-|\*|\/|\^/.test(ch);}
function isParentheses(ch) {return (ch == ')') || (ch == '(')}

function peek(stack){
    if (stack === null)
        return null
    else {
        return stack[stack.length-1]
    }
}

function applyOperator(operators, values){
    // Applies an operator to the two most recent values in the values stack.
    operator = operators.pop()
    right = values.pop()
    left = values.pop()
    formula = left + operator + right
    values.push(eval(formula))
}

// Determines if the precedence of operator1 is greater than operator2.
function greaterPrecedence(op1, op2){
    precedences = {'+' : 0, '-' : 0, '*' : 1, '/' : 1}
    return precedences[op1] > precedences[op2]
}

// Evaluates a mathematical expression using the Shunting Yard Algorithm.
function evaluate(expr){
    tokens = tokenize(expr)

    values = []
    operators = []
    tokens.forEach(function(token, index) {
        if (isDigit(token)){
            values.push(token)
        }
        else if (token == '(') {
            operators.push(token)
        }
        else if (token == ')') {
            while (peek(operators) && peek(operators) != '('){
                applyOperator(operators, values)
            }
            operators.pop() // Discard the '('
        }
        else {
            while (peek(operators) && (!isParentheses(token)) && greaterPrecedence(peek(operators), token)) {
                applyOperator(operators, values)
            }
            operators.push(token)
        }
    })
    while (peek(operators)) {
        applyOperator(operators, values)
    }
    return values[0]
}


// Unit test
function testEvaluate() {
  // let expression = "34 * (76.14 + 632)";
  let expression = "3479.8399*(39302000876.1429393030+63.2132829270000383)/2.09393930";
  console.log(tokenize(expression).toString())
  console.log("Final result = " + evaluate(expression))
  console.log("Benchmark = " + eval(expression)) // using JS native lib
}

// Main function
function evaluateExpr() {
    var inputVal = getInputValue()
    setOutputValue(inputVal)
}
