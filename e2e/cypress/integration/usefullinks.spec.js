/// <reference types = "cypress"/>
import selectors from "../fixtures/selectors.json"
import data from "../fixtures/pangolin-data"
import {pangolinUsefulLinks} from "../support/src/PangolinUsefulLinks"
const {avalancheBridge,bridgeLogo,sateliiteBridge} = selectors.usefulLinks
const {newsLinkAssertArray} = data.dashboard
const {pangolinLinksArr} = data
describe(`Useful Links`, () => {
    beforeEach('',() => {
        cy.visit('/')
            // Preserve cookie in every test

        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
            
        }) 
        cy.get('#dashboard').click()
    })

    it(`TC-01 Verify that the user is redirected to the avalanche bridge page`, () => {
        let avalancheBridgeUrl = 'https://bridge.avax.network/login'
        pangolinUsefulLinks(`${avalancheBridge}`, `${avalancheBridgeUrl}`, pangolinLinksArr[2])
    })

    it(`TC-02 Verify that the user is redirected to the Satellite bridge page`, () => {
        let satelliteBridgeUrl = 'https://satellite.money/?source=ethereum&destination=axelar&asset_denom=uaxl&destination_address='
        cy.request('GET', satelliteBridgeUrl).then( res => {
            expect(res.status).to.equal(200)
           })     
    })
})