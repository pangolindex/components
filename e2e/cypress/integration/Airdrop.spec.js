/// <reference types = "cypress"/>
import selectors from "../fixtures/selectors.json"
import data from '../fixtures/pangolin-data.json'
const {airdropSideMenu, airdropSideMenuSelect, pangolinTitle, songbirdLogo, cards, metamaskMenuTitle, metamaskMenuCrossBtn, haveQuestions, plusIcon, faqExp, minusIcon } = selectors.airdrop
const {cardsNames, title, eligibleMsg, comingSoonMsg, haveQs} = data.airdrop
const {connectWalletTxt} = data.swap
const {connectToWallet} = data.dashboard
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
    
    /******************* Selecting Airdrop from side menu **************************/
    it(`TC-01, Verify that the airdrop page can be accessed from the side menu`, () => {
        cy.get(airdropSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(airdropSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    /******************* Assertion on the cards **************************/
    it(`TC-03,04,05,15,16,17,18,19,20,21, Verify that the user can see the card "Claim PNR" on the airdrop page`, () => {
    cy.get(pangolinTitle).contains(title).should('be.visible')
    cy.get(songbirdLogo).should('have.attr', 'src', './static/media/PSB.7fd03da2.svg').should('be.visible')
    for(let i = 0; i < cardsNames.length; i++){
     cy.get(cards).contains(`${cardsNames[i]}`).should('be.visible')
        if(cardsNames[i] === "Old PSB Reimbursement" || cardsNames[i] === "Claim PSB") {
            cy.contains(eligibleMsg).should('be.visible')
            cy.get('button').should('contain', connectWalletTxt).eq(1).click()
            cy.get(metamaskMenuTitle).should('contain', connectToWallet)
            cy.get(metamaskMenuCrossBtn).click()
        }
        if(cardsNames[i] === "Claim PNR"  || cardsNames[i] === "Claim PFL") {
            cy.contains(comingSoonMsg).should('be.visible')
        }
    }
        
    })

    /********************* FAQS Assertions **********************************/
    it(`TC-08,09,10,11,12,13,14 Verify that the user can see the FAQ's on the airdrop page`, () => {
        cy.get(haveQuestions).contains(haveQs).should('be.visible')
        for(let i = 0; i < 6; i++){
            //......... Clicking on the same + icon
            cy.get(plusIcon).eq(i).click()
            cy.get(minusIcon).should("be.visible")
            cy.get(faqExp).should("be.visible")
            cy.get(minusIcon).click()
            cy.get(minusIcon).should("not.exist")
            cy.get(faqExp).should("not.exist")
            //......... Clicking on the next + icon
            cy.get(plusIcon).eq(i).click()
            cy.get(minusIcon).should("be.visible")
            cy.get(faqExp).should("be.visible")
            cy.get(plusIcon).eq(i+1)
            if(i === 6){
                cy.get(plusIcon).eq(i).click()
            }
            cy.get(plusIcon).eq(i).should("be.visible")
            cy.get(minusIcon).click()
        }
    })
})












