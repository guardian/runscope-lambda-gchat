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

  const { test_name, test_url, test_run_url, result, environment_name, region, region_name, requests, variables, agent, agent_expired } = webhookData;
  let totalResponseTime = 0;
  let assertionsTotal = 0;
  let assertionsPassed = 0;
  let scriptsTotal = 0;
  let scriptsPassed = 0;
  let requestCount = requests.length;
  let thisResult = result;
  let my_region_name = region_name.split("-", 1);
  for (let i = 0; i < requests.length; i++) {
    assertionsTotal += requests[i].assertions.total;
    assertionsPassed += requests[i].assertions.pass;
    scriptsTotal += requests[i]["scripts"].total;
    scriptsPassed += requests[i]["scripts"].pass;
    totalResponseTime += requests[i].response_time_ms;
  }
  let thisIcon = "https://www.runscope.com/static/img/press/logoicon-runscope-color.png";
  const failIcon = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Antu_task-reject.svg/200px-Antu_task-reject.svg.png";
  const passIcon = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Antu_vcs-normal.svg/200px-Antu_vcs-normal.svg.png";
  let blue = "#0000ff" // blue    
  let red = "#ed0000"; //"#ff0000";    
  let green = "#2ecc71";// "#00ff00";    
  let fontColor = blue;
  if (result == "pass") {
    thisIcon = passIcon;
    thisResult = "Passed";
    fontColor = green;
  } else if (result == "fail") {
    thisIcon = failIcon;
    thisResult = "Failed";
    fontColor = red;
  }
  const cards = [{
    "header": {
      "title": "APITestRunCompleted",
      "subtitle": test_name,
      "imageUrl": thisIcon,
      "imageStyle": "IMAGE"
    },
    "sections": [
      {
        "widgets": [
          {
            "buttons": [
              { "textButton": { "text": "ViewResult", "onClick": { "openLink": { "url": test_run_url } } } },
              { "textButton": { "text": "EditTest", "onClick": { "openLink": { "url": test_url } } } }
            ]
          }
        ]
      },
      {
        "widgets": [{
          "keyValue": {
            "topLabel": "Status",
            "content": `<font color=\"${fontColor}\">${thisResult}</font>`
          }
        }, {
          "keyValue": {
            "topLabel": "Environment",
            "content": environment_name
          }
        },
        {
          "keyValue": {
            "topLabel": "Location",
            "content": `${region}: ${my_region_name}`
          }
        },
        {
          "keyValue": {
            "topLabel": "RequestsExecuted",
            "content": `${requests.length}`
          }
        },
        {
          "keyValue": {
            "topLabel": "AssertionsPassed",
            "content": `${assertionsPassed} of ${assertionsTotal}`
          }
        },
        {
          "keyValue": {
            "topLabel": "ScriptsPassed",
            "content": `${scriptsPassed} of ${scriptsTotal}`
          }
        }, {
          "keyValue": {
            "topLabel": "TotalResponseTime",
            "content": `${totalResponseTime}`
          }
        }
        ]
      }
    ]
  }
  ];

  function postGchat(endpointUrl, gchatBody) {
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    return axios.post(endpointUrl, gchatBody);
  }

  let testBody = {
    'cards': cards
  };

  //post message to gchat

  if (!agent_expired || !hasAgentChannel) {
    //test did not have an expired agent or there is no separate channel
    try {
      let gchatPost = await postGchat(gchatUrl, testBody);
      console.log(`Gchat Response Code: ${gchatPost.status}`);
    } catch (e) {
      console.warn(e);
    }
  } else {
    //agent has failed and we have a custom channel to notify
    console.log(`Agent expired for Test run ${test_run_url}`);
    try {
      let gchatPost = await postGchat(gchatAgentUrl, gchatBody);
      console.log(`Gchat Response Code: ${gchatPost.status}`);
    } catch (e) {
      console.warn(e);
    }

  }
};