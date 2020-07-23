"use strict";

const axios = require("axios");

const colourForResult = (result) => {
  const blue = "#0000ff";
  const red = "#ed0000";
  const green = "#2ecc71";
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

const getSectionFromRequest = (request) => {
  return {
    widgets: [
      {
        keyValue: {
          topLabel: "Status",
          content: `<font color=\"${colourForResult(request.result)}\">${
            request.result
          }</font>`,
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

const getCards = (webhookData) => {
  const { test_name, test_url, test_run_url, result, requests } = webhookData;

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

const postGchat = (endpointUrl, gchatBody) => {
  axios.defaults.headers.common["Content-Type"] = "application/json";
  return axios.post(endpointUrl, gchatBody);
};

const lambdaResponse = (statusCode, body) => {
  return {
    headers: { "Content-Type": "application/json" },
    statusCode: statusCode,
    body: JSON.stringify(body),
  };
};

exports.handler = async (event) => {
  console.log(event.body);

  const webhookData = JSON.parse(event.body);

  // the gchat webhook url is passed in as a header
  const gchatUrl = event.headers.gchaturl;
  if (!gchatUrl) {
    console.log("no gchat url provided");
  }

  //post message to gchat
  try {
    let gchatPost = await postGchat(gchatUrl, {
      cards: getCards(webhookData),
    });
    console.log(`Gchat Response status: ${gchatPost.status}`);
    return lambdaResponse(200, "Success");
  } catch (e) {
    console.warn(e);
    return lambdaResponse(500, `Error posting to Gchat: ${e}`);
  }
};

exports.getSectionFromRequest = getSectionFromRequest;
exports.getCards = getCards;
exports.getHeader = getHeader;
