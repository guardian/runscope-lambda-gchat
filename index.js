"use strict";
 
const axios = require('axios');

exports.handler = async (event) => {

  console.log(event.body);
  //assign webhook data to variable
  let webhookData = JSON.parse(event.body);
  let gchatUrl;
  let gchatAgentUrl;

  //get gchat url from header
  if (event.headers.gchaturl) {
    gchatUrl = event.headers.gchaturl
  } else {
    console.log("no gchat url provided");
  }  

  //get url for agent failure gchat channel from header
  let hasAgentChannel = false;
  if (event.headers.gchatagenturl) {
    gchatAgentUrl = event.headers.gchatagenturl
    hasAgentChannel = true;
  } else {
    console.log("no gchat url provided for runscope agent");
  }   

     
  //deconstruct variables
  const {bucket_name, test_name, test_url, test_run_url, result, environment_name, region, region_name, requests, variables, agent, agent_expired} = webhookData;

  //allow alternate test name under custom_name test variable and custom message under custom_message test variable
  let my_test_name = test_name;
  let my_custom_message = "";
  let isCustomMessage = false;
  let extraGchatMessage = {};
  if(variables){
    if (variables.custom_name) {
        my_test_name = variables.custom_name;
    }
  
    if (variables.custom_message) {
      my_custom_message = variables.custom_message;
      isCustomMessage = true;
      extraGchatMessage = {
        "title": "Message",
        "value": my_custom_message,
        "short": true
      };
    }
  }
  //define variables for display
  let totalResponseTime = 0;
  let assertionsTotal = 0;
  let assertionsPassed = 0;
  let scriptsTotal = 0;
  let scriptsPassed = 0;
  let requestCount = requests.length;
  let thisResult = result;
  let location;
  if (region) {
    let region_name_string = region_name.split(" - ",1);
    location = `${region.toUpperCase()}: ${region_name_string}`;
  } else {
    location = agent;
  }
  for (let i=0; i<requests.length; i++) {
    assertionsTotal += requests[i].assertions.total;
    assertionsPassed += requests[i].assertions.pass;
    scriptsTotal += requests[i]["scripts"].total;
    scriptsPassed += requests[i]["scripts"].pass;
    totalResponseTime += requests[i].response_time_ms;
  }
  
  let blue = "#0000ff";
  let red = "#ff0000";
  let green = "#2ecc71";
  let fontColor = blue;
  if (result == "pass") {
    thisResult = "Passed";
    fontColor = green;
  } else if (result == "fail") {
    thisResult = "Failed";
    fontColor = red;
  }

  //create payload for gchat message
  let html_message = `API test run completed. <${test_run_url}|View Result> - <${test_url}|Edit Test>`;
  let plain_text_message = `${bucket_name}: ${my_test_name} test run ${result} in ${location}. ${requests.length} executed, ${assertionsPassed} of ${assertionsTotal} assertions passed.`;

  let gchatdata =  [
    {
      "title": `${bucket_name}: ${my_test_name}`,
      "title_link": test_url,
      "pretext": html_message,
      "fallback": plain_text_message,
      "color": fontColor,
      "fields": [
        {
            "title": "Status",
            "value": thisResult,
            "short": true
        },
        {
            "title": "Requests Executed",
            "value": `${requests.length}`,
            "short": true
        },
        {
            "title": "Environment",
            "value": environment_name,
            "short": true
        },
        {
            "title": "Assertions Passed",
            "value": `${assertionsPassed} of ${assertionsTotal}`,
            "short": true
        },
        {
            "title": "Location",
            "value": location,
            "short": true
        },
        {
            "title": "Scripts Passed",
            "value": `${scriptsPassed} of ${scriptsTotal}`,
            "short": true
        },
        {
            "title": "Total Response Time",
            "value": `${totalResponseTime}ms`,
            "short": true
        }
      ]
    }
  ];
  
  //add custom message 
  if (isCustomMessage) {
    gchatdata[0].fields.unshift(extraGchatMessage);
  }

  let gchatBody = {'attachments': gchatdata};
  function postGchat(endpointUrl,gchatBody) {
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    return axios.post(endpointUrl,gchatBody);
  }

  let testBody = {
    'text': test_name
  };

  //post message to gchat

  if (!agent_expired||!hasAgentChannel) {
    //test did not have an expired agent or there is no separate channel
    try {
      let gchatPost = await postGchat(gchatUrl,testBody);
      console.log(`Gchat Response Code: ${gchatPost.status}`);
    } catch(e) {
      console.warn(e);
    }
  } else {
    //agent has failed and we have a custom channel to notify
    console.log(`Agent expired for Test run ${test_run_url}`);
    try {
      let gchatPost = await postGchat(gchatAgentUrl,gchatBody);
      console.log(`Gchat Response Code: ${gchatPost.status}`);
    } catch(e) {
      console.warn(e);
    }    
        
    }
};