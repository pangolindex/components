/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import { pangolinUsefulLinks } from '../support/src/PangolinUsefulLinks'
import data from '../fixtures/pangolin-data.json'
const {proposalsArray} = data.vote
const {voteSideMenu,voteSideMenuSelect,proposalTitle,detailsBtn,proposalTitleInner} = selectors.vote
describe('Vote', () => {
    
    beforeEach('',() => {
        cy.visit('/')
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        }) 
        cy.get('#vote').click()
    })

/********************************************* Selecting vote from side menu ********************************************/
    it('TC-01, Verify that the swap page can be accessed from the side menu', () => {
        //Selecting vote from side menu 
        cy.get(voteSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(voteSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    it('TC-03,04,05 Verify that the user can see the executed proposal', () => {
        
        for (let i =0; i < 14; i++){
            cy.get(proposalTitle).should('contain', `${proposalsArray[i]}`)
            cy.get(detailsBtn).eq(i).click()
            cy.get(proposalTitleInner).should('contain', `${proposalsArray[i]}`)
            cy.get('div.sc-kafWEX.fwaFKz div' ).then( $test => {
                cy.contains($test[0].children[0].children[0].innerText).should('be.visible')
                cy.contains($test[0].children[0].children[1].innerText).should('be.visible')
            })
            cy.get('div[class="sc-jSMfEi kZurnt"]').contains('Against').should('be.visible').then($test1 => {
                cy.get($test1).find('~ div[class="sc-jSMfEi duAyBD"]').then($test2 => {
                    console.log($test2)
                    cy.log(cy.contains($test2[0].innerText).should('be.visible'))
                })
            })
            
            cy.contains('Back to Proposals').click()
        }
    })
    
    it('TC-17, Verify that the user cannot "Delegate" the Native token if the wallet is not connected', () => {
        //Verifying the button to be not exist 
        cy.get('[class="sc-gqjmRU cGBnKx sc-dTdPqK gHZHFK"]')
            .should('not.exist')
        
    })

    it.only('TC-18, Verify that the title "Pangolin Governance" appears on the page', () => {
        //Verifying the title to be exist
        cy.contains(/Pangolin Governance/i).should('be.visible')
        
    })

    it('TC-19, Verify that the about section appears on the page', () => {
        //Verifying the about section to be exist
        cy.get('[class="sc-jSMfEi IMWyv"]').should('contain', 'About')
        
    })

})