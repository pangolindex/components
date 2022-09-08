/// <reference types = "Cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data'
import {newsLinks} from '../support/src/dashboard'
describe('Dashboard', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })
    const {returnToLegacyBtn, languageBtn, lightMood, darkMood, noOfLanguages, watchListBtn, watchlistDropDown, tokenSearch, tokenSelect, tokenAssert, tokenMouseOver, crossBtn, switchToken,tokenSection, watchListTokenAssert, languageDropdown, watchlistTimeBtn, watchlistLinkBtn, watchlistTradeBtn,newsBtn, newsBody, newsNextBtn, newsPreBtn, watchlistGraphLine, graphUSD} = selectors.dashboard
    const {returnToLegacy, languagesArray, tokenName, AvaxToken, switchArray, newsLinkArray, newsLinkAssertArray, chartTimeArray} = data.dashboard
    const legUrl = "https://legacy.pangolin.exchange/#/"
    beforeEach('',() => {
        cy.visit('/dashboard')
    })

    it('Verify that Return to lagacy site button redirects the user to the "Legacy site" page', () => {
        cy.get(returnToLegacyBtn)
            .should('contain', returnToLegacy)
            .invoke('removeAttr', 'target').click()
        cy.url().should('include', legUrl)
    })

    it('Verify that the user can change the language', () => {
        for(var i=1; i < noOfLanguages+1; i++){
            cy.get(languageBtn).click()
            cy.get(`${languageDropdown}:nth-child(${i})`).click();
            cy.get(returnToLegacyBtn).scrollIntoView()
                .should('contain', languagesArray[i-1])
        }
    })

    it('Verify that the user can change the theme to light mode', () => {
        cy.get(lightMood)
            .invoke('attr', 'alt')
            .should('contain', 'Setting')
        cy.get(lightMood).click()
        cy.get(darkMood)
            .invoke('attr', 'alt')
            .should('contain', 'NightMode')
    })

    it('Verify that the user can change the theme to dark mode', () => {
        cy.get(lightMood).click()
        cy.get(darkMood).click()
        cy.get(lightMood)
            .invoke('attr', 'alt')
            .should('contain', 'Setting')
    })

    it('Verify that the user can search for a specific token to add to the watchlist', () => {
        cy.contains(/Dashboard/)
        cy.get(watchListBtn).
            should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSearch).type(tokenName)
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain",tokenName)
    })

    it("Verify that the user can add the token to the watchlist", () => {
        cy.contains(/Dashboard/)
        cy.get(watchListBtn)
            .should('be.visible').click()
        cy.get(watchlistDropDown)
            .should('be.visible')
        cy.get(tokenSelect).eq(0).click()
        cy.get(tokenAssert)
            .should("contain", AvaxToken)
    })

    it('verify that the user is able to switch between the tokens in watchlist', () => {
        cy.contains(/Dashboard/i)
        for (var i =1; i < 3; i++) {
            cy.get(`${switchToken}:nth-child(${i})`).click()
            cy.get(watchListTokenAssert)
                .should('contain',switchArray[i-1])
        }
    })

    chartTimeArray.forEach( time => {
    it(`Verify that the chart is updated by pressing ${time} in watchlist`, () => {
        cy.get(watchlistTimeBtn)
            .should('have.attr', 'color', 'text1')
                .contains(time).click()
        cy.get(watchlistTimeBtn)
            .contains(time)
            .should('have.attr', 'color', 'mustardYellow')
            .should('have.class','sc-gsnTZi gPFlPI')
    })
})

    it('Verify that the user can remove the token from the watchlist', () => {
        cy.contains(/Dashboard/)
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

    it('Verify that Link button redirects the user to the info.exchange page', () => {
        let linkUrl = "https://info.pangolin.exchange/#/token/0x60781C2586D68229fde47564546784ab3fACA982"
        cy.get(watchlistLinkBtn)
            .invoke("removeAttr","target").click()
        cy.url().should("include", linkUrl)
        cy.contains(/pangolin/i)
            .should("be.visible")
    })

    it('Verify that the user can make a trade from the Dashboard', () => {
        let swap = "https://dev.pangolin.exchange/#/swap"
        cy.get(watchlistTradeBtn)
            .contains(/trade/i).click()
        cy.url()
            .should("include", swap)
        cy.contains(/24H Change/i)
            .should("be.visible")
    })

    it('Verify that the user is able to switch between different news in News section', function() {
        cy.get(newsBtn).then(news => {
            expect(news).to.be.visible
            cy.get(newsBody).then(newsAssert => {
                expect(newsAssert).to.contain("We've rolled out a new Twitter ")
            })
            
            cy.get(news).find(newsNextBtn).click()
            cy.get(newsBody).then(newsAssert => {
                expect(newsAssert).to.contain("Q2 2022 was volatile.")
            })
            cy.get(news).find(newsPreBtn).click()
            cy.get(newsBody).then(newsAssert => {
                expect(newsAssert).to.contain("We've rolled out a new Twitter ")
            })
        })
    })
    it('Verify that the user can see the all time token value in USD', function() {
        cy.get(watchlistGraphLine).then( chart => {
            cy.get(chart).trigger('mouseover')
            cy.wait(500)
            cy.get(chart).find(graphUSD).then( usdChart => {
                expect(usdChart).to.contain('USD')
                expect(usdChart).to.have.text('USD')
                assert.deepEqual('USD', 'USD')
            })
        })
    })
    
    it('Verify that the "Pangolin_Flare link" in the news section redirects the user to the "Pangolin Exchange" page', () => {
            cy.get(newsBody).then(newsAssert => {
                expect(newsAssert).to.contain("We've rolled out a new Twitter ")
                cy.get(newsAssert).contains('@Pangolin_Flare').invoke('removeAttr', 'target').click()
                cy.wait(2000)
                cy.contains(/Pangolin_Flare /i).should('be.visible')
        })
    })

    it(`Verify that the ${newsLinkAssertArray[0]} in the "Read the 2H 2022 Roadmap" in news section redirects the user to the "Pangolin Exchange" page`, () => {
        newsLinks(0,1,newsLinkAssertArray[0], newsLinkArray[0])
    })
    it(`Verify that the ${newsLinkAssertArray[1]} link in the "songBirdLink" in news section redirects the user to the "Pangolin Exchange" page`, () => {
        newsLinks(0,2,newsLinkAssertArray[1], newsLinkArray[1])
    })
    it(`Verify that the "${newsLinkAssertArray[1]}" link in the air drop in news section redirects the user to the "Pangolin Exchange" page`, () => {
    
        newsLinks(0, 3, newsLinkAssertArray[1], newsLinkArray[2])
    })
    it(`Verify that the ${newsLinkAssertArray[2]} link in the "limit orders" in the news section redirects the user to the "Pangolin Exchange" page`, () => {

        newsLinks(0, 4, newsLinkAssertArray[2], newsLinkArray[3])
    })
    it(`Verify that the ${newsLinkAssertArray[2]} link in the moonpay in news section redirects the user to the "dashboard" page`, () => {
        newsLinks(0, 5, newsLinkAssertArray[2], newsLinkArray[4])
    })
    it(`Verify that the ${newsLinkAssertArray[3]} link in the moonpay in news section redirects the user to the "dashboard" page`, () => {

        newsLinks(0, 5, newsLinkAssertArray[3], newsLinkArray[5])
    })
    it(`Verify that the ${newsLinkAssertArray[4]} link in the news section redirects the user to the "Multi-chain desk" page`, () => {
        newsLinks(0, 6, newsLinkAssertArray[4], newsLinkArray[6])
    })
})