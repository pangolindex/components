/* eslint-disable max-lines */
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import React, { useEffect, useMemo, useState } from 'react';
import { isMobile } from 'react-device-detect';
import ReactGA from 'react-ga';
import { Button } from 'src/components/Button';
import { gnosisSafe, injected, xDefi, avalancheCore } from 'src/connectors';
import { AVALANCHE_CHAIN_PARAMS, IS_IN_IFRAME, LANDING_PAGE, SUPPORTED_WALLETS, WalletInfo } from 'src/constants';
import { ExternalLink } from 'src/theme';
import { Box, Modal, ToggleButtons } from '../../';
import Option from './Option';
import PendingView from './PendingView';
import {
  Blurb,
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

const WALLET_TUTORIAL = `${LANDING_PAGE}/tutorials/getting-started/#set-up-metamask`;

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

  console.log('connector====', connector);

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

  function addAvalancheNetwork() {
    injected.getProvider().then((provider) => {
      provider
        ?.request({
          method: 'wallet_addEthereumChain',
          params: [AVALANCHE_CHAIN_PARAMS],
        })
        .then(() => {
          onWalletConnect();
        })
        .catch((error: any) => {
          console.log(error);
        });
    });
  }

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

  const isMetamask = window.ethereum && window.ethereum.isMetaMask;
  const isRabby = window.ethereum && window.ethereum.isRabby;
  const isCbWalletDappBrowser = window?.ethereum?.isCoinbaseWallet;
  const isWalletlink = !!window?.WalletLinkProvider || !!window?.walletLinkExtension;
  const isCbWallet = isCbWalletDappBrowser || isWalletlink;
  const isAvalancheCore = window.avalanche && window.avalanche.isAvalanche;

  const tryActivation = async (
    activationConnector: AbstractConnector | SafeAppConnector | undefined,
    option: WalletInfo | undefined,
  ) => {
    const name = Object.keys(walletOptions).find((key) => walletOptions[key].connector === activationConnector);

    // log selected wallet
    // eslint-disable-next-line import/no-named-as-default-member
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name,
    });
    setPendingWallet(connector); // set wallet for pending view
    setSelectedOption(option);
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (activationConnector instanceof WalletConnectConnector && activationConnector.walletConnectProvider?.wc?.uri) {
      activationConnector.walletConnectProvider = undefined;
    }

    console.log('activationConnector', activationConnector);

    if (!triedSafe && activationConnector instanceof SafeAppConnector) {
      console.log('1===');
      activationConnector.isSafeApp().then((loadedInSafe) => {
        if (loadedInSafe) {
          activate(activationConnector, undefined, true)
            .then(() => {
              onWalletConnect();
            })
            .catch(() => {
              setTriedSafe(true);
            });
        }
        setTriedSafe(true);
      });
    } else if (activationConnector) {
      console.log('2===', activationConnector);
      activate(activationConnector, undefined, true)
        .then(() => {
          console.log('2-1...====');
          if (isCbWallet) {
            addAvalancheNetwork();
          } else {
            console.log('askdjhklasdjklsajd======');
            onWalletConnect();
          }
        })
        .catch((error) => {
          console.log('error', error);
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
      } else if (isMetamask) {
        return SUPPORTED_WALLETS.METAMASK;
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
      else if (option.connector === xDefi) {
        // don't show injected if there's no injected provider

        if (!(window.xfi && window.xfi.ethereum && window.xfi.ethereum.isXDEFI)) {
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
      }

      // overwrite avalanche when needed
      else if (option.connector === avalancheCore) {
        // don't show avalanche if there's no avalanche provider

        console.log('window.avalanche==', window.avalanche);
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
    const isMetamaskOrCbWallet = isMetamask || isCbWallet || isXDEFI;
    if (web3Error) {
      return (
        <ContentWrapper>
          {web3Error instanceof UnsupportedChainIdError ? (
            <>
              <h5>Please connect to the appropriate Avalanche network.</h5>
              {isMetamaskOrCbWallet && (
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
          {walletView !== WALLET_VIEWS.PENDING && (
            <Blurb>
              <span>New to Avalanche? &nbsp;</span>{' '}
              <ExternalLink href={WALLET_TUTORIAL}>Learn more about setting up a wallet</ExternalLink>
            </Blurb>
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
