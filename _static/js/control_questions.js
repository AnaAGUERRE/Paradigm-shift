
place_question = (questionid, divid) => {
    let question = js_vars.questions[questionid];
    let questiondiv = document.getElementById(divid);
    questiondiv.innerHTML = `<h2>${question.question}</h2>`;
    // center question
    questiondiv.classList.add("text-center");
  
    // text indicating whether the answer is correct or not
    let correctdiv = document.createElement("div");
    correctdiv.id = `correct${questionid}`;
    questiondiv.appendChild(correctdiv);
    // add text to fill
    correctdiv.innerHTML = "";
    // center text
    correctdiv.classList.add("text-center");
    correctdiv.classList.add("mb-4");
  
  
  
    let buttondiv = document.createElement("div");
    buttondiv.classList.add("d-grid");
    buttondiv.classList.add("gap-2");
    buttondiv.classList.add("col-6");
    buttondiv.classList.add("mx-auto");
  
    for (let q of question.options) {
      let button = document.createElement("button");
      button.classList.add("btn");
      button.classList.add("btn-secondary");
      button.classList.add("btn-block");
      button.classList.add("answer");
      // add button type="button"
      button.type = "button";
  
      button.id = `ans${questionid}-${q.i}`;
      button.innerHTML = q.label;
      button.onclick = () => checkAnswer(questionid, q.i);
      buttondiv.appendChild(button);
    }
    questiondiv.appendChild(buttondiv);
  };
    
  const checkAnswer = (questionid, button) => {
    liveSend([questionid, button]);
  };
  
  function liveRecv(data) {
    // your code goes here
    
    if (data[3]) {
      
      excludeUser();
    }
    else {
    decorateAnswer(data[0], data[1], data[2]);
    }
  }
    
  const decorateAnswer = (id, response, status) => {
    let button = document.getElementById(`ans${id}-${response}`);
  
    if (status) {
      button.classList.add("btn-success");
      button.classList.remove("btn-primary");
      show_nextbutton("#questions" + id);
      
  
  
      button.disabled = true;
      // disable all other buttons in parent button group btn-group-vertical 
      let parent = button.parentElement;
      let buttons = parent.getElementsByClassName("answer");
      for (let b of buttons) {
        if (b != button) {
          b.disabled = true;
        }
      }
  
      // replace text to indicate that the answer is correct
      let correctdiv = document.getElementById(`correct${id}`);
      correctdiv.innerHTML = "Your answer is correct! Press [Next] to continue.";
      // remove if text-danger is present
      correctdiv.classList.remove("text-danger");
      correctdiv.classList.add("text-success");
  
  
    } else {
      button.classList.add("btn-danger");
      button.classList.remove("btn-primary");
      // disable that button
      button.disabled = true;
  
      // replace text to indicate that the answer is incorrect
      let correctdiv = document.getElementById(`correct${id}`);
      correctdiv.innerHTML = "Your answer is incorrect. Please try again.";
      correctdiv.classList.add("text-danger");
  
      
    }
  };
  
  
  excludeUser = () => {
    form.submit();
  }
  
  
  
  if (js_vars.questions) {
    for (let i = 0; i < js_vars.questions.length; i++) {
      if (js_vars.questions[i].div) {
        place_question(i, js_vars.questions[i].div);
  
        hide_nextbutton("#questions" + i);
      }
    }
  }
  
  const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)
  
  
  function reveal(hash) {
    if (hashCode(hash) == "943313377") {
      for (let i = 0; i < js_vars.questions.length; i++) {
        if (js_vars.questions[i].div) {
          show_nextbutton("#questions" + i);
        }
      }
      show_nextbutton("#nutrients")
  
      // find all items with class nav-link and remove disabled class
      let navlinks = document.getElementsByClassName("nav-link");
      for (let n of navlinks) {
        n.classList.remove("disabled");
      }
      
  
      
    }
  }