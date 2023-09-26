import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
/* ABIファイルを含むWavePortal.jsonファイルをインポートする*/
import abi from "./utils/SocialNetwork.json";

const App = () => {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義 */
  const [currentAccount, setCurrentAccount] = useState("");
  /* ユーザーのメッセージを保存するために使用する状態変数を定義 */
  const [messageValue, setMessageValue] = useState("");
  /* すべてのpostsを保存する状態変数を定義 */
  const [allPosts, setAllPosts] = useState([]);
  /* ユーザーがいいねしているかどうか保存する状態変数をすべてのpostsに対して定義 */
  const [isLiked, setIsLiked] = useState([]);
  /* ソート基準を保存する状態変数を定義 */
  const [sortOption, setsortOption] = useState("time");

  /* デプロイされたコントラクトのアドレスを保持する変数を作成 */
  const contractAddress = "0x31c18CB7F24C590fB1E12c4132eF1D83e8a4C498";
  /* コントラクトからすべてのwavesを取得するメソッドを作成 */
  /* ABIの内容を参照する変数を作成 */
  const contractABI = abi.abi;

  const sortPostsByTime = async () => {
    allPosts.sort((a,b) => a.time - b.time);
  }

  const sortPostsByLikes = async () => {
    allPosts.sort((a,b) => a.likes - b.likes);
  }

  const unlike = async (id) => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const SocialNetworkContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        const postTxn = await SocialNetworkContract.unlike(id, {
          gasLimit: 300000,
        });
        console.log("Mining...", postTxn.hash);
        await postTxn.wait();
        console.log("Mined -- ", postTxn.hash);
        const isLiked = await SocialNetworkContract.getLikedStates(currentAccount);
        setIsLiked(isLiked);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const like = async (id) => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const SocialNetworkContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        
        const postTxn = await SocialNetworkContract.like(id, {
          gasLimit: 300000,
        });
        console.log("Mining...", postTxn.hash);
        await postTxn.wait();
        console.log("Mined -- ", postTxn.hash);
        const isLiked = await SocialNetworkContract.getLikedStates(currentAccount);
        setIsLiked(isLiked);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const getAllPosts = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const SocialNetworkContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const posts = [];
        /* コントラクトからgetPostメソッドを再帰的に呼び出す */
        const lastId = await SocialNetworkContract.getLastPostId();
        for (let i = 1; i <= lastId; i++) {
          let post = await SocialNetworkContract.getPost(i);
          let likes = await SocialNetworkContract.getTotalLikesbyPost(i);
          let postObject = {
            poster: post.poster, 
            message: post.message,
            time: new Date(post.time * 1000),
            id: i,
            likes: likes
          };
          posts.push(postObject);
          console.log(postObject.poster, postObject.message, postObject.time, postObject.id);
        }
        console.log("Current Account:", currentAccount);
        const isLiked = await SocialNetworkContract.getLikedStates(await ethers.utils.getAddress(currentAccount));
        console.log("LikedStates", isLiked);
        /* React Stateにデータを格納する */
        setAllPosts(posts);
        setIsLiked(isLiked);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const post = async () => {
    try {

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        /* ABIを参照 */
        const SocialNetworkContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const postTxn = await SocialNetworkContract.post(messageValue, {
          gasLimit: 300000,
        });
        console.log("Mining...", postTxn.hash);
        await postTxn.wait();
        let textarea = document.getElementById("textarea");
        textarea.value = "";
        setMessageValue("");
        console.log("Mined -- ", postTxn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   `emit`されたイベントをフロントエンドに反映させる
   */
  
  useEffect(() => {

    checkIfWalletIsConnected();

    let SocialNetworkContract;

    const onNewPost = () => {
      console.log("NewPost");
      getAllPosts();
    };

    const onNewLike = () => {
      console.log("NewLike");
      getAllPosts();
    }

    const onNewUnlike = () => {
      console.log("NewUnlike");
      getAllPosts();
    }

    /* NewPostイベントがコントラクトから発信されたときに、情報をを受け取ります */
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      SocialNetworkContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      SocialNetworkContract.on("NewPost", onNewPost);
      SocialNetworkContract.on("NewLike", onNewLike);
      SocialNetworkContract.on("NewUnlike", onNewUnlike);
    }
    /*メモリリークを防ぐために、NewPostのイベントを解除します*/
    return () => {
      if (SocialNetworkContract) {
        SocialNetworkContract.off("NewPost", onNewPost);
        SocialNetworkContract.off("NewLike", onNewLike);
        SocialNetworkContract.off("NewUnlike", onNewUnlike);
      }
    };

  }, [currentAccount]);

  /* window.ethereumにアクセスできることを確認する関数を実装 */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認 */
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllPosts();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* connectWalletメソッドを実装 */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
    <div className="hero is-info is-bold">
      <div className="hero-body is-flex">
        <div className="container is-half">
         <h1 className="title">分散型掲示板</h1>
         <h2 className="subtitle">オンチェーン保存(Sepolia Testnet)</h2>
       </div>
       <div className="container is-half">
       {!currentAccount && (
        <button className="button is-primary is-pulled-right" onClick={connectWallet} >
            ウォレットを接続してください
        </button>
       )}
       {currentAccount && (
        <button className="button is-primary is-pulled-right">ウォレット接続済み</button>
       )}
       </div>
     </div>
   </div>
   <div className="section">
     <div className="container is-flex">
      <div className="column is-half">
       <h3 className="title">投稿フォーム</h3>
      </div>
       <div className="column is-half">
       <div className="column is-2 is-pulled-right">
       <button className="button is-primary is-pulled-right" onClick={post}  >
            投稿する
        </button>
       <div className="column is-10"></div>
      </div>
      </div>
      </div>
       <div className="column">
        <div className="field">
             <label className="label">メッセージ</label>
             <div className="control">
               <textarea id="textarea" className="textarea" placeholder="メッセージを入力してください" onChange={(e) => setMessageValue(e.target.value)} value={messageValue} ></textarea>
             </div>
        </div>   
       </div>
   </div>
    <div className="container">
    <div className="column is-2 is-pulled-right">
    <select value={sortOption} className="select is-medium" onChange={(e) => {
      const selectedOption = e.target.value;
      if (selectedOption == "time") {
        sortPostsByTime();
        console.log("Sorted by Time");
        setsortOption("time");
      } else if (selectedOption == "likes"){
        sortPostsByLikes();
        console.log("Sorted by Likes");
        setsortOption("likes");
      }
     }}
     >
      <option value="time">投稿順</option>
      <option value="likes">いいね順</option>
    </select>
     </div>
     <div className="column is-10"></div>
     </div>
   <div className="section">
     <div className="container">
     {  allPosts
            .slice(0)
            .reverse()
            .map((post, index) => (
              <div key={index} className="box is-flex">
                <div className="container is-half">
                  <div>ID: {post.id.toString()}</div>
                  <div>Address: {post.poster}</div>
                  <div>Message: {post.message}</div>
                  <div>Time: {post.time.toUTCString()}</div>
                </div>
                {!isLiked[post.id - 1] &&
                  (<div className="container is-half">
                    <button className="button is-primary is-pulled-right" onClick={() => like(post.id)} >いいねする（{post.likes.toString()}）</button>
                  </div>)
                }
                {isLiked[post.id - 1] &&
                  (<div className="container is-half">
                  <button className="button is-primary is-pulled-right" onClick={() => unlike(post.id)} >いいねを取り消す（{post.likes.toString()}）</button>
                  </div>)
                }
              </div>
            ))}
    </div>
  </div>
 </div>
  );
}

export default App;
