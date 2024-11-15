const {Builder, By, Key, until} = require('selenium-webdriver')
const utils = require('./utils')
const assert = require('assert');

const SAUCE_USERNAME = process.env.SAUCE_USERNAME;
const SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY;
//const ONDEMAND_URL = `https://${SAUCE_USERNAME}:${SAUCE_ACCESS_KEY}@ondemand.eu-central-1.saucelabs.com/wd/hub`;
// NOTE: Use the URL below if using our EU datacenter (e.g. logged in to app.eu-central-1.saucelabs.com)
const ONDEMAND_URL = `https://${SAUCE_USERNAME}:${SAUCE_ACCESS_KEY}@ondemand.eu-central-1.saucelabs.com:443/wd/hub`;

/**
 * Run this test before working on the problem.
 * When you view the results on your dashboard, you'll see that the test "Failed".
 * Your job is to figure out why the test failed and make the changes necessary to make the test pass.
 * Once you get the test working, update the code so that when the test runs, it can reach the Sauce Labs homepage,
 * hover over 'Resources' and then clicks the 'Documentation' link
 */

describe('Broken Sauce', function () {
    it('should go to Google and click Sauce', async function () {
        let driver = await new Builder().withCapabilities(utils.brokenCapabilities)
            .usingServer(ONDEMAND_URL).build();
        try {
            await driver.get("https://www.google.de");
            // If you see a German or English GDPR modal on google.com you
            // will have to code around that or use the us-west-1 datacenter.
            // You can investigate the modal elements using a Live Test(https://app.saucelabs.com/live/web-testing)

            try {
                await driver.findElement(By.id("L2AGLb")).click(); //accept cookies
            } catch (e) {
                console.log("Cookies are accepted");
            }
            await driver.findElement(By.id("APjFqb")).sendKeys("Sauce Labs");

            let button = await driver.findElement(By.name("btnK"))
            await button.click()

            let sauceLabsLink = await driver.findElement(By.partialLinkText("sauce"));
            await sauceLabsLink.click();
            await driver.findElement(By.id("onetrust-accept-btn-handler")).click(); //
            let resourcesHeaderToHover = driver.findElement(By.xpath("//span[text()='Resources']"));
            let actions = driver.actions({async: true});
            await actions.move({origin: resourcesHeaderToHover}).perform();
            let developersToHover = driver.findElement(By.xpath("//span[text()='Developers']"))
            let actionsDevelopers = driver.actions({async:true});
            await actionsDevelopers.move({origin:developersToHover}).perform();
            let inputDocumentation = driver.findElement(By.xpath("//span[text()='Documentation']"));
            await inputDocumentation.click();

            assert.strictEqual(await driver.getTitle(), "Sauce Labs: Cross Browser Testing, Selenium Testing & Mobile Testing")
            await driver.executeScript(
                'sauce:job-result=passed'
            );
        } catch (err) {
            await driver.executeScript(
                'sauce:job-result=failed'
            );
            // hack to make this pass for Gitlab CI
            // candidates can ignore this
            if (process.env.GITLAB_CI === 'true') {
                console.warn("Gitlab run detected.");
                console.warn("Skipping error in brokenSauce.js");
            } else {
                throw err;
            }
        } finally {
            await driver.quit();
        }
    });
});
