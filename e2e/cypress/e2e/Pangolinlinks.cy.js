/// <reference types = "cypress"/>
import selectors from "../fixtures/selectors.json"
import data from "../fixtures/pangolin-data"
// import {pangolinUsefulLinks} from "../support/src/PangolinUsefulLinks"
const {pangolinLinksArr} = data
const {forumUrl, chartUrl} = data.dashboard
const {chart, forum } = selectors.pangolinLinks
describe(`Pangolin Links`, () => {
    beforeEach('',() => {
        cy.visit('/')
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        }) 
        cy.get('#dashboard').click()
    })

/**************************  Click and Assert on the Pangolin Analytics page  *********************************/
    it(`TC-01 Verify that the user is redirected to the pangolin analytics page`, () => {
        pangolinUsefulLinks(`${chart}`, `${chartUrl}`, pangolinLinksArr[0])
    })

/**************************  Click and Assert on the Pangolin exchange page  *********************************/
    it(`TC-02 Verify that the user is redirected to the pangolin exchange page`, () => {
        pangolinUsefulLinks(`${forum}`, `${forumUrl}`, pangolinLinksArr[1])
    })
})