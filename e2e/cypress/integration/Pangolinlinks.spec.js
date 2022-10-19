/// <reference types = "cypress"/>
import selectors from "../fixtures/selectors.json"
import data from "../fixtures/pangolin-data"
import {pangolinUsefulLinks} from "../support/src/PangolinUsefulLinks"
const {pangolinLinksArr} = data
const {chart,forum,pangolinLogo} = selectors.pangolinLinks
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

    it(`TC-01 Verify that the user is redirected to the pangolin analytics page`, () => {
        let chartUrl = 'https://info.pangolin.exchange/#/home'
        pangolinUsefulLinks(`${chart}`, `${chartUrl}`, pangolinLinksArr[0])
    })

    it(`TC-02 Verify that the user is redirected to the pangolin exchange page`, () => {
        let forumUrl = 'https://gov.pangolin.exchange/'
        pangolinUsefulLinks(`${forum}`, `${forumUrl}`, pangolinLinksArr[1])
    })
})