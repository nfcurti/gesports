import Head from 'next/head'
import { useEffect, useState } from "react";
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import ReactTypingEffect from 'react-typing-effect';
import Countdown from 'react-countdown';
import ContractData from '../config/Contract.json';
const Web3 = require('web3');
import detectEthereumProvider from '@metamask/detect-provider'

export default function Home() {
  const [userAddress, setUserAddress] = useState('CONNECT');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [heroIndex, setHeroIndex] = useState(1);
  const [mintAmount, setMintAmount] = useState(1);
  const [heroTab, setHeroTab] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [faqtab, setFaqtab] = useState(1);

  const _chainIdToCompare = 1; //Ethereum
  //const _chainIdToCompare = 1; //Rinkeby
  const sleep = async( ms) => {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}

      // Renderer callback with condition
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <div ><div class="number">
                <p className={styles.main_mint_s} onClick={() => { 
                    setMintAmount(mintAmount == 20 ? 20 : mintAmount+1) ;

                }}>+</p>
                <input type="text" value={`${mintAmount}`}/>
                <p className={styles.main_mint_s} onClick={() => { 
                    setMintAmount(mintAmount == 0 ? 0 : mintAmount-1) ;

                }}>-</p>
            </div>
            <button className={styles.mint_button} onClick={()=>mint(mintAmount)}> Mint {mintAmount}</button>
</div>;
    } else {
      // Render a countdown
      return <p className={styles.cd}>{days} days {hours} hs {minutes} min {seconds} sec</p>;
    }
  };

  const galleryCount = async (thisHI) => {
  	const _ = setTimeout(() => {
		
			  	setHeroIndex(thisHI + 1)

			  	galleryCount(thisHI == 5 ? 1 : thisHI + 1)
	  	}, 800);
	  }

	  useEffect(async()=>{
	  	galleryCount(1);
	}, [])

      useEffect(async () => {
    loadIndependentData();
  }, []);

  const loadIndependentData = async() => {
    var currentProvider = new Web3.providers.HttpProvider(`https://${_chainIdToCompare == 1 ? 'mainnet' : 'rinkeby'}.infura.io/v3/be634454ce5d4bf5b7f279daf860a825`);
    const web3 = new Web3(currentProvider);
    const contract = new web3.eth.Contract(ContractData.abi, ContractData.address);


      const maxSupply = await contract.methods.maxSupply().call();
      const totalSupply = await contract.methods.totalSupply().call();
  }

      const requestAccountMetamask = async() => {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if(accounts.length > 0) {
        setUserAddress(accounts[0]);

        const chainId = await ethereum.request({ method: 'eth_chainId' });
        handleChainChanged(chainId);

        ethereum.on('chainChanged', handleChainChanged);

        function handleChainChanged(_chainId) {
          if(_chainId != _chainIdToCompare) {
            window.location.reload();
          }
        }

        ethereum.on('accountsChanged', handleAccountsChanged);

        async function handleAccountsChanged(accounts) {
          if (accounts.length === 0) {
            setUserAddress('');
            
            // loadDataAfterAccountDetected();
          } else if (accounts[0] !== userAddress) {
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            setUserAddress(chainId == _chainIdToCompare ? accounts[0] : 'CONNECT');
            
            
          }
        }
      }
    }

  const connectMetamaskPressed = async () => {
    try { 
      await window.ethereum.enable();
      requestAccountMetamask();
   } catch(e) {
      // User has denied account access to DApp...
   }
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x'+_chainIdToCompare }],
      });
      requestAccountMetamask();
    } catch (error) {
      
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: '0x'+_chainIdToCompare, rpcUrl: 'https://...' /* ... */ }],
          });
          requestAccountMetamask();
        } catch (addError) {
        }
      }
    }
  }

  const mint = async(mintValue) => {
    if(userAddress == 'CONNECT') {
      return alert('User is not connected');
    }
    
    if(mintValue == 0) { return; }
    setIsLoading(true);
    const provider = await detectEthereumProvider()
  
    if (provider && userAddress!='CONNECT') {
      const web3 = new Web3(provider);
      const contract = new web3.eth.Contract(ContractData.abi, ContractData.address);

      const _priceWei = await contract.methods.getCurrentPrice().call();
      
      try{
        var block = await web3.eth.getBlock("latest");
      var gasLimit = block.gasLimit/block.transactions.length;
      const gasPrice = await contract.methods.mint(
        mintValue
      ).estimateGas({from: userAddress, value: (mintValue*_priceWei)});

      await contract.methods.mint(
        mintValue
      ).send({
        from: userAddress,
        value: (mintValue*_priceWei),
        gas: gasPrice,
        gasLimit: gasLimit
      });
      alert('Minted successfuly!');
      setIsLoading(false);
      window.location.reload();
    }catch(e){
      alert('An error has happened, connect your wallet with enough funds')
    }
    }
  }



  return (
    <div className={styles.page}>
        <Head>
          <title>Gamers Guild - 32bit NFT collection by Global Esports</title>
          <meta name="description" content="Gamers Guild - 32bit NFT collection by Global Esports" />
          <link rel="icon" href="/log.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </Head>
        <nav className={styles.navbar}>
            <img  src='/log.png'/>
            <ul>
                <li><a href='#about'>About</a></li>
                <li><a href='#roadmap'>Roadmap</a></li>
                <li><a href='#faq'>FAQ</a></li>
                <li><a href='#team'>Team</a></li>
                <li className={styles.social}>
                    <a href='https://twitter.com/GamersGuildXYZ' target="_blank"><img src='/icons8-twitter.svg'/></a>
                    <a href='https://discord.gg/rUJEDN3Y9k' target="_blank"><img src='/icons8-discord (1).svg'/></a>
                    <a href='https://instagram.com/GamersGuildXYZ' target="_blank"><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.youtube.com/channel/UCN79toUwMUdTrO0zivSFV9A' target="_blank"><img src='/icons8-youtube.svg'/></a>
                  </li>
            </ul>
            <button onClick={ () => {
            connectMetamaskPressed();
          }} className={styles.connect_button}>{userAddress=='CONNECT' ? 'Connect':`${userAddress.substring(0,3)}...${userAddress.substr(-3)}`}</button>
        </nav>
        <div className={styles.hero}>
            <img  src={`/Group 1.svg`}/>
            <img  src={`/Group 1 (1).svg`}/>
            <p>
{heroTab ? 
            <ReactTypingEffect speed={100} eraseSpeed={30} eraseDelay={1500}  text={["Hey there traveler, want to learn about gamers guild?"]}/>
            :
            <ReactTypingEffect speed={100} eraseSpeed={30} text={["Mint will commence soon!"]}/>

}
              </p>
            
            <p style={{Cursor:'pointer'}} onClick={() => { setHeroTab(!heroTab)}}>{heroTab ? '--- PRESS TO CONTINUE ---':''}

            </p>
        </div>
        <div id='about' className={styles.main}>
            <div className={styles.main_wrapper}>
                <h1>Gamers Guild NFT</h1>
                <p>Gamers Guild NFT is a 10,000 Generative Retro Gaming Pixel Art Collection by Global Esports.</p><p> Each 'Gamer' is a nostalgic reminder of the games we all played growing up in the 90's, which not only includes a gorgeous PFP but also all of the Esports Utility we will be building into the smart contract, giving exclusive access to become an active part in one of the fastest growing industries in the world - Esports.</p>
            </div>
        </div>
        <div className={styles.main_gallery}>
        	<img src={`/Classes/nft-5433_Human.png`}/>
        	<img src={`/Classes/nft-4034_Elf.png`}/>
        	<img src={`/Classes/nft-5835_Human.png`}/>
            <img src={`/Classes/nft-8204_Undead.png`}/>
            <img src={`/Classes/nft-9583_Orc.png`}/>
            <img src={`/Demi Gods/GG NFT  (10).jpg`}/>
        </div>
        <div className={styles.main_mint}>
        	<h1>MINT YOUR OWN</h1>
            <span>10,000 Remaining</span>
        	<p className={styles.main_mint_p}>After countdown ends, all 10,000 characters will be available to mint right away</p>
        	
            <Countdown date={1643040737000} renderer={renderer}/>
            

        </div>
        <div id='rarity' className={styles.intro}>
        	<h1>Classes</h1>
            <div className={styles.race_wrap}>
            <p className={styles.intro_text}>Our project is divided into 5 Character Classes - Humans, Elves, Orcs, Undead & Demi-Gods. Each Character Class will have 2480 Gamers - These '9920 Gamers' which will be randomly generated with a combination of 200+ traits while the 80 Demi-Gods will each be unique 1/1s</p>
            
            <p className={styles.intro_text}>The Demi-Gods are being summoned to Earth from the world of Video Games to find the best gamers and have them compete in a series of tournaments to determine the Winner!</p>
            
            </div>
            <div className={styles.race_wrapper}>
                <div className={styles.race_item}>
                    <img src='/Classes/nft-5532_Human.png'/>
                    <span style={{marginTop:'1em'}}>Humans</span>
                </div>
                <div className={styles.race_item}>
                    <img src='/Classes/nft-6229_Orc.png'/>
                    <span style={{marginTop:'1em'}}>Orcs</span>
                </div>
                <div className={styles.race_item}>
                    <img src='/Classes/nft-6489_Elf.png'/>
                    <span style={{marginTop:'1em'}}>Elves</span>
                </div>
                <div className={styles.race_item}>
                    <img src='/Classes/nft-626_Undead.png'/>
                    <span style={{marginTop:'1em'}}>Undead</span>
                </div>
                <div className={styles.race_item}>
                    <img src='/Demi Gods/GG NFT  (5).png'/>
                    <span style={{marginTop:'1em'}}>Demi-Gods</span>
                </div>
            </div>
            <img className={styles.rarity_chart} src='/raritychart.png'/>
            <div className={styles.traits_wrapper}>
                <div>
                    <img style={{width:'60vh'}} src='/rarpng.png'/>
                </div>
                <div styles={{textAlign:'initial'}}>
                    <h1>Traits</h1>
                    <p className={styles.intro_text} >Each Gamer collectible is a unique and randomly generated from houndreds of traits. This traits include background, headwear, race, and much more!</p>
                    <p className={styles.intro_text} >There are 4 primary rarity traits - Uncommon, Rare, Epic & Legendary.</p>
                </div>
            </div>
        </div>

        <div id='roadmap' className={styles.roadmap}>
        	<img src='/Roadmap_GE.png'/>
        </div>

        <div className={styles.main}>
            <div className={styles.main_wrapper2}>
                <h3>What is Global Esports?</h3>
            <div className={styles.whatis}>
                    <a href='https://twitter.com/GlobalEsportsIn'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://discord.gg/globalesports'><img src='/icons8-discord (1).svg'/></a>
                    <a href='https://instagram.com/GlobalEsportsIn'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://youtube.com/GlobalEsportsIn'><img src='/icons8-youtube.svg'/></a>
                  </div>
                <p>Global Esports is India’s most premium Esports Org with almost 5 years of Heritage in PC, Mobile & Console Games making us one of the longest standing orgs in the region.</p><br/><br/>
                <p>The organization is built with the sole focus of providing a platform to talent in the esports ecosystem and creating long term sustainable career opportunities for Gamers</p>
                <div className={styles.stats}>
                    <div className={styles.stats_item}>
                        <p>26</p>
                        <span>Teams</span>
                    </div>
                    <div className={styles.stats_item}>
                        <p>25M</p>
                        <span>Social Media Reach</span>
                    </div>
                    <div className={styles.stats_item}>
                        <p>$500K+</p>
                        <span>$ in prizes</span>
                    </div>
                </div>
                <div className={styles.stats}>
                    <div className={styles.stats_item}>
                        <p>71%</p>
                        <span>Win Rate</span>
                    </div>
                    <div className={styles.stats_item}>
                        <p>75+</p>
                        <span>International Events</span>
                    </div>
                    <div className={styles.stats_item}>
                        <p>200+</p>
                        <span>Tournament Wins</span>
                    </div>
                </div>
            </div>
        </div>
          <div id='faq' className={styles.faq}>
            <h1>FAQ</h1>
            <div className={styles.faq_box}>
                <div onClick={() => {if(faqtab!=1){setFaqtab(1)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>What is an NFT?<span>{faqtab!=1 ? '+':'-'}</span></h4>
                  {faqtab==1 ?
                  <p>An NFT, or non-fungible token, is a unique, identifiable digital asset stored on the blockchain. An NFT could be a piece of digital artwork, a collectible, or even a digital representation of a real-life physical asset. Ownership of an NFT is easily and uniquely verifiable due to its public listing on the blockchain. </p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=2){setFaqtab(2)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>What does it mean to mint an NFT?<span>{faqtab!=2 ? '+':'-'}</span></h4>
                  {faqtab==2 ?
                  <p>Minting refers to the process of tokenizing a digital file, or a digital piece of art, and publishing it on the blockchain. Once an NFT is minted, you can verify ownership and buy, sell, and trade the NFT. </p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=3){setFaqtab(3)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>How much does it cost to mint a Gamers Guild NFT?<span>{faqtab!=3 ? '+':'-'}</span></h4>
                  {faqtab==3 ?
                  <p>Price will be the same for everyone, 0.081217ETH + gas fees per mint</p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=4){setFaqtab(4)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>How do I mint?<span>{faqtab!=4 ? '+':'-'}</span></h4>
                  {faqtab==4 ?
                  <p>After countdown has run out in the "Mint" section of the website, a mint button will pop up letting users mint up to 20x NFTs at once. Remember you must have enough ETH in your wallet otherwise the button will not work</p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=5){setFaqtab(5)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>What can I do with my newly minted NFTs?<span>{faqtab!=5 ? '+':'-'}</span></h4>
                  {faqtab==5 ?
                  <p>Minting one of our NFTs will grant you access to many perks including taking part in the decission making of certain aspects of the organization and get a share of the revenue as well. Otherwise, you can sell it on the secondary market for a profit on OpenSea.</p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=6){setFaqtab(6)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>When will the NFTs be revealed?<span>{faqtab!=6 ? '+':'-'}</span></h4>
                  {faqtab==6 ?
                  <p>We will be revealing each and everyone of the NFTs at the time of sellout so we can guarantee a fair mint to everyone instead of having acknowledgable users snipe the rarest ones.</p>
                  :''}
                </div>
                
            </div>
          </div>



          <div id='team' className={styles.team}>
            <h1>Team</h1>
            <div className={styles.race_wrapper}>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/rushindra.png'/>
                    <span style={{marginTop:'1em'}}>Dr Rushindra Sinha</span>
                    <span style={{marginTop:'1em'}}>CEO, Founder</span>
            <div className={styles.whatis_team}>
                    <a href='https://twitter.com/RushindraSinha'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://www.linkedin.com/in/rushindrasinha/'><img src='/icons8-linkedin.svg'/></a>
                    <a href='https://www.instagram.com/rushindrasinha/'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.youtube.com/c/RushindraSinha'><img src='/icons8-youtube.svg'/></a>
                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/mohit.png'/>
                    <span style={{marginTop:'1em'}}>Mohit Israney</span>
                    <span style={{marginTop:'1em'}}>MD, Founder</span>
                  <div className={styles.whatis_team}>
                    <a href='https://twitter.com/mohitisraney'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://www.linkedin.com/in/rushindrasinha/'><img src='/icons8-linkedin.svg'/></a>
                    <a href='https://www.instagram.com/mohitisraney/'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.youtube.com/user/mohitisraney'><img src='/icons8-youtube.svg'/></a>
                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/emi.png'/>
                    <span style={{marginTop:'1em'}}>Rahul Hinduja</span>
                    <span style={{marginTop:'1em'}}>COO, Founding Member</span>
                  <div className={styles.whatis_team}>
                    <a href='https://twitter.com/RahulMHinduja'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://www.linkedin.com/in/rahulhinduja/'><img src='/icons8-linkedin.svg'/></a>
                    <a href='https://www.instagram.com/rahulmhinduja/'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.youtube.com/c/rahulhinduja'><img src='/icons8-youtube.svg'/></a>
                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/nico.jpg'/>
                    <span style={{marginTop:'1em'}}>NicoC</span>
                    <span style={{marginTop:'1em'}}>Lead Developer</span>
                  <div className={styles.whatis_team}>
                    <a href='https://twitter.com/CurtiNico'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://github.com/nfcurti/'><img src='/icons8-github.svg'/></a>
                    <a href='https://www.youtube.com/channel/UCBqpagxGZpP7d-EPe8AmFkA'><img src='/icons8-youtube.svg'/></a>
                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/juandox.png'/>
                    <span style={{marginTop:'1em'}}>Juan</span>
                    <span style={{marginTop:'1em'}}>Backend Developer</span>
                  <div className={styles.whatis_team}>
                    <a href='https://twitter.com/Macur22'><img src='/icons8-twitter.svg'/></a>

                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/rj.png'/>
                    <span style={{marginTop:'1em'}}>RJ</span>
                    <span style={{marginTop:'1em'}}>Artist</span>
                  <div className={styles.whatis_team}>
                    <a href='https://twitter.com/Reeljoos'><img src='/icons8-twitter.svg'/></a>
                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/rahul2.jpg'/>
                    <span style={{marginTop:'1em'}}>Rahul Rangnani</span>
                    <span style={{marginTop:'1em'}}>Jr Artist</span>
                  <div className={styles.whatis_team}>
                    <a href='https://www.instagram.com/that_rangnani_draws/'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.linkedin.com/in/rangnanirahul/'><img src='/icons8-youtube.svg'/></a>
                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/Satyen.png'/>
                    <span style={{marginTop:'1em'}}>Satyen Poojary</span>
                    <span style={{marginTop:'1em'}}>Strategy</span>
                  <div className={styles.whatis_team}>
                    <a href='https://twitter.com/satyenpoojary'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://www.linkedin.com/in/satyenpoojary/'><img src='/icons8-linkedin.svg'/></a>
                    <a href='https://www.instagram.com/satyenpoojary/'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.youtube.com/c/rahulhinduja'><img src='/icons8-youtube.svg'/></a>
                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/vatsal.png'/>
                    <span style={{marginTop:'1em'}}>Vatsal Uniyal</span>
                    <span style={{marginTop:'1em'}}>Head of Esports</span>
                  <div className={styles.whatis_team}>
                    <a href='https://twitter.com/Nghtmre2k'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://www.linkedin.com/in/vatsal-uniyal-b79570bb/'><img src='/icons8-linkedin.svg'/></a>
                    <a href='https://www.instagram.com/vatsaluniyal/'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.youtube.com/channel/UCVJsQ9wp2kB73rLNsE5U0fw'><img src='/icons8-youtube.svg'/></a>
                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/gary.png'/>
                    <span style={{marginTop:'1em'}}>Gary Chiu</span>
                    <span style={{marginTop:'1em'}}>Content</span>
                  <div className={styles.whatis_team}>
                    <a href='https://twitter.com/Chiukuqchin'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://www.linkedin.com/in/vatsal-uniyal-b79570bb/'><img src='/icons8-linkedin.svg'/></a>
                    <a href='https://www.instagram.com/officialmioken/'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.youtube.com/channel/UCVJsQ9wp2kB73rLNsE5U0fw'><img src='/icons8-youtube.svg'/></a>
                  </div>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/jaideep.png'/>
                    <span style={{marginTop:'1em'}}>Jaideep Sood</span>
                    <span style={{marginTop:'1em'}}>Operations</span>
                  <div className={styles.whatis_team}>
                    <a href='https://twitter.com/sood_jaideep'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://www.linkedin.com/in/jaideep-s-27261436/'><img src='/icons8-linkedin.svg'/></a>
                    <a href='https://www.instagram.com/Soodjaideep/'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.youtube.com/c/GEJaideepSood'><img src='/icons8-youtube.svg'/></a>
                  </div>
                </div>
            </div>
          </div>


        <footer className={styles.footer}>
            <img  src='/log.png'/><br/>
            <div>
                    <a href='https://twitter.com/GamersGuildXYZ'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://discord.gg/rUJEDN3Y9k'><img src='/icons8-discord (1).svg'/></a>
                    <a href='https://instagram.com/GamersGuildXYZ'><img src='/icons8-instagram.svg'/></a>
                    <a href='https://www.youtube.com/channel/UCN79toUwMUdTrO0zivSFV9A'><img src='/icons8-youtube.svg'/></a>
                  </div><br/>
            <p>@2021 Global Esports</p>
        </footer>
    </div>
  )
}
