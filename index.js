"use strict";

const axios = require("axios");

const blue = "#0000ff";
const red = "#ed0000";
const green = "#2ecc71";

const colourForResult = (result) => {
  if (result === "pass") {
    return green;
  } else if (result === "fail") {
    return red;
  }
  return blue;
};

const getHeader = (test_name, result) => {
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
      subtitle: `Runscope tests failed for ${test_name}`,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Antu_task-reject.svg/200px-Antu_task-reject.svg.png",
      imageStyle: "IMAGE",
    };
  }
};
exports.getHeader = getHeader;

const getSectionFromRequest = (request) => {
  return {
    widgets: [
      {
        keyValue: {
          topLabel: "Status",
          content: `<font color=\"${colourForResult(
            request.result
          )}\">${request.result}</font>`,
        },
      },
      {
        keyValue: {
          topLabel: "Url",
          content: request.url,
        },
      },
      {
        keyValue: {
          topLabel: "Method",
          content: request.method,
        },
      },
      {
        keyValue: {
          topLabel: "Response Status Code",
          content: request.response_status_code,
        },
      },
    ],
  };
};
exports.getSectionFromRequest = getSectionFromRequest;

const getCards = (webhookData) => {
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
  const requestSections = requests.map((request) =>
    this.getSectionFromRequest(request)
  );
  return [
    {
      header: getHeader(test_name, result),
      sections: [
        ...requestSections,
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
exports.getCards = getCards;

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
