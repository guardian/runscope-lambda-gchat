"use strict";

const axios = require("axios");

exports.getHeader = (test_name, result) => {
  if (result === "pass") {
    return {
      title: test_name,
      subtitle: "Runscope tests have passed successfully",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Antu_vcs-normal.svg/200px-Antu_vcs-normal.svg.png",
      imageStyle: "IMAGE",
    };
  } else if (result === "fail") {
    return {
      title: test_name,
      subtitle: `Runscope test for ${test_name} have failed`,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Antu_vcs-normal.svg/200px-Antu_vcs-normal.svg.png",
      imageStyle: "IMAGE",
    };
  }
};

exports.getCards = (webhookData) => {
  const {
    test_name,
    test_url,
    test_run_url,
    result,
    environment_name,
    region,
    region_name,
    requests,
  } = webhookData;
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
  const blue = "#0000ff";
  const red = "#ed0000";
  const green = "#2ecc71";
  let fontColor = blue;

  if (result == "pass") {
    thisResult = "Passed";
    fontColor = green;
  } else if (result == "fail") {
    thisResult = "Failed";
    fontColor = red;
  }
  return [
    {
      header: getHeader(test_name, result),
      sections: [
        {
          widgets: [
            {
              keyValue: {
                topLabel: "Status",
                content: `<font color=\"${fontColor}\">${thisResult}</font>`,
              },
            },
            {
              keyValue: {
                topLabel: "Environment",
                content: environment_name,
              },
            },
            {
              keyValue: {
                topLabel: "Location",
                content: `${region}: ${my_region_name}`,
              },
            },
            {
              keyValue: {
                topLabel: "RequestsExecuted",
                content: `${requests.length}`,
              },
            },
            {
              keyValue: {
                topLabel: "AssertionsPassed",
                content: `${assertionsPassed} of ${assertionsTotal}`,
              },
            },
            {
              keyValue: {
                topLabel: "ScriptsPassed",
                content: `${scriptsPassed} of ${scriptsTotal}`,
              },
            },
            {
              keyValue: {
                topLabel: "TotalResponseTime",
                content: `${totalResponseTime}`,
              },
            },
          ],
        },
        {
          widgets: [
            {
              buttons: [
                {
                  textButton: {
                    text: "View Result",
                    onClick: { openLink: { url: test_run_url } },
                  },
                },
                {
                  textButton: {
                    text: "Edit Test",
                    onClick: { openLink: { url: test_url } },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ];
};

const postGchat = (endpointUrl, gchatBody) => {
  axios.defaults.headers.common["Content-Type"] = "application/json";
  return axios.post(endpointUrl, gchatBody);
};

exports.handler = async (event) => {
  console.log(event.body);

  //assign webhook data to variable
  let webhookData = JSON.parse(event.body);
  let gchatUrl;

  //get gchat url from header
  if (event.headers.gchaturl) {
    gchatUrl = event.headers.gchaturl;
  } else {
    console.log("no gchat url provided");
  }

  //post message to gchat
  try {
    let gchatPost = await postGchat(gchatUrl, {
      cards: getCards(webhookData),
    });
    console.log(`Gchat Response Code: ${gchatPost.status}`);
  } catch (e) {
    console.warn(e);
  }
};