/// <reference types = "cypress"/>
import selectors from "../fixtures/selectors.json"
const {swapSideMenu, swapSideMenuSelect} = selectors.swap
describe(`Airdrop`, () => {
    beforeEach('',() => {
        cy.visit('/')
            // Preserve cookie in every test
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        })
        cy.get('#airdrop').click()
    })
    it(`TC-01, Verify that the airdrop page can be accessed from the side menu`, () => {
        cy.get(swapSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(swapSideMenuSelect)
            .should("have.class","ACTIVE")
    })
    it(`TC-03,04,05,15,16,17,18,19,20,21, Verify that the user can see the card "Claim PNR" on the airdrop page`, () => {
    const cards = ["Old PSB Reimbursement","Claim PSB","Claim PNR","Claim PFL"]
    cy.get('p[class="sc-krDsej kIrOqg"]').contains('Pangolin Going Crosschain').should('be.visible')
    cy.get('img[class="sc-eMigcr eOBIOP"]').should('have.attr', 'src', './static/media/PSB.7fd03da2.svg').should('be.visible')
    for(let i = 0; i<cards.length; i++){
     cy.get('div[class="sc-jSMfEi kvSvpp"]').contains(cards[i]).should('be.visible')
        if(cards[i] ==="Old PSB Reimbursement") {
            cy.contains("Let's check if you are eligible!").should('be.visible')
            cy.get('button').should('contain', 'Connect Wallet').eq(1).click()
            cy.get('div[class="sc-bSakgD btUThD"]').should('contain', 'Connect to a wallet')
            cy.get('svg[class="sc-bhVIhj sc-dSuTWQ gLGxRa aodbf"]').click()
        }
        if(cards[i] ==="Claim PSB") {
            cy.contains("Let's check if you are eligible!").should('be.visible')
            cy.get('button').should('contain', 'Connect Wallet').eq(2).click()
            cy.get('div[class="sc-bSakgD btUThD"]').should('contain', 'Connect to a wallet')
            cy.get('svg[class="sc-bhVIhj sc-dSuTWQ gLGxRa aodbf"]').click()

        }
        if(cards[i] ==="Claim PNR") {
            cy.contains("Coming SOON...").should('be.visible')
        }
        if(cards[i] ==="Claim PFL") {
            cy.contains("Coming SOON...").should('be.visible')
        }
    }
        
    })
})












