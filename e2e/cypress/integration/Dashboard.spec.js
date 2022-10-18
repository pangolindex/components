/// <reference types = "Cypress"/>
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data'
import {newsLinks, socialLinks} from '../support/src/dashboard'

describe('Dashboard', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })
    const {returnToLegacyBtn, languageBtn, lightMood, darkMood, noOfLanguages, watchListBtn, watchlistDropDown, tokenSearch, tokenSelect, tokenAssert, tokenMouseOver, crossBtn, switchToken,tokenSection, watchListTokenAssert, languageDropdown, watchlistTimeBtn, watchlistLinkBtn, watchlistTradeBtn,newsBtn, newsBody, newsNextBtn, newsPreBtn, watchlistGraphLine, graphUSD, sideMenuCollapse, sideMenuExpand, footerlinksSel, footerLinkBanner, footerLinkCloseBtn, pngButton, pngModal, pngPriceSel} = selectors.dashboard
    const {returnToLegacy, languagesArray, tokenName, AvaxToken, switchArray, newsLinkArray, newsLinkAssertArray, chartTimeArray, socialLinksArray, socialLinksContents, footerLinks, newsSongBird, usd, coinBase,bridgeSwap} = data.dashboard
    const legUrl = "https://legacy.pangolin.exchange/#/"
    beforeEach('',() => {
        cy.visit('/dashboard')
    })

    it('TC-01, Verify that the side menu is expanded while hovering the pointer over it', () => {
        cy.get(sideMenuCollapse).should(visible => {
            expect(visible).to.be.visible
        }).then(sidemenu => {
            cy.get(sidemenu).trigger('mouseover')
            cy.get(sideMenuExpand)
                .should('be.visible')
        })
    })
    it('TC-03, Verify that the Dashboard page can be accessed from the side menu', () => {
        cy.get(sideMenuCollapse).should(visible => {
            expect(visible).to.be.visible
        }).then(sidemenu => {
            cy.get(sidemenu).trigger('mouseover')
            cy.get(sideMenuExpand)
                .should('be.visible')
            cy.get('a[id="swap"]').click()
            cy.get('a[id="dashboard"]').click().within( dashAssert => {
                cy.contains('Dashboard').should('be.visible')
            })
        })
    })
    it('TC-05, Verify that Return to lagacy site button redirects the user to the "Legacy site" page', () => {
        cy.get(returnToLegacyBtn)
            .should('contain', returnToLegacy)
            .invoke('removeAttr', 'target').click()
        cy.url().should('include', legUrl)
    })

    it('TC-18, Verify that the user can change the language', () => {
        for(var i=1; i < noOfLanguages+1; i++){
            cy.get(languageBtn).click()
            cy.get(`${languageDropdown}:nth-child(${i})`).click();
            cy.get(returnToLegacyBtn).scrollIntoView()
                .should('contain', languagesArray[i-1])
        }
    })

    it('TC-19, Verify that the user can change the theme to light mode', () => {
        cy.get(lightMood)
            .invoke('attr', 'alt')
            .should('contain', 'Setting')
        cy.get(lightMood).click()
        cy.get(darkMood)
            .invoke('attr', 'alt')
            .should('contain', 'NightMode')
    })

    it('TC-20, Verify that the user can change the theme to dark mode', () => {
        cy.get(lightMood).click()
        cy.get(darkMood).click()
        cy.get(lightMood)
            .invoke('attr', 'alt')
            .should('contain', 'Setting')
    })

    it('TC-24, Verify that the user can search for a specific token to add to the watchlist', () => {
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

    it('TC-27, Verify that the user is able to switch between the tokens in watchlist', () => {
        cy.contains(/Dashboard/i)
        for (var i =1; i <= 3; i++) {
            cy.get(`${switchToken}:nth-child(${i})`).click()
            cy.get(watchListTokenAssert)
                .should('contain',switchArray[i-1])
        }
    })

    chartTimeArray.forEach( time => {
    it(`TC-28,29,30,31,32,33, Verify that the chart is updated by pressing ${time} in watchlist`, () => {
        cy.get(watchlistTimeBtn)
            .should('have.attr', 'color', 'text1')
                .contains(time).click()
        cy.get(watchlistTimeBtn)
            .contains(time)
            .should('have.attr', 'color', 'mustardYellow')
            .and('have.class','sc-gsnTZi gPFlPI')
    })
})

    it('TC-26, Verify that the user can remove the token from the watchlist', () => {
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
                cy.get(tokenAssert).eq(1).trigger("mouseover")
                cy.get(crossBtn).click()
            }
        })  
    })

    it('TC-34, Verify that Link button redirects the user to the info.exchange page', () => {
        let linkUrl = "https://info.pangolin.exchange/#/token/0x60781C2586D68229fde47564546784ab3fACA982"
        cy.get(watchlistLinkBtn)
            .invoke("removeAttr","target").click()
        cy.url().should("include", linkUrl)
        cy.contains(/pangolin/i)
            .should("be.visible")
    })

    it('TC-35, Verify that the user can make a trade from the Dashboard', () => {
        let swap = "https://dev.pangolin.exchange/#/swap"
        cy.get(watchlistTradeBtn)
            .contains(/trade/i).click()
        cy.url()
            .should("include", swap)
        cy.contains(/24H Change/i)
            .should("be.visible")
    })

    it('TC-36, Verify that the user is able to switch between different news in News section', function() {
        cy.get(newsBtn).then(news => {
            expect(news).to.be.visible
            cy.get(newsBody).then(newsAssert => {
                expect(newsAssert)
                    .to.contain(bridgeSwap)
            })
            
            cy.get(news).find(newsNextBtn).click()
            cy.get(newsBody).then(newsAssert => {
                expect(newsAssert)
                    .to.contain(coinBase)
            })
            cy.get(news).find(newsPreBtn).click()
            cy.get(newsBody).then(newsAssert => {
                expect(newsAssert)
                    .to.contain(bridgeSwap)
            })
        })
    })

    it('TC-37,38,39,40,41 Verify that the user can see the all time token value in USD', function() {
        cy.get(watchlistGraphLine).then( chart => {
            cy.get(chart).eq(0).trigger('mouseover')
            cy.wait(500)
            cy.get(chart).find(graphUSD).then( usdChart => {
                expect(usdChart).to.contain(usd)
                expect(usdChart).to.have.text(usd)
                assert.deepEqual('USD', usd)
            })
        })
    })

    it(`TC-42, Verify that the ${newsLinkArray[3]} in the news section redirects the user to the "Pangolin Exchange" page`, () => {
        newsLinks(0,0,newsLinkArray[3], newsLinkAssertArray[7])
    })

    it(`TC-42, Verify that the ${newsLinkArray[0]} in the "pangolin flare" in news section redirects the user to the "Pangolin Exchange" page`, () => {
        newsLinks(0,1,newsLinkArray[0], newsLinkAssertArray[1])
    })
    it(`TC-42, Verify that the ${newsLinkArray[1]} in the "pangolin flare" in news section redirects the user to the "Pangolin Exchange" page`, () => {
        newsLinks(0,2,newsLinkArray[1], newsLinkAssertArray[1])
    })

    it(`TC-42, Verify that the ${newsLinkArray[2]} in the "Read the 2H 2022 Roadmap" in news section redirects the user to the "Pangolin Exchange" page`, () => {
        newsLinks(0,3,newsLinkArray[2], newsLinkAssertArray[2])
    })
    ///// in progress
    it(`TC-42, Verify that the "${newsLinkArray[3]}" link in the air drop songbird in news section redirects the user to the "Pangolin Exchange" page`, () => {
    
        newsLinks(0, 4, newsLinkArray[3], newsLinkAssertArray[3])
    })
    /// in progress
    it.only(`TC-42, Verify that the "${newsLinkArray[3]}" link in the air drop WagmiPng in news section redirects the user to the "Pangolin Exchange" page`, () => {
    
        newsLinks(0, 5, newsLinkArray[3],  newsLinkAssertArray[4])
    })

    it.only(`TC-42, Verify that the ${newsLinkArray[4]} link in the "limit orders" in the news section redirects the user to the "Pangolin Exchange" page`, () => {

        newsLinks(0, 6, newsLinkArray[4],  newsLinkAssertArray[6])
    })

    it(`TC-42, Verify that the ${newsLinkArray[4]} link in the moonpay in news section redirects the user to the "dashboard" page`, () => {
        newsLinks(0, 7, newsLinkArray[4], newsLinkAssertArray[7])
    })

    it(`TC-42, Verify that the ${newsLinkArray[5]} link in the moonpay in news section redirects the user to the "dashboard" page`, () => {

        newsLinks(0, 7, newsLinkArray[5], newsLinkAssertArray[8])
    })

    it(`TC-42, Verify that the ${newsLinkArray[6]} link in the news section redirects the user to the "Multi-chain desk" page`, () => {
        newsLinks(0, 8, newsLinkArray[6],  newsLinkAssertArray[9])
    })

    footerLinks.forEach( footerLink => {
    it(`TC-44, 45, 46 Verify that the "${footerLink}" link on the footer opens the "${footerLink}" page`, () => {
        cy.get(footerlinksSel)
            .contains(footerLink).click()
        cy.get(footerLinkBanner)
            .should('be.visible').within( linksBanner => {
            cy.get('strong').contains(footerLink)
                .should('be.visible')
            cy.get(linksBanner).find(footerLinkCloseBtn).click()
        })
    })
})

    for (let i = 0; i <= 6; i++) {
    it(`TC-47, 48, 49, 50, 51, 52, 53, Verify that the user is redirected to the pangolin ${socialLinksContents[i]} page`, () => {
        socialLinks(i, socialLinksArray[i])
    })
}

    it('TC-54, Verify that the user cannot see the PNG value if the wallet is not connected', () => {
        cy.get(pngButton).contains(/png/i).click()
        cy.wait(3000)
        cy.get(pngModal).within( modal => {
            expect(modal).to.be.visible
            cy.contains(/Your png breakdown/i)
                .should( pngText => {
                    expect(pngText).to.be.visible
            })
            cy.get(pngPriceSel).then( png => {
                cy.get(png).find('div').eq(1).then(pngPrice => {
                    expect(pngPrice).to.contain("PNG price:")
                })
                cy.get(png).find('div').eq(2).then(pngValue => {
                    expect(pngValue).to.contain('$-')
                })
            })
        })
    })
    it('TC-57, 58, 59, 60, 61, 62, Verify that the user can see the "Connect to a Wallet" button if the wallet is not connected', () => {
        cy.get('div[id="connect-wallet"]')
            .should('contain', "Connect to a wallet") 
        cy.get('div[class="sc-jSMfEi hMQPrK"]')
            .should( chainText => {
                expect(chainText).to.have.text('Connect a wallet to see your Portfolio')
        })
    })
})
