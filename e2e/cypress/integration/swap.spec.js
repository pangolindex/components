/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data'
import { switchingValues, tokenDisable, tokenSwitching, slippage, disconnectWallet, connectWallet1 } from '../support/src/swap'
import { pangolinUsefulLinks } from '../support/src/PangolinUsefulLinks'
// import {newsLinks, socialLinks} from '../support/src/dashboard'
const {watchListBtn, watchlistDropDown, tokenSearch, tokenAssert, tokenSelect, tokenSection, tokenMouseOver, crossBtn, switchToken, watchListTokenAssert, watchlistTimeBtn, watchlistLinkBtn, connectWallet, linkBtn, watchlistTradeBtn} = selectors.dashboard
const {tokenName, AvaxToken, switchArray, chartTimeArray} = data.dashboard
const {fromField, toField, connectWalletBtn,limitBtn,buyBtn,swapPercentageBtns,limitPercentageBtns,swapSideMenu,swapSideMenuSelect,tradeBtns,tokenModal,headerDetailsModal,toTokenLogo,toTokenName,toTokenPrice,connectWalletMessage,tradeModal,switchModal,switchBtn,settingBtn,transactionFailMessage,transactionMayFortuneMessage,expertModeMessage,saveCloseBtn, slipPageValues, slipPageValuesAssert, toggleExpertMode, saveCloseBtn1} = selectors.swap
const {swapPercentage, slipPage, aAVAXb, usdc, lowSlippageMessage, highSlippageMessage, veryHighSlippageMessage, saveCloseBtnTxt, connectWalletTxt} = data.swap
const {pangolinLinksArr} = data
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

    it('TC-01, Verify that the swap page can be accessed from the side menu', () => {
        //Selecting swap from side menu 
        cy.get(swapSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(swapSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    it('TC-02, 03, 04, 05, 06, 07,08, 09, 10, 11, 13 Verify that the user can see the icon of the token selected from the "To" dropdown', () => {
        
        // Token Modal and selecting aAVAXb
            cy.get(tradeBtns)
                .eq(1).find('button').click()
            cy.get(tokenModal)
                .contains(aAVAXb).scrollIntoView().click()

        // Assertion of the selected token in "To" dropdown
            cy.get(headerDetailsModal).within (header => {
                cy.get(header).find(toTokenLogo)
                    .eq(0).then( text => {
                        cy.get(text).scrollIntoView()
                            .should('have.attr',"alt", `${aAVAXb} logo`)
                })
                cy.get(header).find(toTokenName)
                    .should('contain', `${aAVAXb}/${usdc}`)
                cy.get(header).find(toTokenPrice)
                    .then(aavaxPrice => {
                        expect(aavaxPrice).to.contain(`${aAVAXb}/${usdc}`)
                })
            })
    })

    it("TC-16, Verify that the user can add the token to the watchlist", () => {
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        // Adding token to watchlist through the Add button
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", AvaxToken)
    })

    it('TC-17, Verify that the user can remove the token from the watchlist', () => {
        cy.get(tokenSection).then($avax => {
            //Removing the token if already added
            if($avax.text().includes(AvaxToken)){
                cy.get(tokenMouseOver).eq(0)
                    .trigger("mouseover")
                cy.get(crossBtn).click()
            } 
            //Adding the token and then removing if not already added 
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

    it('TC-15, Verify that the user can search for a specific token to add to the watchlist', () => {
        // Searching for specific token
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        
        // Adding token to watchlist by specific search
        cy.get(tokenSearch).type(tokenName)
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain",tokenName)
    })

    it('TC-18, Verify that the user is able to switch between the tokens in watchlist', () => {
        //Switching between the tokens in the watchlist
        
        for (var i = 1; i < 3; i++) {
            cy.get(`${switchToken}:nth-child(${i})`).click()
            cy.get(watchListTokenAssert)
                .should('contain',switchArray[i-1])
        }
    })

    chartTimeArray.forEach( time => {
        it(`TC-20,21,22,23,24, Verify that the chart is updated by pressing ${time} in watchlist`, () => {
            //Updating and asserting the chart by pressing the time buttons
            cy.get(watchlistTimeBtn)
                .should('have.attr', 'color', 'text1')
                    .contains(time).click()
            cy.get(watchlistTimeBtn)
                .contains(time)
                .should('have.attr', 'color', 'mustardYellow')
                .should('have.class','sc-gsnTZi gPFlPI')
        })
    })

    it('TC-25, Verify that Link button redirects the user to the info.exchange page', () => {
        //Clicking the link button on the watchlist
        let linkUrl = "https://info.pangolin.exchange/#/token/0x60781C2586D68229fde47564546784ab3fACA982"
        pangolinUsefulLinks(`${linkBtn}`, `${linkUrl}`, pangolinLinksArr[0])
    })

    it('TC-30, Verify that the user can switch between the selected tokens', () => {
        //Switching between the selected tokens
        //Assertion of the tokens present in the "From" and "TO"
        switchingValues(1, 'From', `${AvaxToken}`)
        switchingValues(3, 'To', `${usdc}`)
        cy.get(tradeModal).find(switchModal).find(switchBtn).click()
        switchingValues(1, 'From', `${usdc}`)
        switchingValues(3, "To", `${AvaxToken}`)
    })

    it('TC- 35, Verify that the selected token is disabled in the "From" dropdown', () => {
        //Assertion of the selected token in the "From" dropdown
        tokenDisable(1, "From", `${AvaxToken}`, 0)
    })
    
    it(`TC- 47, Verify that the message ${lowSlippageMessage} appear when low slippage is entered`, () => {
        //Assertion on the validation message for a low slippage
        slippage('0.00001', `${transactionFailMessage}`, `${lowSlippageMessage}` )
    })

    it(`TC- 48, Verify that the message ${highSlippageMessage} appears when high slippage is entered`, () => {
        //Assertion on the validation message for a high slippage
        slippage('11', `${transactionMayFortuneMessage}`, `${highSlippageMessage}` )
    })

    it(`TC- 49, Verify that the message ${veryHighSlippageMessage}  appears when very high slippage is entered`, () => {
        //Assertion on the validation message for a very high slippage
        slippage('111', `${expertModeMessage}`, `${veryHighSlippageMessage}` )
    })    

    it(`TC- 50, Verify that the ${saveCloseBtnTxt} button is disabled when very high slippage is entered`, () => {
        slippage('111', `${expertModeMessage}`, `${veryHighSlippageMessage}` )
        //Assertion on the "Save&Close" button for a very high slippage
        cy.get(saveCloseBtn).then( saveCloseBtn => {
            expect(saveCloseBtn).to.have.css('background-color', 'rgb(229, 229, 229)')
        })
    })
    
    it(`TC- 51, 52, 53, 54, 55, 56 Verify that the user can set the slippage to ${slipPage}`, () => {
        //Selecting and asserting on the slippage percent buttons 
        for(var z = 0; z < slipPage.length; z++ ) {
            cy.get(settingBtn).click()
            cy.get(slipPageValues).eq(`${z}`).click()
            cy.get(slipPageValuesAssert).should('have.css', 'background-color', 'rgb(255, 200, 0)')
            cy.get(saveCloseBtn1).should('contain', `${saveCloseBtnTxt}`).click()
        }
    })

    it('TC-57 , Verify that the user can "ON" the expert mode', () => {
        cy.get(settingBtn).click()
        cy.get(toggleExpertMode).contains('ON').click()
        //Clicking on the "Turn on expert mode" button on the popup
        cy.window().then(function(promptelement){
            cy.stub(promptelement, 'prompt').returns("confirm");
          });
        cy.contains(/Turn On expert mode/i).click()
        cy.get(saveCloseBtn1).should('contain', `${saveCloseBtnTxt}`).click()
    })

    it(`TC-71, Verify that the user can see the ${connectWalletTxt} button in the Market section if the wallet is not connected`, () => {
        // Assertion on the Save and Close button
        connectWallet1(fromField, toField, connectWalletBtn)
    })
    
    it(`TC-72, Verify that the user can see the ${connectWalletTxt} button in the Limit(Sell) section if the wallet is not connected`, () => {
        // Assert Save and Close button in Limit tab
        cy.get(limitBtn).contains("LIMIT").click()
        connectWallet1(fromField, toField, connectWalletBtn)
    })

    it('TC-73, Verify that the user can see the "Connect wallet" button in the Limit(buy) section if the wallet is not connected', () => {
        // Assert Save and Close button in Buy tab of Limit
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(buyBtn).contains("BUY").click()
        connectWallet1(fromField, toField, connectWalletBtn)
    })

    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-74,75,76,77, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Market section if the wallet is not connected`, () => {
        // Selected the Swap percentages  
        cy.get(swapPercentageBtns).contains(`${swapPercentage[i]}`).click()
        disconnectWallet(fromField, toField)
    })
    }
    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-78,79,80,81, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Limit sell section if the wallet is not connected`, () => {
        //Selected the swap percentages in Limit tab
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(limitPercentageBtns).contains(`${swapPercentage[i]}`).click()
        disconnectWallet(fromField, toField)
    })
    }
    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-82,83,84,85, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Limit Buy section if the wallet is not connected`, () => {
        // Selected the Swap percentages in buy tab of limit
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(buyBtn).contains("BUY").click()
        cy.get(limitPercentageBtns).contains(`${swapPercentage[i]}`).click()
        disconnectWallet(fromField, toField)
    })
    }

    it('TC-86,87,88,89 Verify that the user can see the message "Connect a wallet to see your Portfolio" if the wallet is not connnected', () => {
        cy.get(connectWallet)
            .should('contain', "Connect to a wallet")
        // Assert the connect a Wallet text when wallet is not connected in Watchlist 
        cy.get(connectWalletMessage)
            .should( chainText => {
                expect(chainText).to.contain(/Connect a wallet to see your portfolio/i)
        })
    })

    it('TC-91, Verify that the tokens switch when the user selects the same selected token for the dropdown', () => {
        // Assert the tokens in From and To dropdowns
        tokenSwitching(1, "From", `${AvaxToken}`, 1)
        switchingValues(1, 'From', `${usdc}`)
        switchingValues(3, "To", `${AvaxToken}`)
    })

})