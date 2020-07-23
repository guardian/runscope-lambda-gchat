const { getHeader } = require("./index");

test("returns header", () => {
    expect(getHeader("Digital Subscription", "pass")).toStrictEqual(
        { 
            "title": "Digital Subscription",
            "subtitle": "Runscope tests have passed successfully",
            "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Antu_vcs-normal.svg/200px-Antu_vcs-normal.svg.png",
            "imageStyle": "IMAGE"
        }
    )
})