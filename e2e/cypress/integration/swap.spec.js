/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data'
import { switchingValues, tokenDisable, tokenSwitching } from '../support/src/swap'
// import {newsLinks, socialLinks} from '../support/src/dashboard'
const {watchListBtn, watchlistDropDown, tokenSearch, tokenAssert, tokenSelect, tokenSection, tokenMouseOver, crossBtn, switchToken, watchListTokenAssert, watchlistTimeBtn, watchlistLinkBtn, connectWallet} = selectors.dashboard
const {tokenName, AvaxToken, switchArray, chartTimeArray} = data.dashboard
const {fromField, toField, connectWalletBtn,limitBtn,buyBtn,swapPercentageBtns,limitPercentageBtns,swapSideMenu,swapSideMenuSelect,tradeBtns,tokenModal,headerDetailsModal,toTokenLogo,toTokenName,toTokenPrice,connectWalletMessage,tradeModal,switchModal,switchBtn,settingBtn,slippageField,transactionFailMessage,transactionMayFortuneMessage,expertModeMessage,saveCloseBtn, slipPageValues, slipPageValuesAssert, toggleExpertMode, saveCloseBtn1} = selectors.swap
const {swapPercentage, slipPage} = data.swap
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
        //side menu
        cy.get(swapSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")

        //side menu select
        cy.get(swapSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    it('TC-02, 03, 04, 05, 06, 07,08, 09, 10, 11, 13 Verify that the user can see the icon of the token selected from the "To" dropdown', () => {
        
        //Navigate to trade buttons (From- To dropdowns) - Clicking "To" dropdown
            cy.get(tradeBtns)
                .eq(1).find('button').click()

        // Token Modal and selecting aAVAXb
            cy.get(tokenModal)
                .contains('aAVAXb').scrollIntoView().click()

        // Assertion of the selected token in "To" dropdown
            cy.get(headerDetailsModal).within (header => {
                cy.get(header).find(toTokenLogo)
                    .eq(0).then( text => {
                        cy.get(text).scrollIntoView()
                            .should('have.attr',"alt", "aAVAXb logo")
                })
                cy.get(header).find(toTokenName)
                    .should('contain', 'aAVAXb/USDC')
                cy.get(header).find(toTokenPrice)
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

    it('TC-71, Verify that the user can see the "Connect wallet" button in the Market section if the wallet is not connected', () => {
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
    
    it('TC-72, Verify that the user can see the "Connect wallet" button in the Limit(Sell) section if the wallet is not connected', () => {
        
        cy.get(limitBtn).contains("LIMIT").click()
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

    it('TC-73, Verify that the user can see the "Connect wallet" button in the Limit(buy) section if the wallet is not connected', () => {
        
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(buyBtn).contains("BUY").click()

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
    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-74,75,76,77, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Market section if the wallet is not connected`, () => {
        
        cy.get(swapPercentageBtns).contains(`${swapPercentage[i]}`).click()
        cy.get(fromField).should(fromValue => {
            // From field
            expect(fromValue).have.attr('placeholder','0.00')
        
        })
        cy.get(toField).should(toValue => {
            // To field
            expect(toValue).have.attr('placeholder','0.00')
        })    
    })
    }

    it('TC-78,79,80,81, Verify that the user cannot set 25% of the total amount of the token in the Limit sell section if the wallet is not connected', () => {
        cy.get(limitBtn).contains("LIMIT").click()
        for(let i = 0; i < swapPercentage.length; i++){
        cy.get(limitPercentageBtns).contains(`${swapPercentage[i]}`).click()
        cy.get(fromField).should(fromValue => {
            // From field
            expect(fromValue).have.attr('placeholder','0.00')
        
        })
        cy.get(toField).should(toValue => {
            // To field
            expect(toValue).have.attr('placeholder','0.00')
        })
    }    
    })

    it('TC-82,83,84,85, Verify that the user cannot set 25% of the total amount of the token in the Limit Buy section if the wallet is not connected', () => {
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(buyBtn).contains("BUY").click()
        for(let i = 0; i < swapPercentage.length; i++){
        cy.get(limitPercentageBtns).contains(`${swapPercentage[i]}`).click()
        cy.get(fromField).should(fromValue => {
            // From field
            expect(fromValue).have.attr('placeholder','0.00')
        
        })
        cy.get(toField).should(toValue => {
            // To field
            expect(toValue).have.attr('placeholder','0.00')
        })
    }    
    })

    it('TC-86,87,88,89 Verify that the user can see the message "Connect a wallet to see your Portfolio" if the wallet is not connnected', () => {
        cy.get(connectWallet)
            .should('contain', "Connect to a wallet") 
        cy.get(connectWalletMessage)
            .should( chainText => {
                expect(chainText).to.contain(/Connect a wallet to see your portfolio/i)
        })
    })

    it('TC-30, Verify that the user can switch between the selected tokens', () => {
        switchingValues(1, 'From', 'AVAX')
        switchingValues(3, 'To', "USDC")
        cy.get(tradeModal).find(switchModal).find(switchBtn).click()
        switchingValues(1, 'From', 'USDC')
        switchingValues(3, "To", "AVAX")
    })
    
    it('TC-91, Verify that the tokens switch when the user selects the same selected token for the dropdown', () => {
        tokenSwitching(1, "From", "AVAX", 1)
        switchingValues(1, 'From', 'USDC')
        switchingValues(3, "To", "AVAX")
        // cy.get('div[class="sc-lmHNfd chzbHR"]').click()
    })

    it('TC- 35, Verify that the selected token is disabled in the "From" dropdown', () => {
        tokenDisable(1, "From", "AVAX", 0)
    })

    it('TC- 47, Verify that the message "Your transaction may fail" appear when low slippage is entered', () => {
        cy.get(settingBtn).click()
        cy.get(slippageField).eq(0).clear().type('0.00001')
        cy.get(transactionFailMessage).should('have.text', 'Your transaction may fail')
    })

    it('TC- 48, Verify that the message "Your transaction may be frontrun" appears when high slippage is entered', () => {
        //clicking on the setting button
        cy.get(settingBtn).click()
        
        //typing value into the slippage field
        cy.get(slippageField).eq(0).clear().type('11')

        //Validation message
        cy.get(transactionMayFortuneMessage).should('have.text', 'Your transaction may be frontrun')
    })

    it('TC- 49, Verify that the message "activate expert mode to be able to use more than 50%" appears when very high slippage is entered', () => {
        cy.get(settingBtn).click()
        cy.get(slippageField).eq(0).clear().type('111')
        cy.get(expertModeMessage).should('have.text', 'Very high slippage, activate expert mode to be able to use more than 50%')
    })    

    it('TC- 50, Verify that the "Save & Close" button is disabled when very high slippage is entered', () => {
        cy.get(settingBtn).click()
        cy.get(slippageField).eq(0).clear().type('111')
        cy.get(expertModeMessage).should('have.text', 'Very high slippage, activate expert mode to be able to use more than 50%')
        cy.get(saveCloseBtn).then( saveCloseBtn => {
            expect(saveCloseBtn).to.have.css('background-color', 'rgb(229, 229, 229)')
        })
    })
    
    it(`TC- 51, 52, 53, 54, 55, 56 Verify that the user can set the slippage to ${slipPage}`, () => {
        for(var z = 0; z < slipPage.length; z++ ) {
            cy.get(settingBtn).click()
            cy.get(slipPageValues).eq(`${z}`).click()
            cy.get(slipPageValuesAssert).should('have.css', 'background-color', 'rgb(255, 200, 0)')
            cy.get(saveCloseBtn1).should('contain', 'Save & Close').click()
        }
    })

    it('TC-57 , Verify that the user can "ON" the expert mode', () => {
        cy.get(settingBtn).click()
        cy.get(toggleExpertMode).contains('ON').click()
        
        cy.window().then(function(promptelement){
            cy.stub(promptelement, 'prompt').returns("confirm");
          });
        cy.contains(/Turn On expert mode/i).click()
        cy.get(saveCloseBtn1).should('contain', 'Save & Close').click()
    })
})