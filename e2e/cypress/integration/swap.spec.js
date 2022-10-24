/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data'
import { switchingValues, tokenDisable, tokenSwitching, slippage, disconnectWallet, connectWallet1 } from '../support/src/swap'
import { pangolinUsefulLinks } from '../support/src/PangolinUsefulLinks'
// import {newsLinks, socialLinks} from '../support/src/dashboard'
const {watchListBtn, watchlistDropDown, tokenSearch, tokenAssert, tokenSelect, tokenSection, tokenMouseOver, crossBtn, switchToken, watchListTokenAssert, watchlistTimeBtn, watchlistLinkBtn, connectWallet, linkBtn, watchlistTradeBtn} = selectors.dashboard
const {tokenName, AvaxToken, switchArray, chartTimeArray, linkUrl, connectToWalletMsg} = data.dashboard
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

/********************************************* Selecting swap from side menu ********************************************/
    it('TC-01, Verify that the swap page can be accessed from the side menu', () => {
        //Selecting swap from side menu 
        cy.get(swapSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(swapSideMenuSelect)
            .should("have.class","ACTIVE")
    })

/*************************************** Assertion of the selected token in "To" dropdown ************************************/
    it('TC-02, 03, 04, 05, 06, 07,08, 09, 10, 11, 13 Verify that the user can see the icon of the token selected from the "To" dropdown', () => {
            cy.get(tradeBtns)
                .eq(1).find('button').click()
            cy.get(tokenModal)
                .contains(aAVAXb).scrollIntoView().click()
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

/*********************************** Adding token to watchlist through the Add button ********************************/
    it("TC-16, Verify that the user can add the token to the watchlist", () => {
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", AvaxToken)
    })

/***********************************  Removing the token if already added  ********************************************/
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

/*********************************** Adding token to watchlist by specific search  **************************************/
    it('TC-15, Verify that the user can search for a specific token to add to the watchlist', () => {
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type(tokenName)
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain",tokenName)
    })

/*********************************** Switching between the tokens in the watchlist  ***************************************/
    it('TC-18, Verify that the user is able to switch between the tokens in watchlist', () => {        
        for (var i = 1; i < 3; i++) {
            cy.get(`${switchToken}:nth-child(${i})`).click()
            cy.get(watchListTokenAssert)
                .should('contain',switchArray[i-1])
        }
    })

/**************************** Updating and asserting the chart by pressing the time buttons ******************************/
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

/************************************* Clicking the link button on the watchlist  ****************************************/
    it('TC-25, Verify that Link button redirects the user to the info.exchange page', () => {
        pangolinUsefulLinks(`${linkBtn}`, `${linkUrl}`, pangolinLinksArr[0])
    })

/**************************************** Switching between the selected tokens  ******************************************/
    it('TC-30, Verify that the user can switch between the selected tokens', () => {
        switchingValues(1, 'From', `${AvaxToken}`)
        switchingValues(3, 'To', `${usdc}`)
        cy.get(tradeModal).find(switchModal).find(switchBtn).click()
        switchingValues(1, 'From', `${usdc}`)
        switchingValues(3, "To", `${AvaxToken}`)
    })

/******************************** Assertion of the selected token in the "From" dropdown **********************************/
    it('TC- 35, Verify that the selected token is disabled in the "From" dropdown', () => {
        
        tokenDisable(1, "From", `${AvaxToken}`, 0)
    })

/******************************* Assertion on the validation message for a low slippage ***********************************/
    it(`TC- 47, Verify that the message ${lowSlippageMessage} appear when low slippage is entered`, () => {
        slippage('0.00001', `${transactionFailMessage}`, `${lowSlippageMessage}` )
    })

/******************************* Assertion on the validation message for a high slippage *********************************/
    it(`TC- 48, Verify that the message ${highSlippageMessage} appears when high slippage is entered`, () => {
        slippage('11', `${transactionMayFortuneMessage}`, `${highSlippageMessage}` )
    })

/****************************** Assertion on the validation message for a very high slippage *****************************/
    it(`TC- 49, Verify that the message ${veryHighSlippageMessage}  appears when very high slippage is entered`, () => {
        slippage('111', `${expertModeMessage}`, `${veryHighSlippageMessage}` )
    }) 

/****************************** Assertion on the "Save&Close" button for a very high slippage *****************************/
    it(`TC- 50, Verify that the ${saveCloseBtnTxt} button is disabled when very high slippage is entered`, () => {
        slippage('111', `${expertModeMessage}`, `${veryHighSlippageMessage}` )
        cy.get(saveCloseBtn).then( saveCloseBtn => {
            expect(saveCloseBtn).to.have.css('background-color', 'rgb(229, 229, 229)')
        })
    })

/******************************* Selecting and asserting on the slippage percent buttons **********************************/
    it(`TC- 51, 52, 53, 54, 55, 56 Verify that the user can set the slippage to ${slipPage}`, () => {
        for(var z = 0; z < slipPage.length; z++ ) {
            cy.get(settingBtn).click()
            cy.get(slipPageValues).eq(`${z}`).click()
            cy.get(slipPageValuesAssert).should('have.css', 'background-color', 'rgb(255, 200, 0)')
            cy.get(saveCloseBtn1).should('contain', `${saveCloseBtnTxt}`).click()
        }
    })

/******************************* Clicking on the "Turn on expert mode" button on the popup ********************************/
    it('TC-57 , Verify that the user can "ON" the expert mode', () => {
        cy.get(settingBtn).click()
        cy.get(toggleExpertMode).contains('ON').click()
        cy.window().then(function(promptelement){
            cy.stub(promptelement, 'prompt').returns("confirm");
          });
        cy.contains(/Turn On expert mode/i).click()
        cy.get(saveCloseBtn1).should('contain', `${saveCloseBtnTxt}`).click()
    })

/**************************************  Assertion on the Save and Close button  ******************************************/
    it(`TC-71, Verify that the user can see the ${connectWalletTxt} button in the Market section if the wallet is not connected`, () => {
        connectWallet1(fromField, toField, connectWalletBtn)
    })

/**************************************  Assert Save and Close button in Limit tab ****************************************/
    it(`TC-72, Verify that the user can see the ${connectWalletTxt} button in the Limit(Sell) section if the wallet is not connected`, () => {
        cy.get(limitBtn).contains("LIMIT").click()
        connectWallet1(fromField, toField, connectWalletBtn)
    })

/*************************************  Assert Save and Close button in Buy tab of Limit ***********************************/
    it('TC-73, Verify that the user can see the "Connect wallet" button in the Limit(buy) section if the wallet is not connected', () => {
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(buyBtn).contains("BUY").click()
        connectWallet1(fromField, toField, connectWalletBtn)
    })

/*****************************************  Selected the Swap percentages  *************************************************/
    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-74,75,76,77, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Market section if the wallet is not connected`, () => {
        cy.get(swapPercentageBtns).contains(`${swapPercentage[i]}`).click()
        disconnectWallet(fromField, toField)
    })
    }

/***************************************  Selected the swap percentages in Limit tab ****************************************/
    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-78,79,80,81, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Limit sell section if the wallet is not connected`, () => {
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(limitPercentageBtns).contains(`${swapPercentage[i]}`).click()
        disconnectWallet(fromField, toField)
    })
    }

/***********************************  Selected the Swap percentages in buy tab of limit **************************************/
    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-82,83,84,85, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Limit Buy section if the wallet is not connected`, () => {
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(buyBtn).contains("BUY").click()
        cy.get(limitPercentageBtns).contains(`${swapPercentage[i]}`).click()
        disconnectWallet(fromField, toField)
    })
    }

/************************ Assert the connect a Wallet text when wallet is not connected in Watchlist **************************/
    it('TC-86,87,88,89 Verify that the user can see the message "Connect a wallet to see your Portfolio" if the wallet is not connnected', () => {
        cy.get(connectWallet)
            .should('contain', "Connect to a wallet") 
        cy.get(connectWalletMessage)
            .should( chainText => {
                expect(chainText).to.contain(connectToWalletMsg)
        })
    })

/***************************************  Assert the tokens in From and To dropdowns *****************************************/
    it('TC-91, Verify that the tokens switch when the user selects the same selected token for the dropdown', () => {
        tokenSwitching(1, "From", `${AvaxToken}`, 1)
        switchingValues(1, 'From', `${usdc}`)
        switchingValues(3, "To", `${AvaxToken}`)
    })
})