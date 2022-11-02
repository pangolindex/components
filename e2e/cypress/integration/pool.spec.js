/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data.json'
// const {proposalsArray,proposalOrder} = data.stake
const {poolsSideMenu,poolsSideMenuSelect} = selectors.pools
describe('Pools', () => {
    
    beforeEach('',() => {
        cy.visit('/')
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        }) 
        cy.get('#pool').click()
    })

    /******************* Selecting pool from side menu **************************/
    it('TC-01, Verify that the pool and farm page can be accessed from the side menu', () => {
        cy.get(poolsSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(poolsSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    /******************* Assertions on the pools page **************************/
    it('TC-02,11,14,17 Verify that the user is able to see all the farms when clicking on the "All Farms" Label', () => {
        //Searching for a farm
        cy.get('#token-search-input').type("PNG")
        cy.wait(5000)
        cy.get('div[class="sc-jSMfEi jPrZZL"]').eq(0).should("contain","PNG")
        cy.get('#token-search-input').clear()
        cy.wait(5000)
        
        for(let i = 0; i < 24; i++){
        //Verifying all the farms to be visible
        cy.get('div[class="sc-eCYdqJ kBgWyD"]').eq(i).scrollIntoView()
            .should("be.visible")
            
        //Visiting details menu of each farm
        cy.get('button[class="sc-gsnTZi eduyxG sc-eIWpXs sc-fFtkDt bFxzEq fPpRXO"]').eq(i).click()
        cy.get('div[class="sc-eCYdqJ sc-eyCGVO fEptdj jNAbZy"]').should("contain","Details")
        //Visiting links in the details menu of each farm
        cy.get('a[class="sc-bczRLJ kbxJQv"]').each(page => {
            cy.request(page.prop('href')).as('link');
        });
        cy.get('@link').should(response => {
        
            expect(response.status).to.eq(200);
        });
        //Closing details page
        cy.get('svg[class="sc-bhVIhj gLGxRa"]').eq(3).click()
        
        }
    })

    /******************* Assertions on the pools page **************************/
    it('TC-03,06, Verify that the user is able to see all the farms when clicking on the "All Farms" Label', () => {
        cy.get('#superFarm').click()
        for(let i = 0; i<4 ;i++){
        cy.get('div[class="sc-eCYdqJ kBgWyD"]').eq(i).scrollIntoView()
            .should("be.visible")
        cy.get('div[class="sc-dZeWys bQvbRy"]').eq(i).scrollIntoView()
        .should("be.visible")
        
            
        }
    })
})