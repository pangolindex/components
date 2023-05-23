/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data.json'
// const {proposalsArray,proposalOrder} = data.stake
const {stakeSideMenu,stakeSideMenuSelect} = selectors.stake
describe('Stake', () => {
    
    beforeEach('',() => {
        cy.visit('/')
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        }) 
        cy.get('#stake').click()
    })

    /******************* Selecting stake from side menu **************************/
    it('TC-01, Verify that the stake page can be accessed from the side menu', () => {
        cy.get(stakeSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(stakeSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    /******************* Assertion on the Earn card **************************/
    it('TC-02, Verify that the user can see the values under the "Total Staked" and "APR" titles', () => {
        cy.get('[class="sc-eCYdqJ sc-krDsej hoKraq"]').as("test123") 
        cy.get('@test123').should("contain","Stake Your PNG and Earn")
        
        cy.wait(10000)
        cy.get('div[class="sc-eCYdqJ sc-gPWkxV eiQojY"] div[class="sc-jSMfEi ejufgh"]').eq(0).contains('Total Staked').should('be.visible')
        // .then($test1 => {
        //     cy.get($test1).find(againstValue).then($test2 => {
        //     cy.log(cy.contains($test2[0].innerText).should('be.visible'))
            
    })
})