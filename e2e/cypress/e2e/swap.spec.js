/// <reference types = "cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data'
import { switchingValues, tokenDisable, tokenSwitching, slippage, disconnectWallet, connectWallet1 } from '../support/src/swap'
import { pangolinUsefulLinks } from '../support/src/PangolinUsefulLinks'
const {watchListBtn, watchlistDropDown, tokenSearch, tokenAssert, tokenSelect, tokenSection, tokenMouseOver, crossBtn, switchToken, watchListTokenAssert, watchlistTimeBtn, connectWallet, linkBtn, tokensList, disabledTokens, connectWalletMsg, chains, showBalanceBtn, hideBalanceBtn, watchlistTokens} = selectors.dashboard
const {tokenName, AvaxToken, switchArray, chartTimeArray, linkUrl, swap, connectToWallet, hideBalance, showBalance} = data.dashboard
const {fromField, toField, connectWalletBtn,limitBtn,buyBtn,swapPercentageBtns,limitPercentageBtns,swapSideMenu,swapSideMenuSelect,tradeBtns,tokenModal,headerDetailsModal,toTokenLogo,toTokenName,toTokenPrice,tradeModal,switchModal,switchBtn,settingBtn,transactionFailMessage,transactionMayFortuneMessage,expertModeMessage,saveCloseBtn, slipPageValues, slipPageValuesAssert, toggleExpertMode, saveCloseBtn1, sureMenu, settingCloseBtn, selectedSellBuyBtn, limitOrderSection, priceField, toggleExpertModeOn} = selectors.swap
const {swapPercentage, slipPage, aAVAXb, usdc, lowSlippageMessage, highSlippageMessage, veryHighSlippageMessage, saveCloseBtnTxt, connectWalletTxt, connectWalletMsge } = data.swap
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

    /*********************** Selecting swap from side menu *****************************/
    it('TC-01, Verify that the swap page can be accessed from the side menu', () => {
        cy.get(swapSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(swapSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    /************* Assertion of the selected token in "To" dropdown ***************************/
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

    /****************** Adding token to watchlist by specific search  ***********************/
    it('TC-17, Verify that the user can search for a specific token to add to the watchlist', () => {
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type(tokenName)
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain",tokenName)
    })

    /**************************  search for relevant result  ********************/
    it('TC-18, Verify that the relevant tokens appear when the user type in the "Search" field',() =>{
        cy.get(watchListBtn).
            should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type('p')
        cy.get(tokensList).each( relSearch => {
        cy.wrap(relSearch).should('contain','p')
        })
    })

    /**********************   if token is not found   ************************/    
    it('TC-19, Verify that the message "Not found" appears when no searches found', () =>{
        cy.contains(/Dashboard/)
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type("asdfg")
        cy.contains('Not found')
    })

    /***************** Adding token to watchlist through the Add button ***********************/
    it("TC-20,21,22,23,24 Verify that the user can add the token to the watchlist", () => {
        cy.contains(/Dashboard/)
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", AvaxToken)
        //button disable in the watchlist dropdown    
        cy.get(watchListBtn).
            should('be.visible').click({force: true})
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type(AvaxToken)  
        cy.get(disabledTokens).should('have.attr', 'disabled', 'disabled') 
        cy.get(watchListBtn)
            .should('be.visible').click({force: true}) 
        //Switching between the tokens in the watchlist
        for (var i = 0; i <= 1; i++) {
            cy.get(switchToken).eq(i).click({force: true})
            cy.get(watchListTokenAssert)
                .should('contain', switchArray[i])
        }  
        //Removing the token if already added
        cy.get(tokenSection).then($avax => {
            if ($avax.text().includes(AvaxToken)) {
                cy.get(tokenMouseOver).eq(0)
                    .trigger("mouseover")
                cy.get(crossBtn).click()
            } 
        })     
        //Token enable in the watchlist dropdown  
        cy.get(watchListBtn).
                should('be.visible').click()
            cy.get(watchlistDropDown)
                .should('be.visible')
            cy.get(tokenSearch).type(AvaxToken)
            cy.get(tokenSelect).eq(0).click({force:true})
            cy.get(tokenAssert)
                .should("contain", AvaxToken)
            cy.get(watchlistTokens).eq(0)
                .trigger("mouseover")
            cy.get(crossBtn).click()
            cy.get(watchListBtn).
                should('be.visible').click()
            cy.get(tokensList).contains(AvaxToken).should('be.visible') 
    })    

    /*************** Updating and asserting the chart by pressing the time buttons ***************/
    chartTimeArray.forEach( time => {
        it(`TC-26,27,28,29,30, Verify that the chart is updated by pressing ${time} in watchlist`, () => {
            cy.get(watchlistTimeBtn).should('have.attr', 'color', 'text1')
                .contains(time).click()
            cy.get(watchlistTimeBtn)
                .contains(time)
                .should('have.attr', 'color', 'mustardYellow')
                .should('have.class','sc-gsnTZi gPFlPI')
        })
    })

    /************** Clicking the link button on the watchlist  *******************/
    it('TC-31, Verify that Link button redirects the user to the info.exchange page', () => {
        pangolinUsefulLinks(`${linkBtn}`, `${linkUrl}`, pangolinLinksArr[0])
    })

    /********************  Trade on the selected token ***********************/ 
    it('TC-32, Verify that the user can trade on the selected token from the watchlist', () =>{
        cy.get(watchListBtn).
            should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type(tokenName)
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", tokenName)
        pangolinUsefulLinks(`button.jmaCMK`, `${swap}`, pangolinLinksArr[3])
        switchingValues(1, 'From', `${tokenName}`)
    })

    /***************** Switching between the selected tokens  ***********************/
    it.only('TC-37, Verify that the user can switch between the selected tokens', () => {
        switchingValues(1, 'From', `${AvaxToken}`)
        switchingValues(3, 'To', `${usdc}`)
        cy.get(tradeModal).eq(1).find(switchModal).find(switchBtn).click()
        switchingValues(1, 'From', `${usdc}`)
        switchingValues(3, "To", `${AvaxToken}`)
    })

    /************  Assert the tokens in From and To dropdowns ************************/
    it.only('TC-38, Verify that the tokens switch when the user selects the same selected token for the dropdown', () => {
        tokenSwitching(1, "From", `${AvaxToken}`, 1)
        switchingValues(1, 'From', `${usdc}`)
        switchingValues(3, "To", `${AvaxToken}`)
    })

    /************* Assertion of the selected token in the "From" dropdown ****************/
    it('TC- 43, Verify that the selected token is disabled in the "From" dropdown', () => {
        tokenDisable(1, "From", `${AvaxToken}`, 0)
    })

    /************* Assertion of the selected token in the "To" dropdown ****************/
    it('TC- 44, Verify that the selected token is disabled in the "To" dropdown', () => {
        cy.get(tradeBtns)
                .eq(1).find('button').click()
            cy.get(tokenModal)
                .contains(aAVAXb).scrollIntoView().click()
        tokenDisable(1, "To", `${aAVAXb}`, 1)
    })

    /************* Assertion on the validation message for a low slippage ***************/
    it(`TC-83,84, Verify that the message ${lowSlippageMessage} appear when low slippage is entered`, () => {
        slippage('0.00001', `${transactionFailMessage}`, `${lowSlippageMessage}` )
    })

    /****************** Assertion on the validation message for a high slippage *****************/
    it(`TC-85, Verify that the message ${highSlippageMessage} appears when high slippage is entered`, () => {
        slippage('11', `${transactionMayFortuneMessage}`, `${highSlippageMessage}` )
    })

    /*************** Assertion on the validation message for a very high slippage ****************/
    it(`TC-86, Verify that the message ${veryHighSlippageMessage}  appears when very high slippage is entered`, () => {
        slippage('111', `${expertModeMessage}`, `${veryHighSlippageMessage}` )
    }) 

    /********** Assertion on the "Save&Close" button for a very high slippage ******************/
    it(`TC-87, Verify that the ${saveCloseBtnTxt} button is disabled when very high slippage is entered`, () => {
        slippage('111', `${expertModeMessage}`, `${veryHighSlippageMessage}` )
        cy.get(saveCloseBtn).then( saveCloseBtn => {
            expect(saveCloseBtn).to.have.css('background-color', 'rgb(229, 229, 229)')
        })
    })

    /************** Selecting and asserting on the slippage percent buttons ****************/
    it.only(`TC-88, 89, 90, 91, 92, 93 Verify that the user can set the slippage to ${slipPage}`, () => {
        for(var z = 0; z < slipPage.length; z++ ) {
            cy.get(settingBtn).click()
            cy.get(slipPageValues).eq(`${z}`).click()
            cy.get(slipPageValuesAssert).should('have.css', 'background-color', 'rgb(255, 200, 0)')
            cy.get(saveCloseBtn1).should('contain', `${saveCloseBtnTxt}`).click()
        }
    })

    /*************** Clicking on the "Turn on expert mode" button on the popup ***************/
    it('TC-94, 95, 96 , Verify that the user can "ON" the expert mode', () => {
        cy.get(settingBtn).click()
        cy.get(toggleExpertMode).contains('ON').click()
        cy.get(sureMenu).should("contain", "Are you sure?")
        cy.window().then(function(promptelement){
            cy.stub(promptelement, 'prompt').returns("confirm");
            cy.contains(/Turn On expert mode/i).click({force: true})
          });
        cy.get(saveCloseBtn1).should('contain', `${saveCloseBtnTxt}`).click({force: true})
        cy.get(settingBtn).click()
        cy.get(toggleExpertModeOn).contains("ON").should("have.css", "background-color", "rgb(17, 17, 17)")

    })

    /**********************  Assertion on the Save and Close button  **********************/
    it(`TC-97, Verify that the user can save the changes in the settings`, () => {
        cy.get(settingBtn).click()
        cy.get(slipPageValues).eq(0).click()
        cy.get(slipPageValuesAssert).eq(0).should('have.css', 'background-color', 'rgb(255, 200, 0)')
        cy.get(saveCloseBtn1).should('contain', `${saveCloseBtnTxt}`).click({force: true})
        cy.get(settingBtn).click()
        cy.get(slipPageValuesAssert).eq(0).should('have.css', 'background-color', 'rgb(255, 200, 0)')
    
    }) 
    
    /**********************  Assertion on the Close button  **************************/
    it(`TC-98, Verify that the user can close the "Setting" card without saving any changes`, () => {
        cy.get(settingBtn).click()
        cy.get(slipPageValues).eq(0).click()
        cy.get(slipPageValuesAssert).eq(0).should('have.css', 'background-color', 'rgb(255, 200, 0)')
        cy.get(settingCloseBtn).contains("Close").click()
        cy.get(settingBtn).click()
        cy.get(slipPageValues).eq(0).should('have.css', 'background-color', 'rgb(17, 17, 17)')

    })  

    /**********************  Assertion on the connect wallet button  **************************/
    it(`TC-152, Verify that the user can see the ${connectWalletTxt} button in the Market section if the wallet is not connected`, () => {
        connectWallet1(fromField, toField, connectWalletBtn)
    })

    /******************  Assert connect wallet button in Limit tab **********************/
    it(`TC-99, 101, 153, Verify that the user can see the ${connectWalletTxt} button in the Limit(Sell) section if the wallet is not connected`, () => {
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(selectedSellBuyBtn).contains("SELL")
            .should('have.css', 'background-color', 'rgb(17, 17, 17)')
        cy.get(priceField).should("be.visible")
        connectWallet1(fromField, toField, connectWalletBtn)
    })

    /*********************  Assert connect wallet button in Buy tab of Limit *******************/
    it('TC-119, 154, Verify that the user can see the "Connect wallet" button in the Limit(buy) section if the wallet is not connected', () => {
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(buyBtn).contains("BUY").click()
        cy.get(selectedSellBuyBtn).contains("BUY")
            .should('have.css', 'background-color', 'rgb(17, 17, 17)')
        connectWallet1(fromField, toField, connectWalletBtn)
    })

    /********************* Selected the Swap percentages  ************************/
    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-155,156,157,158, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Market section if the wallet is not connected`, () => {
        cy.get(swapPercentageBtns).contains(`${swapPercentage[i]}`).click()
        disconnectWallet(fromField, toField)
    })
    }

    /********************  Selected the swap percentages in Limit tab ********************/
    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-159,160,161,162, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Limit sell section if the wallet is not connected`, () => {
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(limitPercentageBtns).contains(`${swapPercentage[i]}`).click()
        disconnectWallet(fromField, toField)
    })
    }

    /********************  Selected the Swap percentages in buy tab of limit **************/
    for(let i = 0; i < swapPercentage.length; i++){
    it(`TC-163,164,165,166, Verify that the user cannot set ${swapPercentage[i]} of the total amount of the token in the Limit Buy section if the wallet is not connected`, () => {
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(buyBtn).contains("BUY").click()
        cy.get(limitPercentageBtns).contains(`${swapPercentage[i]}`).click()
        disconnectWallet(fromField, toField)
    })
    }

    /********* Assert the connect a Wallet text when wallet is not connected in Watchlist ********/
    it('TC-167,168,169,170, Verify that the user can see the message "Connect a wallet to see your Portfolio" if the wallet is not connnected', () => {
        cy.get(chains)
            .should("not.exist")
        cy.get(showBalanceBtn).contains(hideBalance).click()
        cy.get(connectWalletMsg).should("contain", connectWalletMsge)
        cy.get(hideBalanceBtn).contains(showBalance).click()
        cy.get(connectWalletMsg).should("contain", connectWalletMsge)
        cy.get(connectWallet)
            .should('contain', connectToWallet) 
        cy.contains(connectWalletMsge).should('be.visible')
    })

    /******************  Assert limit order section **********************/
    it(`TC-171, Verify that no limit orders appears when the wallet is not connected`, () => {
        cy.get(limitBtn).contains("LIMIT").click()
        cy.get(limitOrderSection).contains("Limit Orders").should("not.exist")
        
    })

    
    // it('Your Portfolio', () => {
    //     //Total Amount Invested in the chains
    //     cy.visit('/swap')
    //     cy.get(swapSideMenu).click()
    //     cy.get(yourPortfolio).contains("Your Portfolio").should('be.visible')
    //     cy.get(amountInChainsSwap).should('not.be.empty');
    //     cy.get(hideBalanceBtnSwap).contains("Hide Your Balance").click()
    //     cy.get(stericsSwap).contains("*").should('be.visible')
    //     cy.get(showBalanceBtnSwap).contains("Show Your Balance").click()
    //     cy.get(amountInChainsSwap).should('not.be.empty');
    //     //Tokens along balances
    //     cy.get(tokensInChainsSwap).should('be.visible')
    //     cy.get(amountInTokensSwap).should('not.be.empty')
    // })
      //Token chain
        // cy.get(toTokenChain).contains("WAVAX").should('be.visible');    
        // cy.get(toTokenChain).contains("PNG").should('be.visible');    
        // cy.get(toTokenChain).contains("USDC").should('be.visible'); 
})