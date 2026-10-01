const {test, expect} =
require('@playwright/test');
test.describe.configure({
 mode:"serial"
});

test("login success", async({page})=>{


await page.goto(
"https://localhost:7172/"
);


await page.fill(
"#username",
"admin"
);


await page.fill(
"#password",
"123456"
);


await page.click(
"#loginBtn"
);



await expect(
page.locator("#message")
)
.toHaveText(
"Login successful"
);


});


test("login failed", async({page})=>{


await page.goto(
"https://localhost:7172/");


await page.fill(
"#username",
"wrong"
);


await page.fill(
"#password",
"123"
);


await page.click(
"#loginBtn"
);



await expect(
page.locator("#message")
)
.toHaveText(
"Invalid username or password"
);


});