/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data.json'
import { pangolinUsefulLinks } from '../support/src/PangolinUsefulLinks'
const {proposalsArray,proposalOrder} = data.vote
const {voteSideMenu,voteSideMenuSelect,proposalTitle,detailsBtn,proposalTitleInner,forfield,forValue,againstValue,selfBtn,aboutSection,executedBtn,proposalOrders} = selectors.vote
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
    it('TC-01, Verify that the swap page can be accessed from the side menu', () => {
        cy.get(voteSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(voteSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    /******************* Accessing the proposals **************************/
    it.only('TC-03,04,05,17,18,19,20,21 Verify that the user can see the executed proposal', () => {
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
                let array = ["0x650f5865541f6d68bddfe977db933c293ea72358", "0x66c048d27aFB5EE59E4C07101A483654246A4eda", "0xefa94de7a4656d787667c749f7e1223d71e9fd88", "0xAc61FD938E762357eEe739EB30938783366f43a7"]
                for (let j = 0; j<= array.length - 1; j++){
                cy.get('a[class="sc-gqjmRU cGBnKx"]').contains(`${array[j]}`).invoke('removeAttr','target').scrollIntoView().click({force: true})
                cy.contains('Block').should('be.visible')
                cy.go('back')
                cy.wait(5000)
            }
                // cy.pause()
            // cy.get('a[class="sc-gqjmRU cGBnKx"]').invoke('removeAttr', 'target').each( $test3 => {
            //     cy.get($test3).click({force: true})
            //     cy.contains('Block').should('be.visible')
            //     cy.go('back')
            //     cy.wait(5000)
            // })

            cy.get(forfield ).then( $test => {
                cy.contains($test[0].children[0].children[0].innerText).should('be.visible')
                cy.contains($test[0].children[0].children[1].innerText).should('be.visible')
            })
            // cy.get(forValue).contains('Against').should('be.visible').then($test1 => {
            //     cy.get($test1).find(againstValue).then($test2 => {
            //     cy.log(cy.contains($test2[0].innerText).should('be.visible'))
            //     })
            // })
            // pangolinUsefulLinks('')
            cy.get('a[class="sc-gqjmRU cGBnKx"]').contains('0xefa94de7a4656d787667c749f7e1223d71e9fd88').invoke('removeAttr','target').click()
            cy.go('back')
            cy.pause()
            cy.contains('Back to Proposals').click()
        }
    })
})