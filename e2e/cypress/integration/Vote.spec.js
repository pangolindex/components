/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data.json'
const {proposalsArray,proposalOrder} = data.vote
const {voteSideMenu,voteSideMenuSelect,proposalTitle,detailsBtn,proposalTitleInner,forfield,forValue,againstValue,selfBtn,aboutSection,executedBtn,proposalOrders, voteLinks} = selectors.vote
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

    /******************* Selecting vote from side menu **************************/
    it('TC-01, Verify that the vote page can be accessed from the side menu', () => {
        cy.get(voteSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(voteSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    /******************* Accessing the proposals **************************/
    it('TC-03,04,05,17,18,19,20,21 Verify that the user can see the executed proposal', () => {
        cy.get(selfBtn)
        .should('not.exist')
        cy.contains(/Pangolin Governance/i).should('be.visible')
        cy.get(aboutSection).should('contain', 'About')
        for(let i = 0 ; i<14 ; i++){
            cy.get(executedBtn).eq(i)
            .should('have.css','user-select','none')
            .should('have.attr','color','#18C145')
            .should('contain','executed')
            cy.get(proposalOrders).should('contain', `${proposalOrder[i]}`)
        }
        for (let i =0; i < 14; i++){
            cy.get(proposalTitle)
                .should('contain', `${proposalsArray[i]}`)
            cy.get(detailsBtn).eq(i).click()
            cy.get(proposalTitleInner)
                .should('contain', `${proposalsArray[i]}`)
            cy.get(forfield ).then( $test => {
                cy.contains($test[0].children[0].children[0].innerText).should('be.visible')
                cy.contains($test[0].children[0].children[1].innerText).should('be.visible')
            })
            cy.get(forValue).contains('Against').should('be.visible').then($test1 => {
                cy.get($test1).find(againstValue).then($test2 => {
                cy.log(cy.contains($test2[0].innerText).should('be.visible'))
                })
            })
           cy.get(voteLinks).each(page => {
                cy.request(page.prop('href')).as('link');
            });
            cy.get('@link').should(response => {
                expect(response.status).to.eq(200);
            });
            cy.contains('Back to Proposals').click()
        }
    })
})