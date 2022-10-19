/// <reference types = "cypress"/>
import selectors from "../fixtures/selectors.json"
import data from "../fixtures/pangolin-data"
import {pangolinUsefulLinks} from "../support/src/PangolinUsefulLinks"
const {avalancheBridge,bridgeLogo,sateliiteBridge} = selectors.usefulLinks
// const {newsLinkAssertArray} = data.dashboard
const {pangolinLinksArr} = data
describe(`Useful Links`, () => {
    beforeEach('',() => {
        cy.visit('/')
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        }) 
        cy.get('#dashboard').click()
    })

    it.only(`TC-01 Verify that the user is redirected to the avalanche bridge page`, () => {
        let avalancheBridgeUrl = 'https://bridge.avax.network/login'
        pangolinUsefulLinks(`${avalancheBridge}`, `${avalancheBridgeUrl}`, pangolinLinksArr[2])
    })

    it(`TC-02 Verify that the user is redirected to the Satellite bridge page`, () => {
        let satelliteBridgeUrl = 'https://satellite.money/?source=ethereum&destination=axelar&asset_denom=uaxl&destination_address='
        cy.get(sateliiteBridge)
            .invoke("removeAttr","target").click()
        cy.url().should("include", satelliteBridgeUrl)
        cy.get('div[class="text-4xl font-bold"]')
            .should("be.visible")
            .should("contain", newsLinkAssertArray[13])
    })
})