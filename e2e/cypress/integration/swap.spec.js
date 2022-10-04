/// <reference types = "Cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data'
// import {newsLinks, socialLinks} from '../support/src/dashboard'
const {watchListBtn, watchlistDropDown, tokenSearch, tokenAssert, tokenSelect, tokenSection, tokenMouseOver, crossBtn, switchToken, watchListTokenAssert, watchlistTimeBtn, watchlistLinkBtn, watchlistTradeBtn} = selectors.dashboard
const {tokenName, AvaxToken, switchArray, chartTimeArray} = data.dashboard
describe('Swap', () => {
    
    beforeEach('',() => {
        cy.visit('/')
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        })    
    })

    it('TC-01, Verify that the swap page can be accessed from the side men', () => {
        cy.get('#swap').click();
        cy.get('.cIKZSl')
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get('div[class="sc-hMFtBS cIKZSl"] a')
            .should("have.class","ACTIVE")
    })

    it('TC-02, 03, 04, 05, 06, 07,08, 09, 10, 11, 13 Verify that the user can see the icon of the token selected from the "To" dropdown', () => {
        cy.get('#swap').click();
            cy.get('[class="sc-eCYdqJ sc-ftvSup fEptdj bnstfL"]')
                .eq(1).find('button').click()
            cy.get('[class="sc-kRktcz iieLhX"] div[class="sc-jSMfEi icpGcW"]')
                .contains('aAVAXb').scrollIntoView().click()
            cy.get('div[class="sc-fzsDOv dhoLIG"]').within (header => {
                cy.get(header).find('img[class="sc-ivTmOn htFfaf"]')
                    .eq(0).then( text => {
                        cy.get(text).scrollIntoView()
                            .should('have.attr',"alt", "aAVAXb logo")
                })
                cy.get(header).find('div[class="sc-jSMfEi bLwoif"]')
                    .should('contain', 'aAVAXb/USDC')
                cy.get(header).find('div[class="sc-eCYdqJ cDcquI"] div')
                    .then(aavaxPrice => {
                        expect(aavaxPrice).to.contain('aAVAXb/USDC')
                })
            })
            
    })
    it('TC-15, Verify that the user can search for a specific token to add to the watchlist', () => {
        cy.get('#swap').click();
        cy.get(watchListBtn).
            should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type(tokenName)
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain",tokenName)
    })
    it("TC-16, Verify that the user can add the token to the watchlist", () => {
        cy.get('#swap').click();
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", AvaxToken)
    })
    it('TC-18, Verify that the user is able to switch between the tokens in watchlist', () => {
        cy.get('#swap').click();
        for (var i =1; i < 3; i++) {
            cy.get(`${switchToken}:nth-child(${i})`).click()
            cy.get(watchListTokenAssert)
                .should('contain',switchArray[i-1])
        }
    })
    chartTimeArray.forEach( time => {
        it(`TC-20,21,22,23,24, Verify that the chart is updated by pressing ${time} in watchlist`, () => {
            cy.get('#swap').click();
            cy.get(watchlistTimeBtn)
                .should('have.attr', 'color', 'text1')
                    .contains(time).click()
            cy.get(watchlistTimeBtn)
                .contains(time)
                .should('have.attr', 'color', 'mustardYellow')
                .should('have.class','sc-gsnTZi gPFlPI')
        })
    })
    it('TC-17, Verify that the user can remove the token from the watchlist', () => {
        cy.get('#swap').click();
        cy.get(tokenSection).then($avax => {
            if($avax.text().includes(AvaxToken)){
                cy.get(tokenMouseOver).eq(0)
                    .trigger("mouseover")
                cy.get(crossBtn).click()
            } 
            else {
                cy.get(watchListBtn)
                    .should('be.visible').click()
                cy.get(watchlistDropDown)
                    .should('be.visible')
                cy.get(tokenSearch).type(tokenName)
                cy.get(tokenSelect).eq(0).click()
                cy.get(tokenAssert)
                    .should("contain",tokenName)
                cy.get(tokenAssert).eq(0).trigger("mouseover")
                cy.get(crossBtn).click()
            }
        })  
    })
    it('TC-25, Verify that Link button redirects the user to the info.exchange page', () => {
        cy.get('#swap').click();
        let linkUrl = "https://info.pangolin.exchange/#/token/0x60781C2586D68229fde47564546784ab3fACA982"
        cy.get(watchlistLinkBtn)
            .invoke("removeAttr","target").click()
        cy.url().should("include", linkUrl)
        cy.contains(/pangolin/i)
            .should("be.visible")
    })

    it('TC-26, Verify that the user can make a trade from the Dashboard', () => {
        let swap = "https://dev.pangolin.exchange/#/swap"
        cy.get(watchlistTradeBtn)
            .contains(/trade/i).click()
        cy.url()
            .should("include", swap)
        cy.contains(/24H Change/i)
            .should("be.visible")
    })
})