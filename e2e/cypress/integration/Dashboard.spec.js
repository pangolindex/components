/// <reference types = "Cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data'
import { newsLinks, socialLinks } from '../support/src/dashboard'
import { pangolinUsefulLinks } from '../support/src/PangolinUsefulLinks'
import {switchingValues} from '../support/src/swap'

describe('Dashboard', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })
    const { returnToLegacyBtn, languageBtn, lightMood, darkMood, noOfLanguages, watchListBtn, watchlistDropDown, tokenSearch, tokenSelect, tokenAssert, tokenMouseOver, crossBtn, switchToken, tokenSection, watchListTokenAssert, languageDropdown, watchlistTimeBtn, watchlistLinkBtn, watchlistTradeBtn, newsBtn, newsBody, newsNextBtn, newsPreBtn, watchlistGraphLine, graphUSD, sideMenuCollapse, sideMenuExpand, footerlinksSel, footerLinkBanner, footerLinkCloseBtn, pngButton, pngModal, pngPriceSel, linkBtn, pangolinLogo, swapIcon, dashboardIcon, connectWalletMsg, connectWallet, tokenMouseOverEnable, PNGBtn, PNGValue, addPNG, PNGLogo, showBalanceBtn, hideBalanceBtn, tokensList, disabledTokens} = selectors.dashboard
    const { returnToLegacy, languagesArray, tokenName, AvaxToken, switchArray, newsLinkArray, newsLinkAssertArray, chartTimeArray, socialLinksArray, socialLinksContents, footerLinks, newsSongBird, usd, coinBase, bridgeSwap, connectToWalletMsg, connectToWallet, linkUrl, swap, hideBalance, showBalance} = data.dashboard
    const {pangolinLinksArr} = data
    const legUrl = "https://legacy.pangolin.exchange/#/"
    beforeEach('', () => {
        cy.visit('/dashboard')
    })

    /********************* Expanded the side menu when mouseover on it  *********************/
    it('TC-01,02, Verify that the side menu is expanded while hovering the pointer over it', () => {
        cy.get(sideMenuCollapse).should(visible => {
            expect(visible).to.be.visible
        }).then(sidemenu => {
            cy.get(sidemenu).trigger('mouseover')
            cy.get(sideMenuExpand)
                .should('be.visible')
        })
    })

    /************** Assert the Dashboard can accessed from sidemenu  ************************/    
    it('TC-03, Verify that the Dashboard page can be accessed from the side menu', () => {
        cy.get(sideMenuCollapse).should(visible => {
            expect(visible).to.be.visible
        }).then(sidemenu => {
            cy.get(sidemenu).trigger('mouseover')
            cy.get(sideMenuExpand)
                .should('be.visible')
            cy.get(swapIcon).click()
            cy.get(dashboardIcon).click().within(dashAssert => {
                cy.contains('Dashboard').should('be.visible')
            })
        })
    })

    /********************** Assert the legacy site button redirect to legacy site  ************/
    it('TC-05, Verify that Return to lagacy site button redirects the user to the "Legacy site" page', () => {

        pangolinUsefulLinks(returnToLegacyBtn, `${legUrl}`, pangolinLinksArr[3])
    })

    /*****************************  Assert and click on languages  ****************************/
    it('TC-18, Verify that the user can change the language', () => {
        for (var i = 1; i < noOfLanguages + 1; i++) {
            cy.get(languageBtn).click()
            cy.get(`${languageDropdown}:nth-child(${i})`).click();
            cy.get(returnToLegacyBtn).scrollIntoView()
                .should('contain', languagesArray[i - 1])
        }
    })

    /***************************  Change the website background to Light mode  *******************/
    it('TC-19, Verify that the user can change the theme to light mode', () => {
        cy.get(lightMood)
            .invoke('attr', 'alt')
            .should('contain', 'Setting')
        cy.get(lightMood).click()
        cy.get(darkMood)
            .invoke('attr', 'alt')
            .should('contain', 'NightMode')
    })

    /************************  Change the website background to Dark mode  *****************/
    it('TC-20, Verify that the user can change the theme to dark mode', () => {
        cy.get(lightMood).click()
        cy.get(darkMood).click()
        cy.get(lightMood)
            .invoke('attr', 'alt')
            .should('contain', 'Setting')
    })

    /******************** Adding token to watchlist by specific search  *********************/
    it('TC-24, Verify that the user can search for a specific token to add to the watchlist', () => {
        cy.contains(/Dashboard/)
        cy.get(watchListBtn).
            should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type(tokenName)
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", tokenName)
    })

    /********************** Adding token to watchlist through the Add button *****************/
    it("TC-25, Verify that the user can add the token to the watchlist", () => {
        cy.contains(/Dashboard/)
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", AvaxToken)
    })

    /********************** Switching between the tokens in the watchlist ****************/
    it('TC-27, Verify that the user is able to switch between the tokens in watchlist', () => {
        cy.contains(/Dashboard/i)
        for (var i = 1; i <= 3; i++) {
            cy.get(`${switchToken}:nth-child(${i})`).click()
            cy.get(watchListTokenAssert)
                .should('contain', switchArray[i - 1])
        }
    })

    /************** Updating and asserting the chart by pressing the time buttons ********/
    chartTimeArray.forEach(time => {
        it(`TC-28,29,30,31,32,33, Verify that the chart is updated by pressing ${time} in watchlist`, () => {
            cy.get(watchlistTimeBtn)
                .should('have.attr', 'color', 'text1')
                .contains(time).click()
            cy.get(watchlistTimeBtn)
                .contains(time)
                .should('have.attr', 'color', 'mustardYellow')
                .and('have.class', 'sc-gsnTZi gPFlPI')
        })
    })

    /**********************  Removing the token if already added  *********************/    
    it('TC-26, Verify that the user can remove the token from the watchlist', () => {
        cy.contains(/Dashboard/)
        cy.get(tokenSection).then($avax => {
            if ($avax.text().includes(AvaxToken)) {
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
                    .should("contain", tokenName)
                cy.get(tokenAssert).eq(1).trigger("mouseover")
                cy.get(crossBtn).click()
            }
        })
    })

    /********************* Clicking the link button on the watchlist  **********************/
    it('TC-34, Verify that Link button redirects the user to the info.exchange page', () => {
        pangolinUsefulLinks(`${linkBtn}`, `${linkUrl}`, pangolinLinksArr[0])
    })

    it('TC-35, Verify that the user can make a trade from the Dashboard', () => {
        pangolinUsefulLinks(`${watchlistTradeBtn}`, `${swap}`, pangolinLinksArr[3])
    })

    /************************* Clicking the trade button on the watchlist  ******************/    
    it('TC-36, Verify that the user is able to switch between different news in News section', function () {
        cy.get(newsBtn).then(news => {
            expect(news).to.be.visible
            cy.get(newsBody).eq(1).then(newsAssert => {
                expect(newsAssert)
                    .to.contain("🪂 For those eligible, there are two weeks left to claim your $PSB airdrop. ")
            })
            cy.get(news).find(newsNextBtn).click()
            cy.get(newsBody).eq(2).then(newsAssert => {
                expect(newsAssert)
                    .to.contain(bridgeSwap)
            })
            cy.get(news).find(newsPreBtn).click({force: true})
            cy.get(newsBody).then(newsAssert => {
                expect(newsAssert)
                    .to.contain("🪂 For those eligible, there are two weeks left to claim your $PSB airdrop. ")
            })
        })
    })

    /************ Assert after mouseing over on chart, shows value in USD ******************/   
    it('TC-37,38,39,40,41 Verify that the user can see the all time token value in USD', function () {
        cy.get(watchlistGraphLine).then(chart => {
            cy.get(chart).eq(0).trigger('mouseover')
            cy.wait(500)
            cy.get(chart).find(graphUSD).then(usdChart => {
                expect(usdChart).to.contain(usd)
                expect(usdChart).to.have.text(usd)
                assert.deepEqual('USD', usd)
            })
        })
    })

    /**************** Click and Assert the links in the News section ***************************/  
    it(`TC-42, Verify that the Details here in the news section bridge Swap redirects the user to the "Pangolin Exchange" page`, () => {
        // newsLinks(0, 0, 'Details here', 'AIRDROP ALERT')
        for(let i =0; i < 10; i++) {
            cy.get(newsBtn).find(newsNextBtn).click({force: true})
            cy.get("div[class='slick-slide slick-active slick-current'] p a").each(page => {
                cy.request(page.prop('href')).as('link');
            });
            cy.get('@link').should(response => {
                expect(response.status).to.eq(200);
            });
        }
    })

    /****************** Click and assert the footer links [privacy, cookies]********************/  
    footerLinks.forEach(footerLink => {
        it(`TC-43, 44, 45 Verify that the "${footerLink}" link on the footer opens the "${footerLink}" page`, () => {
            cy.get(footerlinksSel)
                .contains(footerLink).click()
            cy.get(footerLinkBanner)
                .should('be.visible').within(linksBanner => {
                    cy.get('strong').contains(footerLink)
                        .should('be.visible')
                    cy.get(linksBanner).find(footerLinkCloseBtn).click()
                })
        })
    })

    /**************** Click and assert the social media links in the side menu ****************/ 
    for (let i = 0; i <= 6; i++) {
        it(`TC-46, 47, 48, 49, 50, 51, 52, Verify that the user is redirected to the pangolin ${socialLinksContents[i]} page`, () => {
            socialLinks(i, socialLinksArray[i])
        })
    }

    /***********************  Connect to wallet button  ***************************/
    it('TC-55,56, 57, 58, 59, 60, Verify that the user can see the "Connect to a Wallet" button if the wallet is not connected', () => {
        cy.get(PNGBtn).contains("PNG").click()
        cy.get(PNGValue).should("not.exist")
        cy.get(addPNG).contains("Add PNG to MetaMask").should("not.exist")
        cy.get(PNGLogo).should("not.exist")
        cy.get(connectWallet)
            .should('contain', connectToWallet)
        cy.get(connectWalletMsg)
            .should(chainText => {
                expect(chainText).to.have.text(connectToWalletMsg)
            })
    })

    /******************************* Hide/Unhide balance **********************************/
    it('TC-61,62, Verify that the user cannot hide the balance if the wallet is not connected', () => {
        cy.get(showBalanceBtn).contains(hideBalance).click()
        cy.get(connectWalletMsg).should("contain", connectToWalletMsg)
        cy.get(hideBalanceBtn).contains(showBalance).click()
        cy.get(connectWalletMsg).should("contain", connectToWalletMsg)
    })

    /********************************  search for relevant result  *************************/
    it('TC-63, Verify that the relevant tokens appear when the user type in the "Search" field',() =>{
        cy.contains(/Dashboard/)
        cy.get(watchListBtn).
            should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type('p')
        cy.get(tokensList).each( relSearch => {
        cy.wrap(relSearch).should('contain','p')
        })
    })

    /**************************   if token is not found   *********************************/    
    it('TC-64, Verify that the message "Not found" appears when no searches found', () =>{
        cy.contains(/Dashboard/)
            cy.get(watchListBtn).
                should('be.visible').click()
            cy.get(watchlistDropDown)
                .should('be.visible')
            cy.get(tokenSearch).type("asdfg")
            cy.contains('Not found')
    })

    /*******************  button disable in the watchlist dropdown *************************/ 
    it('TC-65, Verify that the token added to the watchlist is disabled in the dropdown', () =>{
        cy.contains(/Dashboard/)
            cy.get(watchListBtn).
                should('be.visible').click()
            cy.get(watchlistDropDown)
                .should('be.visible')
            cy.get(tokenSearch).type(AvaxToken)
            cy.get(tokenSelect).eq(0).click()
            cy.get(tokenAssert)
                .should("contain", AvaxToken)
            cy.get(watchListBtn).
                should('be.visible').click()
            cy.get(disabledTokens).should('have.attr', 'disabled', 'disabled')
            
    })

    /********************  Token enable in the watchlist dropdown ***********************/ 
    it('TC-66, Verify that the token removed from the watchlist is enabled in the dropdown', () =>{
        cy.contains(/Dashboard/)
            cy.get(watchListBtn).
                should('be.visible').click()
            cy.get(watchlistDropDown)
                .should('be.visible')
            cy.get(tokenSearch).type(AvaxToken)
            cy.get(tokenSelect).eq(0).click({force:true})
            cy.get(tokenAssert)
                .should("contain", AvaxToken)
            cy.get(tokenMouseOverEnable).eq(0)
                .trigger("mouseover")
            cy.get(crossBtn).click()
            cy.get(watchListBtn).
                should('be.visible').click()
            cy.get(tokensList).contains(AvaxToken).should('be.visible')
    })

    /********************  Trade on the selected token *********************************/ 
    it('TC-67, Verify that the user can trade on the selected token from the watchlist', () =>{
        cy.contains(/Dashboard/)
            cy.get(watchListBtn).
                should('be.visible').click()
            cy.get(watchlistDropDown)
                .should('be.visible')
            cy.get(tokenSearch).type(tokenName)
            cy.get(tokenSelect).eq(0).click()
            cy.get(tokenAssert)
                .should("contain", tokenName)
            pangolinUsefulLinks(`${watchlistTradeBtn}`, `${swap}`, pangolinLinksArr[3])
            switchingValues(1, 'From', `${tokenName}`)
    })


})

