const { getHeader, getSectionFromRequest } = require("./index");

test("getHeader", () => {
  expect(getHeader("Digital Subscription", "pass")).toStrictEqual({
    title: "Digital Subscription",
    subtitle: "Runscope tests have passed successfully",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Antu_vcs-normal.svg/200px-Antu_vcs-normal.svg.png",
    imageStyle: "IMAGE",
  });
  expect(getHeader("Digital Subscriptions product page", "fail")).toStrictEqual(
    {
      title: "Digital Subscriptions product page",
      subtitle: "Runscope tests failed for Digital Subscriptions product page",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Antu_task-reject.svg/200px-Antu_task-reject.svg.png",
      imageStyle: "IMAGE",
    }
  );
});

test("getSectionFromRequest with successful request", () => {
  const request = JSON.parse(`
    {
        "response_size_bytes": 11971,
        "url": "https://support.theguardian.com/uk/subscribe",
        "variables": {
          "fail": 0,
          "total": 0,
          "pass": 0
        },
        "step_type": "request",
        "note": "",
        "result": "pass",
        "response_status_code": "200",
        "scripts": {
          "fail": 0,
          "total": 0,
          "pass": 0
        },
        "method": "GET",
        "response_time_ms": 598,
        "assertions": {
          "fail": 0,
          "total": 1,
          "pass": 1
        }
      }
    `);
  expect(getSectionFromRequest(request)).toStrictEqual({
    widgets: [
      {
        keyValue: {
          topLabel: "Status",
          content: `<font color=\"#2ecc71\">pass</font>`,
        },
      },
      {
        keyValue: {
          topLabel: "Url",
          content: "https://support.theguardian.com/uk/subscribe",
        },
      },
      {
        keyValue: {
          topLabel: "Method",
          content: "GET",
        },
      },
      {
        keyValue: {
          topLabel: "Response Status Code",
          content: "200",
        },
      },
      {
        keyValue: {
          topLabel: "Assertions",
          content: "1",
        },
      },
      {
        keyValue: {
          topLabel: "Passed",
          content: "1",
        },
      },
      {
        keyValue: {
          topLabel: "Failed",
          content: "0",
        },
      },
    ],
  });
});

test("getSectionFromRequest with failed request", () => {
  const request = JSON.parse(`
    {
        "response_size_bytes": 11296,
        "url": "https://support.theguardian.com/uk/digital",
        "variables": {
          "fail": 0,
          "total": 0,
          "pass": 0
        },
        "step_type": "request",
        "note": "",
        "result": "fail",
        "response_status_code": "404",
        "scripts": {
          "fail": 0,
          "total": 0,
          "pass": 0
        },
        "method": "GET",
        "response_time_ms": 590,
        "assertions": {
          "fail": 2,
          "total": 2,
          "pass": 0
        }
      }
      `);
  expect(getSectionFromRequest(request)).toStrictEqual({
    widgets: [
      {
        keyValue: {
          topLabel: "Status",
          content: `<font color=\"#ed0000\">fail</font>`,
        },
      },
      {
        keyValue: {
          topLabel: "Url",
          content: "https://support.theguardian.com/uk/digital",
        },
      },
      {
        keyValue: {
          topLabel: "Method",
          content: "GET",
        },
      },
      {
        keyValue: {
          topLabel: "Response Status Code",
          content: "404",
        },
      },
      {
        keyValue: {
          topLabel: "Assertions",
          content: "2",
        },
      },
      {
        keyValue: {
          topLabel: "Passed",
          content: "0",
        },
      },
      {
        keyValue: {
          topLabel: "Failed",
          content: "2",
        },
      },
    ],
  });
});
