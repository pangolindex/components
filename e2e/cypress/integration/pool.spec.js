/// <reference types = "cypress"/>
import 'cypress-wait-until'
import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data.json'

const {poolsSideMenu, poolsSideMenuSelect, searchFieldPool, cardTitleSuper, cardTitleAllFarm, cardBody, cardtvlApr, cardTvl, tvlAprValues, rewardsInLogos, seeDetailsBtn, detailsTitle, detailsLinks, detailsCrossBtn, superFarmTitle, addLiqBtn, superFarm, seeDetailsBlock, totalStakeBlock, totalStakeTitle, titleValues, yourPools, yourPoolsMsge, createPairBtn, createPairDropdown, createPairToken, createPairMsge, addLiqField, addLiqConnectWalletBtn, addLiqCrossBtn, noFarmsMsge, AllfarmsMaxBtn, AllfarmsMaxfield, AllfarmsFarmBtn, AllfarmsConnectBtn, AllfarmsStepper, PGLField, dollarWorth, weeklyIncome, yourFarms, manageListsTitle, tokenLists, dropdownArrow, removeList, viewList, toggleTokenList, tokenListSearch, addBtn, addBtnEnabled, testnetTokenlist, removeListEnabled} = selectors.pools
const {yourPoolsMessage, createPair, testnet} = data.pools
const {connectToWallet} = data.dashboard
const {connectWalletTxt} = data.swap
let superFarmRewards = ["PNG logo", 'XETA logo', 'ncash logo', 'LOST logo', 'KTE logo']
describe('Pools', () => {
    
    beforeEach('',() => {
        cy.visit('/')
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        }) 
        // const app = window.top;
        // if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
        // const style = app.document.createElement('style');
        // style.innerHTML =
        //     '.command-name-request, .command-name-xhr { display: none }';
        // style.setAttribute('data-hide-command-log-request', '');

        // app.document.head.appendChild(style);
        // }
        cy.get('#pool').click()
    })

    /******************* Selecting pool from side menu **************************/
    it('TC-01, Verify that the pool and farm page can be accessed from the side menu', () => {
        cy.get(poolsSideMenu)
            .should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(poolsSideMenuSelect)
            .should("have.class","ACTIVE")
    })

    /******************* Assertions on Searching Tocken **************************/
    it('TC-2,3,4,5, Verify that the user is able to search a pair by the token names', () => {
        cy.waitUntil(() => cy.get(searchFieldPool).type("PNG"))
        cy.wait(5000)
        cy.get(cardTitleSuper).each($titlePng => {
            cy.get($titlePng).should("contain","PNG")
        })
        cy.get(searchFieldPool).clear()
        cy.get(searchFieldPool).should("have.attr", "placeholder", "Token Name")
        cy.get(searchFieldPool).type("Search")
        cy.get(noFarmsMsge).contains("No farms found.").should("be.visible")
        cy.get(searchFieldPool).clear()

    })

    /******************* Assertions on Super farm page **************************/
    it('TC-43,44,45, Verify that the user is able to see all the super farms when clicking on the "Super Farms" Label', () => {
        cy.wait(5000)
        cy.get(superFarm).click()
        cy.get(cardTitleAllFarm).each( $titleSuperfarm => {
            cy.get($titleSuperfarm).scrollIntoView().should("be.visible")
            cy.get($titleSuperfarm).find(cardBody).within( $tvlApr => {
                cy.get($tvlApr).find(cardtvlApr).eq(0).within($tvl => {
                    cy.wrap($tvl).find(cardTvl).should('contain', 'TVL')
                    cy.wrap($tvl).find(tvlAprValues).then($tvlValue => {
                        cy.contains($tvlValue[0].children[0].innerText).should('be.visible')
                        })
                    })
                    cy.wait(5000)
                    cy.get($tvlApr).find(cardtvlApr).eq(1).within($apr => {
                        cy.wrap($apr).find(cardTvl).should('contain', 'APR')
                        cy.wrap($apr).find(tvlAprValues).then($aprValue => {
                        cy.contains($aprValue[0].children[0].innerText).should('be.visible')
                        })
                    })
                })
                cy.get($titleSuperfarm).find(superFarmTitle).should('contain', 'Super farm')
                cy.get($titleSuperfarm).find (rewardsInLogos).
                each($superRewardsLogos => {
                    superFarmRewards.forEach( tokenAttr => {
                        if($superRewardsLogos[0].alt === tokenAttr){
                        cy.get($superRewardsLogos).should('have.attr', 'alt', tokenAttr) 
                        }
                    })
                })
            })
        })

    /******************* Assertions on the pools page **************************/
    it('TC-46, Verify that the user is able to see all the farms when clicking on the "All Farms" Label', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).scrollIntoView().should("be.visible")
        })
    })    
    
    /******************* Assertions on TVL APR Rewards **************************/
    it('TC-47, Verify that the user is able to see the "TVL", "APR" and "Rewards in" on the card', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(cardBody).within( $tvlApr => {
                cy.get($tvlApr).find(cardtvlApr).eq(0).within($tvl => {
                    cy.wrap($tvl).find(cardTvl).should('contain', 'TVL')
                    cy.wrap($tvl).find(tvlAprValues).then($tvlValue => {
                        cy.contains($tvlValue[0].children[0].innerText).scrollIntoView().should('be.visible')
                    })
                })
                cy.wait(1000)
                cy.get($tvlApr).find(cardtvlApr).eq(1).within($apr => {
                    cy.wrap($apr).find(cardTvl).should('contain', 'APR')
                    cy.wrap($apr).find(tvlAprValues).then($aprValue => {
                        cy.waitUntil(() => cy.contains($aprValue[0].children[0].innerText).should('be.visible'))
                    })
                })
            })
        })
        
    })

    /******************* Assertions on Rewards in logo **************************/
    it('TC-48, Verify that the native token appears under the title "Rewards in"', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find (rewardsInLogos).
            each( $rewardsLogos => {
                superFarmRewards.forEach( tokenAttr => {
                    if($rewardsLogos[0].alt === tokenAttr){
                        cy.get($rewardsLogos).should('have.attr', 'alt', tokenAttr) 
                    }
                })
            })
        })

    })

    /******************* Assertions on Details **************************/
    it('TC-64, Verify that the user is able to see the details of the pair', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.get(detailsCrossBtn).eq(3).click()
        })
    })
    
    /**************** Assertions on Total Stake And Underlying Tokens *********************/
    it('TC-65, Verify that the user can see the values of the "Total Stake", "Underlying first token" and "Underlying second token" under the titles', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.wait(5000)
            
            cy.get(seeDetailsBlock).find(totalStakeBlock).eq(1).within($totalStake => {
                cy.wrap($totalStake).find(totalStakeTitle).should('contain', 'Total Stake')
                cy.wrap($totalStake).find(titleValues).then($totalStakeVal => {
                    cy.waitUntil(() => cy.contains($totalStakeVal[0].innerText).should('be.visible'))
                })
            })

            cy.get(seeDetailsBlock).find(totalStakeBlock).eq(1).within($underlyingFirst => {
                cy.wrap($underlyingFirst).find(totalStakeTitle).then($underlying => {
                    cy.contains($underlying[1].innerText).should("be.visible")
                })
                cy.wrap($underlyingFirst).find(titleValues).then($underlyingFirstVal => {
                    console.log($underlyingFirstVal)
                    cy.waitUntil(() => cy.contains($underlyingFirstVal[1].innerText).should('be.visible'))
                })
            })

            cy.get(seeDetailsBlock).find(totalStakeBlock).eq(1).within($underlyingSec => {
                cy.wrap($underlyingSec).find(totalStakeTitle).then($underlying => {
                    cy.contains($underlying[2].innerText).should("be.visible")
                })
                cy.wrap($underlyingSec).find(titleValues).then($underlyingSecVal => {
                    console.log($underlyingSecVal)
                    cy.waitUntil(() => cy.contains($underlyingSecVal[2].innerText).should('be.visible'))
                })
            })
            cy.get(detailsCrossBtn).eq(3).click()
        })
        
    })

    /******************* Assertions on the links **************************/
    it('TC-66, Verify that the user is redirected to the particular token site', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.wait(10000)
                cy.waitUntil(() => cy.get(detailsLinks).each(page => {
                cy.request(page.prop('href')).as('link');
            }));
            cy.get('@link').should(response => {
                expect(response.status).to.eq(200);
            })
            cy.get(detailsCrossBtn).eq(3).click()
        })        
    })
    
    /******************* Assertions on the Your pools page **************************/
    it('TC-205, Verify that the user cannot see the pools in the Your Pools section if the wallet is not connected', () => {
        cy.wait(5000)
        cy.get(yourPools).contains("Your Pools").click({force:true})
        cy.get(yourPoolsMsge).contains(yourPoolsMessage).should("be.visible")
    })

    /******************* Assertions on Create card **************************/
    it('TC-206,207, Verify that the user cannot create a pair if the wallet is not connected', () => {
        cy.wait(5000)
        cy.get(createPairBtn).contains(createPair).click({force:true})
        cy.get(createPairDropdown).eq(0).click()
        cy.get(createPairToken).contains("aaBLOCK").click({force:true})
        cy.get(createPairDropdown).eq(1).click()
        cy.get(createPairToken).contains("AVAX").click({force:true})
        cy.get(createPairMsge).should("contain", connectToWallet)
    })

    /******************* Assertions on Your Farms **************************/
    it('TC-208, Verify that the user cannot see the "Your Farms" section if the wallet is not connected', () => {
        cy.get(yourFarms).contains("Your Farms")
            .should('not.exist')
    })

    /******************* Assertions on Add Liquidity **************************/
    it('TC-209, Verify that the user is not able to add the liquidity from the details  section if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.get(addLiqField).eq(3).type('12')
            cy.get(addLiqConnectWalletBtn).should("contain",connectWalletTxt)
            cy.get(detailsCrossBtn).eq(3).click()
        }) 
    })

    /******************* Assertions on the Adding Liquidity **************************/
    it('TC-210, Verify that the user is not able to add the liquidity from the "All Farms" section if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(addLiqBtn).click()
            cy.get(addLiqConnectWalletBtn).should("contain",connectWalletTxt)
            cy.get(addLiqCrossBtn).click()
        })
    })
    
    /************************Assertions on the Max button */
    it('TC-211, Verify that the "Max" button cannot populate the field with the maximum amount of the token if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(addLiqBtn).click()
            cy.get(AllfarmsMaxBtn).eq(0).click()
            cy.get(AllfarmsMaxfield).eq(0).should("have.attr", "placeholder", "0.00")
            cy.get(addLiqCrossBtn).click()
        })
    })

    /******************* Assertions on Dollar worth **************************/
    it('TC-212, Verify that the "Dollar Worth" does not populate according to the stepper if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.get(AllfarmsFarmBtn).eq(1).click({force:true})
            cy.get(AllfarmsStepper).eq(1).click({force:true})
            cy.get(dollarWorth).eq(1).should("contain","-")
            cy.get(detailsCrossBtn).eq(3).click()
            
        }) 
    })

    /******************* Assertions on Weekly income **************************/
    it('TC-213, Verify that the "Weekly Income" does not populate according to the stepper if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.get(AllfarmsFarmBtn).eq(1).click({force:true})
            cy.get(AllfarmsStepper).eq(1).click({force:true})
            cy.get(weeklyIncome).eq(3).should("contain","0 PNG")
            cy.get(detailsCrossBtn).eq(3).click()

        }) 
    })

    /******************* Assertions on PGL field **************************/
    it('TC-214, Verify that the "PGL" value is not changing according to the change in the stepper if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.get(AllfarmsFarmBtn).eq(1).click({force:true})
            cy.get(AllfarmsStepper).eq(1).click({force:true})
            cy.get(PGLField).eq(0).should("have.attr", "value", "0")
            cy.get(detailsCrossBtn).eq(3).click()

        }) 
    })

    /******************* Assertions on the Max button **************************/
    it('TC-215, Verify that the "Max" button in the details section cannot populate the field with the maximum amount of the token if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.get(AllfarmsMaxBtn).eq(0).click({force:true})
            cy.get(AllfarmsMaxfield).eq(0).should("have.attr", "placeholder", "0.00")
            cy.get(detailsCrossBtn).eq(3).click()

        }) 
    })

    /******************* Assertions on Adding farm **************************/
    it('TC-216, Verify that the user cannot farm if the wallet is not connected', () => {
        cy.waitUntil( () => cy.get(cardTitleAllFarm)).each($titleAllFarm => {
            cy.get($titleAllFarm).find(seeDetailsBtn).click({force:true})
            cy.get(detailsTitle).should("contain","Details")
            cy.get(AllfarmsFarmBtn).eq(1).click({force:true})
            cy.get(AllfarmsConnectBtn).eq(1).should("contain",connectWalletTxt)
            cy.get(detailsCrossBtn).eq(3).click()
            
        }) 
    }) 

    /******************* Assertions on Pangolin Tokenlist **************************/
    it.only('TC-187,188,189,190,191,192,193,194,195,196 Verify that the "Pangolin Tokenlist" link appears on the dropdown', () => {
        cy.get(createPairBtn).contains(createPair).click({force:true})
        cy.get(createPairDropdown).eq(0).click()
        cy.get(createPairToken).contains("Pangolin Tokenlist").should("be.visible")
        cy.get(createPairToken).contains("Pangolin Tokenlist").click()
        cy.get(manageListsTitle).contains("Manage Lists").should("be.visible")
        cy.get(tokenLists).then($tokenlists => {
            if($tokenlists.length === 1){
                cy.get($tokenlists).find(dropdownArrow).click()
                cy.get(removeList).contains('Remove list').scrollIntoView().should('have.attr', 'disabled')
                cy.get(viewList).each(page => {
                    cy.request(page.prop('href')).as('link');
                });
                cy.get('@link').should(response => {
                    expect(response.status).to.eq(200);
                });
                cy.get(toggleTokenList).click()
                cy.get(toggleTokenList).should("have.css", "background-color", "rgb(255, 200, 0)")
            }
        })
        cy.get(tokenListSearch).eq(1).clear({force: true})
        cy.get(addBtn).should("have.css", "background-color", "rgb(229, 229, 229)")
        cy.wait(10000)
        cy.get(tokenListSearch).type(testnet)
        cy.wait(10000)
        cy.waitUntil(() => cy.get(addBtnEnabled)).contains("Add").should("have.css", "background-color", "rgb(255, 200, 0)")
        cy.get(addBtnEnabled).contains("Add").click({force: true})
        cy.get(addBtn).should("have.css", "background-color", "rgb(229, 229, 229)")
        cy.wait(5000)
        cy.get(testnetTokenlist).contains("Testnet Tokens").should("be.visible")
        cy.get(tokenLists).then($tokenlists => {
            if($tokenlists.length > 1){
                cy.get(toggleTokenList).eq(1).click({force: true})
                cy.get(toggleTokenList).eq(1).should("have.css", "background-color", "rgb(255, 200, 0)")
                cy.get(toggleTokenList).eq(1).click({force: true})
                cy.get(toggleTokenList).eq(1).should("have.css", "background-color", "rgb(206, 208, 217)")
                cy.get($tokenlists).find(dropdownArrow).eq(1).click({force: true})
                cy.window().then(function(p){
                    cy.stub(p, "prompt").returns("remove");
                    cy.get(removeListEnabled).scrollIntoView().contains('Remove list').scrollIntoView().click({force: true})
                 });
                 cy.get(testnetTokenlist).contains("Testnet Tokens").should("not.exist")
            }
        })
    }) 
})