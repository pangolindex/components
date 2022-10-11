/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data'
import { switchingValues, tokenDisable } from '../support/src/swap'
// import {newsLinks, socialLinks} from '../support/src/dashboard'
const {watchListBtn, watchlistDropDown, tokenSearch, tokenAssert, tokenSelect, tokenSection, tokenMouseOver, crossBtn, switchToken, watchListTokenAssert, watchlistTimeBtn, watchlistLinkBtn} = selectors.dashboard
const {tokenName, AvaxToken, switchArray, chartTimeArray} = data.dashboard
const {fromField, toField, connectWalletBtn} = selectors.swap
describe('Swap', () => {
    
    beforeEach('',() => {
        cy.visit('/')
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        }) 
        cy.get('#swap').click()
    })

    it('TC-01, Verify that the swap page can be accessed from the side men', () => {
        cy.get('.cIKZSl')
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get('div[class="sc-hMFtBS cIKZSl"] a')
            .should("have.class","ACTIVE")
    })

    it('TC-02, 03, 04, 05, 06, 07,08, 09, 10, 11, 13 Verify that the user can see the icon of the token selected from the "To" dropdown', () => {
            cy.get('[class="sc-eCYdqJ sc-ftvSup fEptdj bnstfL"]')
                .eq(1).find('button').click()
            cy.get('[class="sc-fpcwso kgTBKZ"] div[class="sc-lmHNfd cbAcSN"]')
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
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", AvaxToken)
    })
    it('TC-18, Verify that the user is able to switch between the tokens in watchlist', () => {
        for (var i =1; i < 3; i++) {
            cy.get(`${switchToken}:nth-child(${i})`).click()
            cy.get(watchListTokenAssert)
                .should('contain',switchArray[i-1])
        }
    })
    chartTimeArray.forEach( time => {
        it(`TC-20,21,22,23,24, Verify that the chart is updated by pressing ${time} in watchlist`, () => {
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
        let linkUrl = "https://info.pangolin.exchange/#/token/0x60781C2586D68229fde47564546784ab3fACA982"
        cy.get(watchlistLinkBtn)
            .invoke("removeAttr","target").click()
        cy.url().should("include", linkUrl)
        cy.contains(/pangolin/i)
            .should("be.visible")
    })

    it('TC-, Verify that the user can see the "Enter an amount" button when the fields are kept empty', () => {
        cy.get(fromField).should(fromValue => {
            // From field
            expect(fromValue).have.attr('placeholder','0.00')
        
        })
        cy.get(toField).should(toValue => {
            // To field
            expect(toValue).have.attr('placeholder','0.00')
        })

        cy.get(connectWalletBtn).should(enterAmountBtn => {
            expect(enterAmountBtn).to.contain('Connect Wallet')
            expect(enterAmountBtn).have.css('background-color','rgb(229, 229, 229)')
        })
    })
    
    it('TC-30, Verify that the user can switch between the selected tokens', () => {
        switchingValues(1, 'From', 'AVAX')
        switchingValues(3, 'To', "USDC")
        cy.get('div[class="sc-eCYdqJ sc-brCFrO fEptdj gIDZHZ"] div[class="sc-eCYdqJ kMEFVW"]').find('div[class="sc-eCYdqJ erxZVL"]').find('div[class="sc-evrZIY fmutkA"]').click()
        switchingValues(1, 'From', 'USDC')
        switchingValues(3, "To", "AVAX")
    })

    it('TC- 35, Verify that the selected token is disabled in the "From" dropdown', () => {
        tokenDisable(1, "From", "AVAX", 0)
    })

    it('TC- 50, Verify that the "Save & Close" button is disabled when very high slippage is entered', () => {
        cy.get('div[class="sc-eCYdqJ sc-lbxAil fEptdj cBXVhH"]').click()
        cy.get('input[class="sc-iBkjds puNdi"]').eq(0).clear().type('111')
        cy.get('div[color="error"][class="sc-jSMfEi gznKUx"]').should('have.text', 'Very high slippage, activate expert mode to be able to use more than 50%')
        cy.get('button[class="sc-gsnTZi jquISs"]').then( saveCloseBtn => {
            expect(saveCloseBtn).to.have.css('background-color', 'rgb(229, 229, 229)')
        })
    })
    
    const slipPage = ['0.1%', '0.5%', '1%', '60', '300', '600']
        it(`TC- 51, 52, 53, 54, 55, 56 Verify that the user can set the slippage to ${slipPage}`, () => {
        for(var z = 0; z < slipPage.length; z++ ) {
            cy.get('div[class="sc-eCYdqJ sc-lbxAil fEptdj cBXVhH"]').click()
            cy.get('div.sc-eCYdqJ.sc-jTYCaT').eq(`${z}`).click()
            cy.get('div.JuqvI').should('have.css', 'background-color', 'rgb(255, 200, 0)')
            cy.get('button[class="sc-gsnTZi hePPZs"]').should('contain', 'Save & Close').click()
        }
    })

    it('TC-57 , Verify that the user can "ON" the expert mode', () => {
        cy.get('div[class="sc-eCYdqJ sc-lbxAil fEptdj cBXVhH"]').click()
        cy.get('div[class="sc-jIZahH iqjIFB"]').contains('ON').click()
        
        cy.window().then(function(promptelement){
            cy.stub(promptelement, 'prompt').returns("confirm");
          });
        cy.contains(/Turn On expert mode/i).click()
        cy.get('button[class="sc-gsnTZi hePPZs"]').should('contain', 'Save & Close').click()
    })
})