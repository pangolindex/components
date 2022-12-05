/* eslint-disable max-lines */
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Button } from 'src/components/Button';
import { avalancheCore, bitKeep, gnosisSafe, hashConnect, injected, talisman, xDefi } from 'src/connectors';
import { AVALANCHE_CHAIN_PARAMS, IS_IN_IFRAME, SUPPORTED_WALLETS, WalletInfo } from 'src/constants';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { Box, Modal, ToggleButtons } from '../../';
import Option from './Option';
import PendingView from './PendingView';
import {
  CloseButton,
  ContentWrapper,
  HeaderRow,
  HoverText,
  ModalWrapper,
  OptionGrid,
  UpperSection,
  Wrapper,
} from './styles';
import { WalletModalProps } from './types';

enum CHAIN_TYPE {
  EVM_CHAINS = 'EVM CHAINS',
  NON_EVM_CHAINS = 'NON-EVM CHAINS',
}

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};

const getConnectorKey = (connector: AbstractConnector) =>
  Object.keys(SUPPORTED_WALLETS).find((key) => SUPPORTED_WALLETS[key].connector === connector) ?? null;

const WalletModal: React.FC<WalletModalProps> = ({
  open,
  closeModal,
  background,
  shouldShowBackButton,
  onWalletConnect,
  onClickBack,
}) => {
  // important that these are destructed from the account-specific web3-react context
  const { connector, activate, error: web3Error } = useWeb3React();

  const [walletType, setWalletType] = useState(CHAIN_TYPE.EVM_CHAINS as string);

  const [walletView, setWalletView] = useState('');

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();
  const [selectedOption, setSelectedOption] = useState<WalletInfo | undefined>();

  const [pendingError, setPendingError] = useState<boolean>();

  const [triedSafe, setTriedSafe] = useState<boolean>(!IS_IN_IFRAME);

  const walletModalOpen = open;

  const walletOptions = useMemo(() => {
    if (walletType === CHAIN_TYPE.EVM_CHAINS) {
      return Object.keys(SUPPORTED_WALLETS)
        .filter((key) => SUPPORTED_WALLETS[key].isEVM)
        .reduce((obj, key) => {
          obj[key] = SUPPORTED_WALLETS[key];
          return obj;
        }, {});
    } else {
      return Object.keys(SUPPORTED_WALLETS)
        .filter((key) => !SUPPORTED_WALLETS[key].isEVM)
        .reduce((obj, key) => {
          obj[key] = SUPPORTED_WALLETS[key];
          return obj;
        }, {});
    }
  }, [walletType]);

  const addAvalancheNetwork = useCallback(() => {
    connector?.getProvider().then((provider) => {
      provider
        ?.request({
          method: 'wallet_addEthereumChain',
          params: [AVALANCHE_CHAIN_PARAMS],
        })
        .then(() => {
          onWalletConnect(getConnectorKey(connector));
        })
        .catch((error: any) => {
          console.log(error);
        });
    });
  }, [connector]);

  // always reset to account view
  useEffect(() => {
    const name = Object.keys(SUPPORTED_WALLETS).find((key) => SUPPORTED_WALLETS[key].connector === connector);
    if (name) {
      const activeOption = SUPPORTED_WALLETS[name];

      if (activeOption && !activeOption?.isEVM) {
        setWalletType(CHAIN_TYPE.NON_EVM_CHAINS);
      } else {
        setWalletType(CHAIN_TYPE.EVM_CHAINS);
      }
    }

    if (walletModalOpen) {
      setPendingError(false);
      setWalletView('');
    }
  }, [walletModalOpen]);

  const mixpanel = useMixpanel();

  const isMetamask = window.ethereum && window.ethereum.isMetaMask;
  const isTalisman = window.ethereum && window.ethereum.isTalisman;
  const isRabby = window.ethereum && window.ethereum.isRabby;
  const isCbWalletDappBrowser = window?.ethereum?.isCoinbaseWallet;
  const isWalletlink = !!window?.WalletLinkProvider || !!window?.walletLinkExtension;
  const isCbWallet = isCbWalletDappBrowser || isWalletlink;
  const isAvalancheCore = window.avalanche && window.avalanche.isAvalanche;
  const isBitKeep = window.isBitKeep && !!window.bitkeep.ethereum;

  const tryActivation = async (
    activationConnector: AbstractConnector | SafeAppConnector | undefined,
    option: WalletInfo | undefined,
  ) => {
    const name = Object.keys(walletOptions).find((key) => walletOptions[key].connector === activationConnector);

    // log selected wallet
    setPendingWallet(connector); // set wallet for pending view
    setSelectedOption(option);
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (activationConnector instanceof WalletConnectConnector && activationConnector.walletConnectProvider?.wc?.uri) {
      activationConnector.walletConnectProvider = undefined;
    }

    if (!triedSafe && activationConnector instanceof SafeAppConnector) {
      activationConnector.isSafeApp().then((loadedInSafe) => {
        if (loadedInSafe) {
          activate(activationConnector, undefined, true)
            .then(() => {
              onWalletConnect(getConnectorKey(activationConnector));
              mixpanel.track(MixPanelEvents.WALLET_CONNECT, {
                wallet_name: option?.name?.toLowerCase() ?? name?.toLowerCase(),
                source: 'pangolin-components',
              });
            })
            .catch(() => {
              setTriedSafe(true);
            });
        }
        setTriedSafe(true);
      });
    } else if (activationConnector) {
      activate(activationConnector, undefined, true)
        .then(() => {
          if (isCbWallet) {
            addAvalancheNetwork();
          } else {
            onWalletConnect(getConnectorKey(activationConnector));
          }
          mixpanel.track(MixPanelEvents.WALLET_CONNECT, {
            wallet_name: option?.name ?? name?.toLowerCase(),
          });
        })
        .catch((error) => {
          if (error instanceof UnsupportedChainIdError) {
            activate(activationConnector); // a little janky...can't use setError because the connector isn't set
          } else {
            setPendingError(true);
          }
        });
    }
  };

  function getActiveOption(): WalletInfo | undefined {
    if (connector === injected) {
      if (isRabby) {
        return SUPPORTED_WALLETS.RABBY;
      } else if (isTalisman) {
        return SUPPORTED_WALLETS.TALISMAN;
      } else if (isBitKeep) {
        return SUPPORTED_WALLETS.BITKEEP;
      } else if (isMetamask) {
        return SUPPORTED_WALLETS.METAMASK;
      } else if (isAvalancheCore) {
        return SUPPORTED_WALLETS.AVALANCHECORE;
      }
      return SUPPORTED_WALLETS.INJECTED;
    }
    const name = Object.keys(walletOptions).find((key) => walletOptions[key].connector === connector);
    if (name) {
      return walletOptions[name];
    }
    return undefined;
  }

  //get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isXDEFI = window.ethereum && window.ethereum.isXDEFI;
    const activeOption = getActiveOption();

    return Object.keys(walletOptions).map((key) => {
      const option = walletOptions[key];
      // check for mobile options
      if (isMobile) {
        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector, option);
              }}
              id={`connect-${key}`}
              key={key}
              active={activeOption && option.name === activeOption.name}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={option.iconName}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        if (option.name === 'Rabby Wallet') {
          if (!isRabby) {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#7a7cff'}
                header={'Install Rabby Wallet'}
                subheader={null}
                link={'https://rabby.io/'}
                icon={option.iconName}
              />
            );
          }
        }

        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
                icon={option.iconName}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null;
        }

        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null;
        }
      }

      // overwrite injected when needed
      else if (option.connector === bitKeep) {
        if (!isBitKeep) {
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              color={'#7a7cff'}
              header={'Install BitKeep'}
              subheader={null}
              link={'https://bitkeep.com/'}
              icon={option.iconName}
            />
          );
        }
      } else if (option.connector === xDefi) {
        // don't show injected if there's no injected provider

        if (!window.xfi) {
          if (option.name === 'XDEFI Wallet') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#315CF5'}
                header={'Install XDEFI Wallet'}
                subheader={null}
                link={'https://www.xdefi.io/'}
                icon={option.iconName}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }

        // likewise for generic
        else if (option.name === 'Injected' && (isMetamask || isXDEFI)) {
          return null;
        }
      } else if (option.connector === talisman) {
        // provide talisman install link if not installed
        if (!window.talismanEth) {
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              color={option.color}
              header={'Install Talisman'}
              subheader={null}
              link={'https://talisman.xyz'}
              icon={option.iconName}
            />
          );
        }
      } else if (option.connector === hashConnect) {
        // provide hashpack install link if not installed

        if (!hashConnect.availableExtension) {
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              color={option.color}
              header={'Install Hashpack'}
              subheader={null}
              link={'https://www.hashpack.app/download'}
              icon={option.iconName}
            />
          );
        }
      }

      // overwrite avalanche when needed
      else if (option.connector === avalancheCore) {
        // don't show avalanche if there's no avalanche provider

        if (!window.avalanche) {
          if (option.name === 'Avalanche Core Wallet') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Avalanche Core Wallet'}
                subheader={null}
                link={'https://chrome.google.com/webstore/detail/core/agoakfejjabomempkjlepdflaleeobhb'}
                icon={option.iconName}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }
      }

      // Not show Gnosis Safe option without Gnosis Interface
      if (option.connector === gnosisSafe && !IS_IN_IFRAME) {
        return null;
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector !== connector && !option.href && tryActivation(option.connector, option);
            }}
            key={key}
            active={activeOption && option.name === activeOption.name}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={option.iconName}
          />
        )
      );
    });
  }

  const renderHeader = () => {
    if (web3Error) {
      return (
        <HeaderRow>{web3Error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error connecting'}</HeaderRow>
      );
    } else if (walletView === WALLET_VIEWS.PENDING || shouldShowBackButton) {
      return (
        <HeaderRow>
          <HoverText
            onClick={() => {
              if (onClickBack && shouldShowBackButton) {
                onClickBack();
              } else {
                setPendingError(false);
                setWalletView('');
              }
            }}
          >
            Back
          </HoverText>
        </HeaderRow>
      );
    } else {
      return (
        <HeaderRow>
          <HoverText>Connect to a wallet</HoverText>
        </HeaderRow>
      );
    }
  };

  const renderContent = () => {
    const isXDEFI = window.xfi && window.xfi.ethereum && window.xfi.ethereum.isXDEFI;
    const supportsAddNetwork = isMetamask || isCbWallet || isXDEFI || isTalisman || isBitKeep;

    if (web3Error) {
      return (
        <ContentWrapper>
          {web3Error instanceof UnsupportedChainIdError ? (
            <>
              <h5>Please connect to the appropriate Avalanche network.</h5>
              {supportsAddNetwork && (
                <Button variant="primary" onClick={addAvalancheNetwork}>
                  Switch to Avalanche Chain
                </Button>
              )}
            </>
          ) : (
            'Error connecting. Try refreshing the page.'
          )}
        </ContentWrapper>
      );
    } else {
      return (
        <ContentWrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              option={selectedOption}
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <>
              <Box mt="5px" width="100%" mb="5px">
                <ToggleButtons
                  options={[CHAIN_TYPE.EVM_CHAINS, CHAIN_TYPE.NON_EVM_CHAINS]}
                  value={walletType}
                  onChange={(value) => {
                    setWalletType(value);
                  }}
                />
              </Box>
              <OptionGrid>{getOptions()}</OptionGrid>
            </>
          )}
        </ContentWrapper>
      );
    }
  };

  function getModalContent() {
    return (
      <UpperSection>
        <ModalWrapper>
          {renderHeader()}

          <CloseButton onClick={closeModal} />
        </ModalWrapper>

        {renderContent()}
      </UpperSection>
    );
  }

  return (
    <Modal
      isOpen={walletModalOpen}
      onDismiss={() => {
        closeModal();
      }}
    >
      <Wrapper background={background}>{getModalContent()}</Wrapper>
    </Modal>
  );
};
export default WalletModal;
/* eslint-enable max-lines */
