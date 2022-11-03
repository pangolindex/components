/// <reference types = "cypress"/>
import selectors from "../fixtures/selectors.json"
import data from "../fixtures/pangolin-data"
import {pangolinUsefulLinks} from "../support/src/PangolinUsefulLinks"
const {avalancheBridge} = selectors.usefulLinks
const {avalancheBridgeUrl, satelliteBridgeUrl} = data.dashboard
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

    /***********************************  Click and Assert the avalanche Bridge  ********************************************/
    it(`TC-01 Verify that the user is redirected to the avalanche bridge page`, () => {
        pangolinUsefulLinks(`${avalancheBridge}`, `${avalancheBridgeUrl}`, pangolinLinksArr[2])
    })

    /***********************************  Verify the satellite bridge page response  *****************************************/
    it(`TC-02 Verify that the user is redirected to the Satellite bridge page`, () => {
        cy.request('GET', satelliteBridgeUrl).then( res => {
            expect(res.status).to.equal(200)
           })     
    })
})